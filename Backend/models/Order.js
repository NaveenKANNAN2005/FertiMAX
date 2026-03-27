import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["reserved", "ready_for_pickup", "collected", "cancelled", "revoked"],
      default: "reserved",
    },
    paymentMethod: {
      type: String,
      default: "pay_at_store",
      enum: ["pay_at_store"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "not_applicable"],
      default: "not_applicable",
    },
    bookingType: {
      type: String,
      enum: ["shop_reservation"],
      default: "shop_reservation",
    },
    reservationExpiresAt: {
      type: Date,
      required: true,
    },
    notes: String,
    adminNotes: String,
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }

  if (!this.reservationExpiresAt) {
    this.reservationExpiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  }

  next();
});

export default mongoose.model("Order", orderSchema);
