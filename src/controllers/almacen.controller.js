import Almacen from "../models/Almacen.js";
export const createAlmacen = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear almacenes",
      });
    }

    const almacen = new Almacen(req.body);
    await almacen.save();

    return res.status(201).json({
      success: true,
      message: "Almacén creado",
      data: almacen,
    });
  } catch (err) {
    next(err);
  }
};
export const listAlmacenes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, q, sort = "-createdAt" } = req.query;

    const filters = {};
    if (estado) filters.estado = estado;
    if (q) {
      filters.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { ubicacion: { $regex: q, $options: "i" } },
        { encargado: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Almacen.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Almacen.countDocuments(filters),
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
export const getAlmacen = async (req, res, next) => {
  try {
    const almacen = await Almacen.findById(req.params.id);
    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: "Almacén no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: almacen,
    });
  } catch (err) {
    next(err);
  }
};
export const updateAlmacen = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar almacenes",
      });
    }

    const almacen = await Almacen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: "Almacén no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Almacén actualizado",
      data: almacen,
    });
  } catch (err) {
    next(err);
  }
};
export const patchAlmacen = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar almacenes",
      });
    }

    const almacen = await Almacen.findById(req.params.id);
    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: "Almacén no encontrado",
      });
    }

    Object.assign(almacen, req.body);
    await almacen.save();

    return res.status(200).json({
      success: true,
      message: "Almacén actualizado parcialmente",
      data: almacen,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteAlmacen = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar almacenes",
      });
    }

    const almacen = await Almacen.findByIdAndDelete(req.params.id);
    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: "Almacén no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Almacén eliminado",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
export const almacenesStats = async (req, res, next) => {
  try {
    const stats = await Almacen.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          operativos: {
            $sum: { $cond: [{ $eq: ["$estado", "operativo"] }, 1, 0] },
          },
          mantenimiento: {
            $sum: { $cond: [{ $eq: ["$estado", "mantenimiento"] }, 1, 0] },
          },
          inoperativos: {
            $sum: { $cond: [{ $eq: ["$estado", "inoperativo"] }, 1, 0] },
          },
          capacidadTotal: { $sum: "$capacidad" },
          ocupacionTotal: { $sum: "$ocupacion" },
          ocupacionPromedio: { $avg: "$ocupacion" }
        },
      },
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      operativos: 0,
      mantenimiento: 0,
      inoperativos: 0,
      capacidadTotal: 0,
      ocupacionPromedio: 0
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
