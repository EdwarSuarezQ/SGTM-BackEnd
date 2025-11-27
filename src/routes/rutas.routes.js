import express from "express";
import {
  createRuta,
  listRutas,
  getRuta,
  updateRuta,
  patchRuta,
  deleteRuta,
  rutasStats, // AGREGAR ESTA IMPORTACIÓN
} from "../controllers/rutas.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Proteger todas las rutas de rutas
router.use(protect);

router
  .route("/")
  .get(listRutas) // GET /api/rutas
  .post(createRuta); // POST /api/rutas

// AGREGAR ESTA RUTA DE ESTADÍSTICAS
router.get("/stats/summary", rutasStats);

router
  .route("/:id")
  .get(getRuta) // GET /api/rutas/:id
  .put(updateRuta) // PUT /api/rutas/:id
  .patch(patchRuta) // PATCH /api/rutas/:id
  .delete(deleteRuta); // DELETE /api/rutas/:id

export default router;
