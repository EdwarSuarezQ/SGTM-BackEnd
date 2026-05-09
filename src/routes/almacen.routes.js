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
router.use(protect);

router
  .route("/")
  .get(listAlmacenes) 
  .post(createAlmacen); 
router.get("/stats/summary", almacenesStats);

router
  .route("/:id")
  .get(getAlmacen) 
  .put(updateAlmacen) 
  .patch(patchAlmacen) 
  .delete(deleteAlmacen); 

export default router;
