
import express from "express";
import {
  createEmbarque,
  listEmbarques,
  getEmbarque,
  updateEmbarque,
  patchEmbarque,
  deleteEmbarque,
  getEstadisticas,
} from "../controllers/embarques.controller.js";
import { protect } from "../middleware/auth.js"; 

const router = express.Router();

router.use(protect); 

router.route("/").get(listEmbarques).post(createEmbarque);

router.get("/stats/estadisticas", getEstadisticas);

router
  .route("/:id")
  .get(getEmbarque)
  .put(updateEmbarque)
  .patch(patchEmbarque)
  .delete(deleteEmbarque);

export default router;
