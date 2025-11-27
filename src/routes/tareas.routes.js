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

// Todas las rutas de tareas estarán protegidas
router.use(protect);

router
  .route("/")
  .get(listTareas) // GET /api/tareas
  .post(validateSchema(tareaSchema), createTarea); // POST /api/tareas con validación

router.get("/stats/summary", tareasStats); // GET /api/tareas/stats/summary

router
  .route("/:id")
  .get(getTarea)
  .put(validateSchema(tareaSchema), updateTarea) // ✅ Quitamos authorizeTarea temporalmente
  .patch(validateSchema(updateTareaSchema), patchTarea) // ✅ Quitamos authorizeTarea temporalmente
  .delete(deleteTarea); // ✅ Quitamos authorizeTarea temporalmente

export default router;
