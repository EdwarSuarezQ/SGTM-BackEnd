import express from "express";
import {
  createTarea,
  listTareas,
  getTarea,
  updateTarea,
  patchTarea,
  deleteTarea,
  tareasStats,
} from "../controllers/tareas.controller.js";
import { protect } from "../middleware/auth.js";
import {
  validateSchema,
  tareaSchema,
  updateTareaSchema,
} from "../middleware/validate.js";

const router = express.Router();
router.use(protect);

router
  .route("/")
  .get(listTareas) 
  .post(validateSchema(tareaSchema), createTarea); 

router.get("/stats/summary", tareasStats); 

router
  .route("/:id")
  .get(getTarea)
  .put(validateSchema(tareaSchema), updateTarea) 
  .patch(validateSchema(updateTareaSchema), patchTarea) 
  .delete(deleteTarea); 

export default router;
