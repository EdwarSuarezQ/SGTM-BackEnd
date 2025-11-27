import express from "express";
import {
  createPersonal,
  listPersonal,
  getPersonal,
  updatePersonal,
  patchPersonal,
  deletePersonal,
  personalStats,
} from "../controllers/personal.controller.js";
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(listPersonal) // GET /api/personal
  .post(createPersonal); // POST /api/personal

// Agregar ruta de estadísticas (como tareas)
router.get("/stats/summary", personalStats); // GET /api/personal/stats/summary

router
  .route("/:id")
  .get(getPersonal) // GET /api/personal/:id
  .put(updatePersonal) // PUT /api/personal/:id
  .patch(patchPersonal) // PATCH /api/personal/:id
  .delete(deletePersonal); // DELETE /api/personal/:id

export default router;
