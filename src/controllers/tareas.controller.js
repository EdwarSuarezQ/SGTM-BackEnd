import { validationResult } from "express-validator";
import Tarea from "../models/Tarea.js";
import User from "../models/User.js";
import Personal from "../models/Personal.js";
export const createTarea = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear tareas",
      });
    }

    const tareaData = { ...req.body };
    if (tareaData.asignadoId) {
      const personal = await Personal.findById(tareaData.asignadoId);
      if (!personal) {
        return res.status(400).json({
          success: false,
          message: "El personal asignado no existe",
        });
      }
      tareaData.asignado = personal.nombre;
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
      myTasks, 
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
    if (myTasks === "true" || (req.user && req.user.rol !== "admin")) {
      const personal = await Personal.findOne({ usuarioId: req.user._id });
      
      if (personal) {
        filter.asignadoId = personal._id;
      } else {
        filter.asignadoId = null;
      }
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
export const updateTarea = async (req, res, next) => {
  try {
    const tareaData = { ...req.body };
    const { id } = req.params;
    if (req.user.rol !== "admin") {
      const tareaExistente = await Tarea.findById(id);
      if (!tareaExistente) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada",
        });
      }

      if (tareaExistente.usuarioId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para editar esta tarea",
        });
      }
      const allowedUpdates = ["estado"];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        if (req.body.estado) {
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
    if (tareaData.asignadoId) {
      const personal = await Personal.findById(tareaData.asignadoId);
      if (!personal) {
        return res.status(400).json({
          success: false,
          message: "El personal asignado no existe",
        });
      }
      tareaData.asignado = personal.nombre;
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
export const deleteTarea = async (req, res, next) => {
  try {
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
export const tareasStats = async (req, res, next) => {
  try {
    const matchStage = {};
    if (req.user.rol !== "admin") {
      const personal = await Personal.findOne({ usuarioId: req.user._id });
      if (personal) {
        matchStage.asignadoId = personal._id;
      } else {
        matchStage.asignadoId = null;
      }
    }

    const stats = await Tarea.aggregate([
      { $match: matchStage },
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
