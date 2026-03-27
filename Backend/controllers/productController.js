import Product from "../models/Product.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { category, sortBy, limit = 12, page = 1 } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    let products = Product.find(query).skip(skip).limit(Number(limit));

    if (sortBy === "price_asc") {
      products = products.sort({ price: 1 });
    } else if (sortBy === "price_desc") {
      products = products.sort({ price: -1 });
    } else if (sortBy === "rating") {
      products = products.sort({ rating: -1 });
    } else {
      products = products.sort({ createdAt: -1 });
    }

    const data = await products.populate("reviews");
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query required" });
    }

    const products = await Product.find(
      {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
          { bestFor: { $regex: q, $options: "i" } },
        ],
        isActive: true,
      },
      null,
      { limit: 20 }
    );

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
