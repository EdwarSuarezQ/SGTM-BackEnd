import express from "express";
import { exportCollection } from "../controllers/export.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.get("/:recurso", exportCollection);

export default router;
