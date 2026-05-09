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
} from "../middleware/validate.js"; 

const router = express.Router();
router.use(protect);

router
  .route("/")
  .get(listFacturas) 
  .post(validateSchema(facturaSchema), createFactura); 
router.get("/stats/summary", facturasStats); 

router
  .route("/:id")
  .get(getFactura) 
  .put(validateSchema(facturaSchema), updateFactura) 
  .patch(validateSchema(updateFacturaSchema), patchFactura) 
  .delete(deleteFactura); 

export default router;
