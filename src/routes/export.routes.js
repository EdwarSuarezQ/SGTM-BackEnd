import express from "express";
import { exportCollection } from "../controllers/export.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Todas las exportaciones requieren usuario autenticado
router.use(protect);

// GET /api/export/:recurso  (tareas, embarques, facturas, etc.)
router.get("/:recurso", exportCollection);

export default router;
