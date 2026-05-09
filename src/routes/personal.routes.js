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
  .get(listPersonal) 
  .post(createPersonal); 
router.get("/stats/summary", personalStats); 

router
  .route("/:id")
  .get(getPersonal) 
  .put(updatePersonal) 
  .patch(patchPersonal) 
  .delete(deletePersonal); 

export default router;
