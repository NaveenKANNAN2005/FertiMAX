import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    farmSize: {
      type: Number,
      description: "Farm size in acres",
    },
    cropTypes: [
      {
        type: String,
        enum: ["Rice", "Wheat", "Corn", "Vegetables", "Fruits", "Other"],
      },
    ],
    soilType: {
      type: String,
      enum: ["Clay", "Sand", "Loam", "Silt", "Other"],
    },
    role: {
      type: String,
      enum: ["farmer", "admin", "user"],
      default: "farmer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
