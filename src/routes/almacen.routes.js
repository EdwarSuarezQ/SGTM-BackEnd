import express from "express";
import {
  createAlmacen,
  listAlmacenes,
  getAlmacen,
  updateAlmacen,
  patchAlmacen,
  deleteAlmacen,
  almacenesStats,
} from "../controllers/almacen.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Proteger todas las rutas de almacén
router.use(protect);

router
  .route("/")
  .get(listAlmacenes) // GET /api/almacen
  .post(createAlmacen); // POST /api/almacen

// AGREGAR ESTA RUTA DE ESTADÍSTICAS
router.get("/stats/summary", almacenesStats);

router
  .route("/:id")
  .get(getAlmacen) // GET /api/almacen/:id
  .put(updateAlmacen) // PUT /api/almacen/:id
  .patch(patchAlmacen) // PATCH /api/almacen/:id
  .delete(deleteAlmacen); // DELETE /api/almacen/:id

export default router;
