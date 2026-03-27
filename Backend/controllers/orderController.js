import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { generateOrderNumber } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

const ORDER_STATUSES = ["reserved", "ready_for_pickup", "collected", "cancelled", "revoked"];
const ACTIVE_RESERVATION_STATUSES = ["reserved", "ready_for_pickup"];
const TERMINAL_STATUSES = ["collected", "cancelled", "revoked"];

const isOverdueReservation = (order) =>
  ACTIVE_RESERVATION_STATUSES.includes(order.status) &&
  order.reservationExpiresAt &&
  new Date(order.reservationExpiresAt).getTime() < Date.now();

const rollbackReservedStock = async (reservedItems) => {
  await Promise.all(
    reservedItems.map(({ productId, quantity }) =>
      Product.findByIdAndUpdate(productId, {
        $inc: { stockQuantity: quantity },
      })
    )
  );
};

const restoreOrderStock = async (order) => {
  await Promise.all(
    order.products.map(async (item) => {
      const product = await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });

      if (product) {
        logger.info("Stock returned for product", {
          productId: product._id,
          quantity: item.quantity,
        });
      }
    })
  );
};

const serializeOrder = (order) => ({
  ...order.toObject(),
  isOverdue: isOverdueReservation(order),
});

const canTransition = (currentStatus, nextStatus) => {
  const transitions = {
    reserved: ["reserved", "ready_for_pickup", "collected", "cancelled", "revoked"],
    ready_for_pickup: ["ready_for_pickup", "collected", "cancelled", "revoked"],
    collected: ["collected"],
    cancelled: ["cancelled"],
    revoked: ["revoked"],
  };

  return transitions[currentStatus]?.includes(nextStatus);
};

export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, contactPhone, notes } = req.body;
    const userId = req.user.id;
    const resolvedPhone = String(contactPhone || req.user.phone || "").trim();

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products are required",
      });
    }

    if (!resolvedPhone) {
      return res.status(400).json({
        success: false,
        message: "A customer phone number is required for reservation follow-up",
      });
    }

    let totalAmount = 0;
    const orderProducts = [];
    const reservedItems = [];

    for (const item of products) {
      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        await rollbackReservedStock(reservedItems);
        return res.status(400).json({
          success: false,
          message: "Each reservation item must include a valid quantity",
        });
      }

      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stockQuantity: { $gte: quantity },
          isActive: true,
        },
        { $inc: { stockQuantity: -quantity } },
        { new: true }
      );

      if (!product) {
        await rollbackReservedStock(reservedItems);
        const existingProduct = await Product.findById(item.productId).select("name stockQuantity");

        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.productId} not found`,
          });
        }

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${existingProduct.name}. Available: ${existingProduct.stockQuantity}, Requested: ${quantity}`,
        });
      }

      totalAmount += product.price * quantity;
      orderProducts.push({
        product: product._id,
        quantity,
        price: product.price,
      });
      reservedItems.push({
        productId: product._id,
        quantity,
      });
    }

    const order = new Order({
      orderNumber: generateOrderNumber(),
      user: userId,
      products: orderProducts,
      totalAmount,
      shippingAddress: shippingAddress || {},
      contactPhone: resolvedPhone,
      bookingType: "shop_reservation",
      paymentMethod: "pay_at_store",
      paymentStatus: "not_applicable",
      status: "reserved",
      reservationExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      notes,
    });

    try {
      await order.save();
    } catch (error) {
      await rollbackReservedStock(reservedItems);
      throw error;
    }

    await order.populate("products.product", "name price stockQuantity unit");

    logger.info("Reservation created with stock reserved", {
      orderId: order._id,
      userId,
      totalAmount,
      orderNumber: order.orderNumber,
    });

    res.status(201).json({
      success: true,
      message: "Reservation created successfully. Stock has been reserved for pickup.",
      data: serializeOrder(order),
    });
  } catch (error) {
    logger.error("Create reservation error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders.map(serializeOrder),
    });
  } catch (error) {
    logger.error("Get reservations error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("products.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this reservation",
      });
    }

    res.status(200).json({
      success: true,
      data: serializeOrder(order),
    });
  } catch (error) {
    logger.error("Get reservation error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const nextStatus = String(status || "").trim();

    if (!ORDER_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status",
      });
    }

    const order = await Order.findById(req.params.id).populate("products.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (!canTransition(order.status, nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change reservation from ${order.status} to ${nextStatus}`,
      });
    }

    const shouldReturnStock =
      !["cancelled", "revoked"].includes(order.status) &&
      ["cancelled", "revoked"].includes(nextStatus);

    if (shouldReturnStock) {
      await restoreOrderStock(order);
      order.paymentStatus = "failed";
    } else if (nextStatus === "collected") {
      order.paymentStatus = "completed";
    } else {
      order.paymentStatus = "not_applicable";
    }

    order.status = nextStatus;
    if (typeof adminNotes === "string") {
      order.adminNotes = adminNotes.trim();
    }

    await order.save();

    logger.info("Reservation status updated", {
      orderId: order._id,
      status: nextStatus,
    });

    res.status(200).json({
      success: true,
      message: "Reservation status updated",
      data: serializeOrder(order),
    });
  } catch (error) {
    logger.error("Update reservation error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("products.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this reservation",
      });
    }

    if (!ACTIVE_RESERVATION_STATUSES.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Only active reservations can be cancelled",
      });
    }

    await restoreOrderStock(order);

    order.status = "cancelled";
    order.paymentStatus = "failed";
    await order.save();

    logger.info("Reservation cancelled and stock returned", { orderId: order._id });

    res.status(200).json({
      success: true,
      message: "Reservation cancelled and stock returned",
      data: serializeOrder(order),
    });
  } catch (error) {
    logger.error("Cancel reservation error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, overdue } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (overdue === "true") {
      query.status = { $in: ACTIVE_RESERVATION_STATUSES };
      query.reservationExpiresAt = { $lt: new Date() };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("products.product", "name price category unit")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders.map(serializeOrder),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Get all reservations error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const reservedOrders = await Order.countDocuments({ status: "reserved" });
    const readyForPickupOrders = await Order.countDocuments({ status: "ready_for_pickup" });
    const collectedOrders = await Order.countDocuments({ status: "collected" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });
    const revokedOrders = await Order.countDocuments({ status: "revoked" });
    const overdueReservations = await Order.countDocuments({
      status: { $in: ACTIVE_RESERVATION_STATUSES },
      reservationExpiresAt: { $lt: new Date() },
    });

    const reservedValueData = await Order.aggregate([
      { $match: { status: { $in: ACTIVE_RESERVATION_STATUSES } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const collectedValueData = await Order.aggregate([
      { $match: { status: "collected" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        reservedOrders,
        readyForPickupOrders,
        collectedOrders,
        cancelledOrders,
        revokedOrders,
        overdueReservations,
        reservedValue: Math.round((reservedValueData[0]?.total || 0) * 100) / 100,
        collectedValue: Math.round((collectedValueData[0]?.total || 0) * 100) / 100,
      },
    });
  } catch (error) {
    logger.error("Get reservation stats error", { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
