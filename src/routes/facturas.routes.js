import express from "express";
import {
  createFactura,
  listFacturas,
  getFactura,
  updateFactura,
  patchFactura,
  deleteFactura,
  facturasStats,
} from "../controllers/facturas.controller.js";
import { protect } from "../middleware/auth.js";
import {
  validateSchema,
  facturaSchema,
  updateFacturaSchema,
} from "../middleware/validate.js"; // ✅ Importar los esquemas

const router = express.Router();

// Proteger todas las rutas de facturas
router.use(protect);

router
  .route("/")
  .get(listFacturas) // GET /api/facturas
  .post(validateSchema(facturaSchema), createFactura); // ✅ POST con validación

// Nueva ruta para estadísticas
router.get("/stats/summary", facturasStats); // GET /api/facturas/stats/summary

router
  .route("/:id")
  .get(getFactura) // GET /api/facturas/:id
  .put(validateSchema(facturaSchema), updateFactura) // ✅ PUT con validación
  .patch(validateSchema(updateFacturaSchema), patchFactura) // ✅ PATCH con validación
  .delete(deleteFactura); // DELETE /api/facturas/:id

export default router;
