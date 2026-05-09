import express from "express";
import { getResumenEstadisticas } from "../controllers/estadisticas.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/resumen", getResumenEstadisticas); 

export default router;
