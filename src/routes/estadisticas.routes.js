import express from "express";
import { getResumenEstadisticas } from "../controllers/estadisticas.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Todas las estadísticas requieren usuario autenticado
router.use(protect);

router.get("/resumen", getResumenEstadisticas); // GET /api/estadisticas/resumen

export default router;
