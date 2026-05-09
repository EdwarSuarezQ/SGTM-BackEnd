import Ruta from "../models/Ruta.js";
export const createRuta = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear rutas",
      });
    }

    const ruta = new Ruta(req.body);
    await ruta.save();

    return res.status(201).json({
      success: true,
      message: "Ruta creada",
      data: ruta,
    });
  } catch (err) {
    next(err);
  }
};
export const listRutas = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, tipo, q, sort = "-createdAt" } = req.query; 

    const filters = {};
    if (estado) filters.estado = estado;
    if (tipo) filters.tipo = tipo;
    if (q) {
      filters.$or = [
        { idRuta: new RegExp(q, "i") },
        { nombre: new RegExp(q, "i") },
        { origen: new RegExp(q, "i") },
        { destino: new RegExp(q, "i") },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Ruta.find(filters).sort(sort).skip(skip).limit(parseInt(limit)),
      Ruta.countDocuments(filters),
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
    next(err);
  }
};
export const getRuta = async (req, res, next) => {
  try {
    const ruta = await Ruta.findById(req.params.id);
    if (!ruta) {
      return res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: ruta,
    });
  } catch (err) {
    next(err);
  }
};
export const updateRuta = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar rutas",
      });
    }

    const ruta = await Ruta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ruta) {
      return res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ruta actualizada",
      data: ruta,
    });
  } catch (err) {
    next(err);
  }
};
export const patchRuta = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar rutas",
      });
    }

    const ruta = await Ruta.findById(req.params.id);
    if (!ruta) {
      return res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
      });
    }

    Object.assign(ruta, req.body);
    await ruta.save();

    return res.status(200).json({
      success: true,
      message: "Ruta actualizada parcialmente",
      data: ruta,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteRuta = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar rutas",
      });
    }
    const Embarque = (await import("../models/Embarque.js")).default;
    const embarquesActivos = await Embarque.countDocuments({ 
      rutaId: req.params.id,
      estado: { $nin: ['completado', 'cancelado', 'entregado'] }
    });
    
    if (embarquesActivos > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Hay ${embarquesActivos} embarque(s) activo(s) usando esta ruta. Por favor, completa o cancela los embarques primero.`,
      });
    }

    const ruta = await Ruta.findByIdAndDelete(req.params.id);
    if (!ruta) {
      return res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ruta eliminada",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
export const rutasStats = async (req, res, next) => {
  try {
    const stats = await Ruta.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          activas: {
            $sum: { $cond: [{ $eq: ["$estado", "activa"] }, 1, 0] },
          },
          internacionales: {
            $sum: { $cond: [{ $eq: ["$tipo", "internacional"] }, 1, 0] },
          },
          regionales: {
            $sum: { $cond: [{ $eq: ["$tipo", "regional"] }, 1, 0] },
          },
          costeras: {
            $sum: { $cond: [{ $eq: ["$tipo", "costera"] }, 1, 0] },
          },
          totalViajes: { $sum: "$viajesAnio" },
          distanciaTotal: { $sum: "$distancia" },
          distanciaPromedio: { $avg: "$distancia" },
        },
      },
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      activas: 0,
      internacionales: 0,
      regionales: 0,
      costeras: 0,
      totalViajes: 0,
      distanciaTotal: 0,
      distanciaPromedio: 0
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
