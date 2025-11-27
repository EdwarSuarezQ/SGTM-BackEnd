import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Listar usuarios (ejemplo básico) - protegido
router.get("/", protect, async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

export default router;
