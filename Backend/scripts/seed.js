import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Recommendation from "../models/Recommendation.js";
import { hashPassword } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/fertimax");
  logger.info("MongoDB connected for seeding");
};

const seedUsers = async () => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    logger.info(`${existingUsers} users already exist, skipping user seed`);
    return await User.find();
  }

  const users = [
    {
      name: "Raj Farmer",
      email: "raj@farm.com",
      password: await hashPassword("password123"),
      phone: "+91-9876543210",
      address: "123 Farm Lane",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      farmSize: 5,
      cropTypes: ["Wheat", "Rice"],
      soilType: "Loam",
      role: "farmer",
    },
    {
      name: "Priya Sharma",
      email: "priya@farm.com",
      password: await hashPassword("password123"),
      phone: "+91-9876543211",
      address: "456 Green Fields",
      city: "Ludhiana",
      state: "Punjab",
      zipCode: "141001",
      farmSize: 10,
      cropTypes: ["Corn", "Vegetables"],
      soilType: "Silt",
      role: "farmer",
    },
    {
      name: "Admin User",
      email: "balaagroservices@gmail.com",
      password: await hashPassword("admin123"),
      phone: "9345869407",
      address: "3/263,vasanthapuram nadanthai ,Paramathi Velur , namakkal",
      city: "Namakkal",
      state: "Tamil Nadu",
      zipCode: "637001",
      farmSize: 0,
      cropTypes: [],
      soilType: "Other",
      role: "admin",
    },
  ];

  const insertedUsers = await User.insertMany(users);
  logger.info(`Seeded ${insertedUsers.length} users`);
  return insertedUsers;
};

const seedProducts = async () => {
  const products = [
    {
      name: "OrganoPro Max",
      description: "Premium organic fertilizer for vegetables and fruits with balanced micronutrients.",
      category: "Organic",
      price: 450,
      stockQuantity: 500,
      unit: "kg",
      composition: {
        nitrogen: 10,
        phosphorus: 4,
        potassium: 6,
        micronutrients: ["zinc", "boron"],
      },
      bestFor: ["Vegetables", "Fruits"],
      manufacturer: "BioLabs India",
      instructions: "Apply 40-50 kg per acre before irrigation.",
      isActive: true,
    },
    {
      name: "NPK Gold 20-20-20",
      description: "Balanced NPK blend for staple crops and intensive farming cycles.",
      category: "NPK Blends",
      price: 520,
      stockQuantity: 400,
      unit: "kg",
      composition: {
        nitrogen: 20,
        phosphorus: 20,
        potassium: 20,
        micronutrients: ["sulfur"],
      },
      bestFor: ["Rice", "Wheat", "Corn"],
      manufacturer: "AgriChem Industries",
      instructions: "Broadcast 50 kg per acre at early growth stage.",
      isActive: true,
    },
    {
      name: "MicroBoost Plus",
      description: "Micronutrient support with zinc, iron, and boron for deficiency-prone soil.",
      category: "Micronutrients",
      price: 280,
      stockQuantity: 250,
      unit: "kg",
      composition: {
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        micronutrients: ["zinc", "iron", "boron"],
      },
      bestFor: ["Rice", "Vegetables"],
      manufacturer: "Micro Nutrients Ltd",
      instructions: "Use 10-15 kg per acre with basal fertilizer.",
      isActive: true,
    },
    {
      name: "BioStim Root",
      description: "Bio-stimulant that improves root development and nutrient uptake.",
      category: "Bio Stimulants",
      price: 350,
      stockQuantity: 300,
      unit: "liter",
      composition: {
        nitrogen: 5,
        phosphorus: 2,
        potassium: 3,
        micronutrients: ["amino acids"],
      },
      bestFor: ["Corn", "Vegetables"],
      manufacturer: "BioGreen Solutions",
      instructions: "Dilute and spray 1 liter per acre.",
      isActive: true,
    },
    {
      name: "SoilRevive Pro",
      description: "Conditioner for compact or low-retention soils to improve structure and moisture balance.",
      category: "Soil Conditioners",
      price: 420,
      stockQuantity: 350,
      unit: "kg",
      composition: {
        nitrogen: 3,
        phosphorus: 2,
        potassium: 2,
        micronutrients: ["humic acid"],
      },
      bestFor: ["Clay", "Sand"],
      manufacturer: "SoilCare Industries",
      instructions: "Apply 25-30 kg per acre before sowing.",
      isActive: true,
    },
    {
      name: "FoliaSpray 360",
      description: "Fast-acting foliar spray for nutrient correction during stress periods.",
      category: "Foliar Sprays",
      price: 220,
      stockQuantity: 450,
      unit: "liter",
      composition: {
        nitrogen: 8,
        phosphorus: 4,
        potassium: 10,
        micronutrients: ["magnesium", "zinc"],
      },
      bestFor: ["Vegetables", "Fruits"],
      manufacturer: "LeafCare Labs",
      instructions: "Spray 500 ml per acre in the evening.",
      isActive: true,
    },
    {
      name: "Urea 46-0-0 Granules",
      description: "High-nitrogen fertilizer grade urea for vegetative growth and tillering support.",
      category: "NPK Blends",
      price: 390,
      stockQuantity: 700,
      unit: "kg",
      composition: {
        nitrogen: 46,
        phosphorus: 0,
        potassium: 0,
        micronutrients: ["none"],
      },
      bestFor: ["Wheat", "Rice", "Maize"],
      manufacturer: "AgriCore Nutrients",
      instructions: "Apply in split doses to reduce nitrogen loss; avoid application before heavy rain.",
      isActive: true,
    },
    {
      name: "DAP 18-46-0",
      description: "Diammonium phosphate grade used at basal stage for strong early root development.",
      category: "NPK Blends",
      price: 670,
      stockQuantity: 500,
      unit: "kg",
      composition: {
        nitrogen: 18,
        phosphorus: 46,
        potassium: 0,
        micronutrients: ["none"],
      },
      bestFor: ["Pulses", "Oilseeds", "Cereals"],
      manufacturer: "PhosGrow India",
      instructions: "Use as basal fertilizer near root zone at sowing or transplanting.",
      isActive: true,
    },
    {
      name: "MAP 11-52-0",
      description: "Monoammonium phosphate source with high phosphorus for early crop establishment.",
      category: "NPK Blends",
      price: 710,
      stockQuantity: 360,
      unit: "kg",
      composition: {
        nitrogen: 11,
        phosphorus: 52,
        potassium: 0,
        micronutrients: ["none"],
      },
      bestFor: ["Vegetables", "Fruit Crops", "Pulses"],
      manufacturer: "RootLine Fertitech",
      instructions: "Apply as starter fertilizer where phosphorus demand is high in early growth.",
      isActive: true,
    },
    {
      name: "MOP Potash 0-0-60",
      description: "Muriate of potash (potassium chloride) for potassium supplementation in K-deficient soils.",
      category: "NPK Blends",
      price: 560,
      stockQuantity: 420,
      unit: "kg",
      composition: {
        nitrogen: 0,
        phosphorus: 0,
        potassium: 60,
        micronutrients: ["chloride"],
      },
      bestFor: ["Sugarcane", "Banana", "Cotton"],
      manufacturer: "K-Farm Minerals",
      instructions: "Broadcast and incorporate in soil before irrigation for better uptake.",
      isActive: true,
    },
    {
      name: "GreenLeaf NPK 19-19-19",
      description: "Balanced water-soluble NPK grade for general crop nutrition during active growth.",
      category: "NPK Blends",
      price: 760,
      stockQuantity: 380,
      unit: "kg",
      composition: {
        nitrogen: 19,
        phosphorus: 19,
        potassium: 19,
        micronutrients: ["trace elements"],
      },
      bestFor: ["Vegetables", "Flowers", "Fruit Crops"],
      manufacturer: "AquaNutrient Labs",
      instructions: "Apply through fertigation or foliar program based on crop stage.",
      isActive: true,
    },
    {
      name: "MKP Foliar 0-52-34",
      description: "Monopotassium phosphate foliar-grade fertilizer for flowering and fruit setting stages.",
      category: "Foliar Sprays",
      price: 840,
      stockQuantity: 260,
      unit: "kg",
      composition: {
        nitrogen: 0,
        phosphorus: 52,
        potassium: 34,
        micronutrients: ["none"],
      },
      bestFor: ["Grapes", "Tomato", "Chili"],
      manufacturer: "CropPulse Solutions",
      instructions: "Dissolve fully and spray during bud initiation and early fruit development.",
      isActive: true,
    },
  ];

  const existingProducts = await Product.find({}, { name: 1 });
  const existingNames = new Set(existingProducts.map((product) => product.name));
  const productsToInsert = products.filter((product) => !existingNames.has(product.name));

  if (productsToInsert.length === 0) {
    logger.info(`${existingProducts.length} products already exist, no new products to seed`);
    return await Product.find();
  }

  const insertedProducts = await Product.insertMany(productsToInsert);
  logger.info(`Seeded ${insertedProducts.length} new products`);
  return await Product.find();
};

const seedRecommendations = async (users, products) => {
  const existingRecommendations = await Recommendation.countDocuments();
  if (existingRecommendations > 0) {
    logger.info(
      `${existingRecommendations} recommendations already exist, skipping recommendation seed`
    );
    return;
  }

  const farmers = users.filter((user) => user.role === "farmer");
  const byCategory = Object.fromEntries(products.map((product) => [product.category, product]));

  const recommendations = farmers.map((user) => ({
    user: user._id,
    cropType: user.cropTypes[0] || "Wheat",
    soilType: user.soilType || "Loam",
    farmSize: user.farmSize || 1,
    diseaseDetected: null,
    recommendedProducts: [
      byCategory["NPK Blends"],
      byCategory["Micronutrients"],
      byCategory["Organic"],
    ]
      .filter(Boolean)
      .map((product, index) => ({
        product: product._id,
        dosage: `${Math.max(20, Math.round((user.farmSize || 1) * 10))} ${product.unit}`,
        reason: `Selected for ${user.cropTypes[0] || "general"} farming on ${user.soilType} soil`,
        priority: index === 0 ? "High" : "Medium",
      })),
    aiConfidence: 88,
    status: "completed",
  }));

  await Recommendation.insertMany(recommendations);
  logger.info(`Seeded ${recommendations.length} recommendations`);
};

const clearDatabase = async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Recommendation.deleteMany({});
  logger.info("Database cleared");
};

const seed = async () => {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    if (args.includes("--clear")) {
      await clearDatabase();
    }

    logger.info("Starting database seeding");
    const users = await seedUsers();
    const products = await seedProducts();
    await seedRecommendations(users, products);
    logger.info("Database seeding completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Seeding failed", { error: error.message });
    process.exit(1);
  }
};

seed();
