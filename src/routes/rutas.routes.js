import express from "express";
import {
  createRuta,
  listRutas,
  getRuta,
  updateRuta,
  patchRuta,
  deleteRuta,
  rutasStats, 
} from "../controllers/rutas.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router
  .route("/")
  .get(listRutas) 
  .post(createRuta); 
router.get("/stats/summary", rutasStats);

router
  .route("/:id")
  .get(getRuta) 
  .put(updateRuta) 
  .patch(patchRuta) 
  .delete(deleteRuta); 

export default router;
