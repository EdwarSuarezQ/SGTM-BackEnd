import { verifyToken as verifyJWT } from "../libs/jwt.js";
import User from "../models/User.js";
import Tarea from "../models/Tarea.js";
import ErrorResponse from "../utils/errorResponse.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ErrorResponse("No autorizado para acceder a esta ruta", 401)
    );
  }

  try {
    const decoded = await verifyJWT(token);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return next(new ErrorResponse("Usuario no encontrado", 404));
    }

    next();
  } catch (error) {
    // Manejo específico de errores de JWT
    if (error.message === "Token expirado") {
      return next(
        new ErrorResponse(
          "Tu sesión ha expirado, por favor inicia sesión nuevamente",
          401
        )
      );
    } else if (error.message === "Token inválido") {
      return next(new ErrorResponse("Token de autenticación inválido", 401));
    }
    return next(
      new ErrorResponse("No autorizado para acceder a esta ruta", 401)
    );
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Cambiado de req.user.role a req.user.rol para consistencia con el modelo User
    if (!roles.includes(req.user.rol)) {
      return next(
        new ErrorResponse(
          `El rol ${req.user.rol} no tiene permiso para realizar esta acción`,
          403
        )
      );
    }
    next();
  };
};

export const authorizeTarea = async (req, res, next) => {
  try {
    const tarea = await Tarea.findById(req.params.id);

    if (!tarea) {
      return next(new ErrorResponse("Tarea no encontrada", 404));
    }

    // Si no hay campo usuario en el modelo, permitir a todos los usuarios autenticados
    // O si existe el campo, verificar que el usuario sea el propietario o admin
    // Cambiado req.user.role a req.user.rol para consistencia
    if (
      tarea.usuario &&
      tarea.usuario.toString() !== req.user.id &&
      req.user.rol !== "admin"
    ) {
      return next(
        new ErrorResponse("No autorizado para acceder a esta tarea", 403)
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
