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
router.use(protect);

router
  .route("/")
  .get(listEmbarcaciones) 
  .post(createEmbarcacion); 

router.get("/stats/general", getEmbarcacionesStats);

router
  .route("/:id")
  .get(getEmbarcacion) 
  .put(updateEmbarcacion) 
  .patch(patchEmbarcacion) 
  .delete(deleteEmbarcacion); 

export default router;
