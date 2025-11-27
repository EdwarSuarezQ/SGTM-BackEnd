import express from "express";
import {
  createEmbarcacion,
  listEmbarcaciones,
  getEmbarcacion,
  updateEmbarcacion,
  patchEmbarcacion,
  deleteEmbarcacion,
  getEmbarcacionesStats,
} from "../controllers/embarcaciones.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Proteger todas las rutas de embarcaciones
router.use(protect);

router
  .route("/")
  .get(listEmbarcaciones) // GET /api/embarcaciones
  .post(createEmbarcacion); // POST /api/embarcaciones

router.get("/stats/general", getEmbarcacionesStats);

router
  .route("/:id")
  .get(getEmbarcacion) // GET /api/embarcaciones/:id
  .put(updateEmbarcacion) // PUT /api/embarcaciones/:id
  .patch(patchEmbarcacion) // PATCH /api/embarcaciones/:id
  .delete(deleteEmbarcacion); // DELETE /api/embarcaciones/:id

export default router;
