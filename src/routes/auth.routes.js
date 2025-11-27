import express from "express";
import {
  register,
  login,
  verifyToken,
  logout,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import {
  validateSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../middleware/validate.js";

const router = express.Router();

// Rutas de autenticación
// router.post("/register", validateSchema(registerSchema), register); // Registro público deshabilitado
router.post("/login", validateSchema(loginSchema), login);
router.post("/logout", logout);
router.get("/verify-token", verifyToken);

// Rutas de perfil (protegidas)
router.put("/profile", protect, validateSchema(updateProfileSchema), updateProfile);
router.put("/change-password", protect, validateSchema(changePasswordSchema), changePassword);

export default router;
