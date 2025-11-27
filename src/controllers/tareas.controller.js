import { validationResult } from "express-validator";
import Tarea from "../models/Tarea.js";
import User from "../models/User.js";
import Personal from "../models/Personal.js";

// Crear tarea - VERSIÓN CORREGIDA
export const createTarea = async (req, res, next) => {
  try {
    // Verificar rol de administrador
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear tareas",
      });
    }

    const tareaData = { ...req.body };

    // Validate asignadoId if provided
    if (tareaData.asignadoId) {
      const personal = await Personal.findById(tareaData.asignadoId);
      if (!personal) {
        return res.status(400).json({
          success: false,
          message: "El personal asignado no existe",
        });
      }
      // Set asignado field for backward compatibility
      tareaData.asignado = personal.nombre;
      // Link to user if personal has usuarioId
      if (personal.usuarioId) {
        tareaData.usuarioId = personal.usuarioId;
      }
    }

    const tarea = new Tarea(tareaData);
    await tarea.save();

    return res.status(201).json({
      success: true,
      message: "Tarea creada exitosamente",
      data: tarea,
    });
  } catch (err) {
    console.error("Error al crear tarea:", err);
    return res.status(500).json({
      success: false,
      message: "Error al crear la tarea",
      error: err.message,
    });
  }
};

// Listar tareas - VERSIÓN CORREGIDA
export const listTareas = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      q,
      estado,
      prioridad,
      departamento,
    } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { titulo: new RegExp(q, "i") },
        { descripcion: new RegExp(q, "i") },
        { asignado: new RegExp(q, "i") },
      ];
    }

    if (estado) filter.estado = estado;
    if (prioridad) filter.prioridad = prioridad;
    if (departamento) filter.departamento = departamento;

    // Filtrar tareas según el rol del usuario
    if (req.user && req.user.rol === "user") {
      // Si es usuario normal, solo ver sus tareas asignadas
      filter.usuarioId = req.user.id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Tarea.find(filter)
        .populate('asignadoId', 'nombre email puesto departamento')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Tarea.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Error al listar tareas:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las tareas",
      error: err.message,
    });
  }
};

// Obtener tarea por ID
export const getTarea = async (req, res, next) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: tarea,
    });
  } catch (err) {
    next(err);
  }
};

// Actualizar tarea completa (PUT)
export const updateTarea = async (req, res, next) => {
  try {
    const tareaData = { ...req.body };
    const { id } = req.params;

    // Verificar permisos
    if (req.user.rol !== "admin") {
      // Si es usuario, verificar que la tarea sea suya
      const tareaExistente = await Tarea.findById(id);
      if (!tareaExistente) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada",
        });
      }

      if (tareaExistente.usuarioId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para editar esta tarea",
        });
      }

      // Usuarios solo pueden cambiar el estado
      // Eliminamos cualquier otro campo del body para evitar modificaciones no autorizadas
      const allowedUpdates = ["estado"];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        // Si intenta cambiar algo más, lo ignoramos o lanzamos error. 
        // Para ser amigables, filtramos solo lo permitido.
        // Pero aquí vamos a ser estrictos para evitar confusiones.
        // O mejor, simplemente forzamos que tareaData solo tenga 'estado'
        
        // Reconstruimos tareaData solo con estado
        if (req.body.estado) {
             // Limpiamos tareaData y solo dejamos estado
             for (const key in tareaData) delete tareaData[key];
             tareaData.estado = req.body.estado;
        } else {
             return res.status(403).json({
                success: false,
                message: "Solo puedes cambiar el estado de la tarea",
             });
        }
      }
    }

    // Validate asignadoId if provided
    if (tareaData.asignadoId) {
      const personal = await Personal.findById(tareaData.asignadoId);
      if (!personal) {
        return res.status(400).json({
          success: false,
          message: "El personal asignado no existe",
        });
      }
      // Set asignado field for backward compatibility
      tareaData.asignado = personal.nombre;
      // Link to user if personal has usuarioId
      if (personal.usuarioId) {
        tareaData.usuarioId = personal.usuarioId;
      }
    }

    const tarea = await Tarea.findByIdAndUpdate(req.params.id, tareaData, {
      new: true,
      runValidators: true,
    });

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tarea actualizada",
      data: tarea,
    });
  } catch (err) {
    console.error("Error al actualizar tarea:", err);
    
    // Manejar errores de validación de Mongoose
    if (err.name === "ValidationError" && err.errors) {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: Object.values(err.errors).map(e => e.message),
      });
    }
    
    console.error("Error al actualizar tarea:", err);
    console.error("Stack:", err.stack);
    
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la tarea",
      error: err.message,
    });
  }
};

// Actualizar tarea parcialmente (PATCH)
export const patchTarea = async (req, res, next) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      });
    }

    Object.assign(tarea, req.body);
    await tarea.save();

    return res.status(200).json({
      success: true,
      message: "Tarea actualizada parcialmente",
      data: tarea,
    });
  } catch (err) {
    next(err);
  }
};

// Eliminar tarea
export const deleteTarea = async (req, res, next) => {
  try {
    // Verificar rol de administrador
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar tareas",
      });
    }

    const tarea = await Tarea.findByIdAndDelete(req.params.id);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tarea eliminada",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// Estadísticas básicas - OPTIMIZADO CON AGREGACIÓN
export const tareasStats = async (req, res, next) => {
  try {
    const stats = await Tarea.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pendientes: {
            $sum: { $cond: [{ $eq: ["$estado", "pendiente"] }, 1, 0] },
          },
          completadas: {
            $sum: { $cond: [{ $eq: ["$estado", "completada"] }, 1, 0] },
          },
          enProgreso: {
            $sum: { $cond: [{ $eq: ["$estado", "en-progreso"] }, 1, 0] },
          },
          altaPrioridad: {
            $sum: { $cond: [{ $eq: ["$prioridad", "alta"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      pendientes: 0,
      completadas: 0,
      enProgreso: 0,
      altaPrioridad: 0
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
