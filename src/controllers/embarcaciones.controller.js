import Embarcacion from "../models/Embarcacion.js";

// Crear embarcación
export const createEmbarcacion = async (req, res, next) => {
  try {
    // Verificar permisos (solo admin)
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear embarcaciones",
      });
    }

    const { fecha, ...rest } = req.body;
    const newEmbarcacionData = { ...rest };
    if (fecha) {
      newEmbarcacionData.fecha = new Date(fecha);
    }
    const embarcacion = new Embarcacion(newEmbarcacionData);
    await embarcacion.save();

    return res.status(201).json({
      success: true,
      message: "Embarcación creada",
      data: embarcacion,
    });
  } catch (err) {
    next(err);
  }
};

// Listar embarcaciones con paginación y filtros básicos
export const listEmbarcaciones = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, tipo, q, sort = "-createdAt" } = req.query;

    const filters = {};
    if (estado) filters.estado = estado;
    if (tipo) filters.tipo = tipo;

    // Búsqueda general
    if (q) {
      filters.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { matricula: { $regex: q, $options: "i" } },
        { capitan: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Embarcacion.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Embarcacion.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Obtener embarcación por ID
export const getEmbarcacion = async (req, res, next) => {
  try {
    const embarcacion = await Embarcacion.findById(req.params.id);
    if (!embarcacion) {
      return res.status(404).json({
        success: false,
        message: "Embarcación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: embarcacion,
    });
  } catch (err) {
    next(err);
  }
};

// Actualizar embarcación completa
export const updateEmbarcacion = async (req, res, next) => {
  try {
    // Verificar permisos (solo admin)
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar embarcaciones",
      });
    }

    const { fecha, ...rest } = req.body;
    const updateData = { ...rest };
    if (fecha) {
      updateData.fecha = new Date(fecha);
    }

    const embarcacion = await Embarcacion.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!embarcacion) {
      return res.status(404).json({
        success: false,
        message: "Embarcación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Embarcación actualizada",
      data: embarcacion,
    });
  } catch (err) {
    next(err);
  }
};

// Actualizar embarcación parcialmente
export const patchEmbarcacion = async (req, res, next) => {
  try {
    // Verificar permisos (solo admin)
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar embarcaciones",
      });
    }

    const embarcacion = await Embarcacion.findById(req.params.id);
    if (!embarcacion) {
      return res.status(404).json({
        success: false,
        message: "Embarcación no encontrada",
      });
    }

    const { fecha, ...rest } = req.body;
    const updateData = { ...rest };
    if (fecha) {
      updateData.fecha = new Date(fecha);
    }

    Object.assign(embarcacion, updateData);
    await embarcacion.save();

    return res.status(200).json({
      success: true,
      message: "Embarcación actualizada parcialmente",
      data: embarcacion,
    });
  } catch (err) {
    next(err);
  }
};

// Eliminar embarcación
export const deleteEmbarcacion = async (req, res, next) => {
  try {
    // Verificar permisos (solo admin)
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar embarcaciones",
      });
    }

    // Check if embarcacion has active embarques
    const Embarque = (await import("../models/Embarque.js")).default;
    const embarquesActivos = await Embarque.countDocuments({ 
      embarcacionId: req.params.id,
      estado: { $nin: ['completado', 'cancelado', 'entregado'] }
    });
    
    if (embarquesActivos > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Hay ${embarquesActivos} embarque(s) activo(s) usando esta embarcación. Por favor, completa o cancela los embarques primero.`,
      });
    }

    const embarcacion = await Embarcacion.findByIdAndDelete(req.params.id);
    if (!embarcacion) {
      return res.status(404).json({
        success: false,
        message: "Embarcación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Embarcación eliminada",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// Obtener estadísticas de embarcaciones
export const getEmbarcacionesStats = async (req, res, next) => {
  try {
    const stats = await Embarcacion.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          enTransito: {
            $sum: { $cond: [{ $eq: ["$estado", "en-transito"] }, 1, 0] },
          },
          enRuta: {
            $sum: { $cond: [{ $eq: ["$estado", "en-ruta"] }, 1, 0] },
          },
          enPuerto: {
            $sum: { $cond: [{ $eq: ["$estado", "en-puerto"] }, 1, 0] },
          },
          pendientes: {
            $sum: { $cond: [{ $eq: ["$estado", "pendiente"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      enTransito: 0,
      enRuta: 0,
      enPuerto: 0,
      pendientes: 0
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
