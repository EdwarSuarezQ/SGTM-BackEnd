import Embarque from "../models/Embarque.js";
import Embarcacion from "../models/Embarcacion.js";
import Ruta from "../models/Ruta.js";
import Almacen from "../models/Almacen.js";
import Personal from "../models/Personal.js";

export const createEmbarque = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear embarques",
      });
    }
    if (req.body.embarcacionId) {
      const embarcacion = await Embarcacion.findById(req.body.embarcacionId);
      if (!embarcacion) {
        return res.status(400).json({
          success: false,
          message: "La embarcación seleccionada no existe",
        });
      }
    }
    if (req.body.rutaId) {
      const ruta = await Ruta.findById(req.body.rutaId);
      if (!ruta) {
        return res.status(400).json({
          success: false,
          message: "La ruta seleccionada no existe",
        });
      }
    }
    if (req.body.almacenId) {
      const almacen = await Almacen.findById(req.body.almacenId);
      if (!almacen) {
        return res.status(400).json({
          success: false,
          message: "El almacén seleccionado no existe",
        });
      }
    }
    if (req.body.supervisorId) {
      const supervisor = await Personal.findById(req.body.supervisorId);
      if (!supervisor) {
        return res.status(400).json({
          success: false,
          message: "El supervisor seleccionado no existe",
        });
      }
    }
    const embarqueData = {
      ...req.body,
      usuarioId: req.user._id
    };

    const embarque = new Embarque(embarqueData);
    await embarque.save();

    return res.status(201).json({
      success: true,
      message: "Embarque creado exitosamente",
      data: embarque,
    });
  } catch (error) {
    console.error("Error al crear embarque:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "El número de guía ya existe",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};
export const listEmbarques = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-fechaSalida",
      estado,
      cliente,
      search,
      myShipments, 
    } = req.query;

    const filters = {};

    if (estado) filters.estado = estado;
    if (cliente) filters.cliente = { $regex: cliente, $options: "i" };

    if (search) {
      filters.$or = [
        { numeroGuia: { $regex: search, $options: "i" } },
        { cliente: { $regex: search, $options: "i" } },
        { destino: { $regex: search, $options: "i" } },
      ];
    }
    if (myShipments === "true" || (req.user && req.user.rol !== "admin")) {
      const personal = await Personal.findOne({ usuarioId: req.user._id });
      
      if (personal) {
        filters.supervisorId = personal._id;
      } else {
        filters.usuarioId = req.user._id;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Embarque.find(filters)
        .populate("supervisorId", "nombre") 
        .populate("usuarioId", "nombre email") 
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Embarque.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al listar embarques:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los embarques",
      error: error.message,
    });
  }
};
export const getEmbarque = async (req, res, next) => {
  try {
    const embarque = await Embarque.findById(req.params.id);

    if (!embarque) {
      return res.status(404).json({
        success: false,
        message: "Embarque no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: embarque,
    });
  } catch (error) {
    console.error("Error al obtener embarque:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el embarque",
      error: error.message,
    });
  }
};
export const updateEmbarque = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar embarques",
      });
    }

    const embarque = await Embarque.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!embarque) {
      return res.status(404).json({
        success: false,
        message: "Embarque no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Embarque actualizado exitosamente",
      data: embarque,
    });
  } catch (error) {
    console.error("Error al actualizar embarque:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "El número de guía ya existe",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el embarque",
      error: error.message,
    });
  }
};
export const patchEmbarque = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar embarques",
      });
    }

    const embarque = await Embarque.findById(req.params.id);
    if (!embarque) {
      return res.status(404).json({
        success: false,
        message: "Embarque no encontrado",
      });
    }

    Object.assign(embarque, req.body);
    await embarque.save();

    return res.status(200).json({
      success: true,
      message: "Embarque actualizado exitosamente",
      data: embarque,
    });
  } catch (error) {
    console.error("Error al actualizar embarque:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el embarque",
      error: error.message,
    });
  }
};
export const deleteEmbarque = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar embarques",
      });
    }

    const embarque = await Embarque.findByIdAndDelete(req.params.id);

    if (!embarque) {
      return res.status(404).json({
        success: false,
        message: "Embarque no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Embarque eliminado exitosamente",
      data: {},
    });
  } catch (error) {
    console.error("Error al eliminar embarque:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el embarque",
      error: error.message,
    });
  }
};
export const getEstadisticas = async (req, res, next) => {
  try {
    const matchStage = {};
    if (req.user.rol !== "admin") {
      const personal = await Personal.findOne({ usuarioId: req.user._id });
      
      if (personal) {
        matchStage.supervisorId = personal._id;
      } else {
        matchStage.usuarioId = req.user._id;
      }
    }

    const stats = await Embarque.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalPeso: { $sum: "$peso" },
          avgPeso: { $avg: "$peso" },
          pendientes: {
            $sum: { $cond: [{ $eq: ["$estado", "pendiente"] }, 1, 0] },
          },
          enTransito: {
            $sum: { $cond: [{ $eq: ["$estado", "en-transito"] }, 1, 0] },
          },
          enAduana: {
            $sum: { $cond: [{ $eq: ["$estado", "en-aduana"] }, 1, 0] },
          },
          entregados: {
            $sum: { $cond: [{ $eq: ["$estado", "entregado"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      totalPeso: 0,
      avgPeso: 0,
      pendientes: 0,
      enTransito: 0,
      enAduana: 0,
      entregados: 0
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};
