// db.js
import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  if (!config.mongoUri) {
    console.error('❌ Error: MONGO_URI environment variable is not defined');
    console.error('Please check your .env file and ensure MONGO_URI is set.\n');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error('\nPlease verify:');
    console.error('  1. MongoDB is running');
    console.error('  2. MONGO_URI in .env is correct');
    console.error('  3. Network connectivity to MongoDB\n');
    process.exit(1);
  }
};
