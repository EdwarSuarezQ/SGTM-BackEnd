import Factura from "../models/Factura.js";
export const createFactura = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear facturas",
      });
    }

    const factura = new Factura(req.body);
    await factura.save();

    return res.status(201).json({
      success: true,
      message: "Factura creada exitosamente",
      data: factura,
    });
  } catch (err) {
    console.error("❌ Error al crear factura:", err);
    console.error("🔍 Detalles del error:", err.message);
    console.error("📝 Stack:", err.stack);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "El ID de factura ya existe",
        error: "DUPLICATE_ID",
      });
    }
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear la factura",
      error: err.message,
    });
  }
};
export const listFacturas = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      q, 
      estado,
      cliente,
      fechaDesde,
      fechaHasta,
    } = req.query;

    const filters = {};
    if (q) {
      filters.$or = [
        { idFactura: new RegExp(q, "i") },
        { cliente: new RegExp(q, "i") },
        { concepto: new RegExp(q, "i") },
      ];
    }
    if (estado) filters.estado = estado;
    if (cliente) filters.cliente = new RegExp(cliente, "i");
    if (fechaDesde || fechaHasta) {
      filters.fechaEmision = {};
      if (fechaDesde) filters.fechaEmision.$gte = fechaDesde;
      if (fechaHasta) filters.fechaEmision.$lte = fechaHasta;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Factura.find(filters).sort(sort).skip(skip).limit(parseInt(limit)),
      Factura.countDocuments(filters),
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
    console.error("Error al listar facturas:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las facturas",
      error: err.message,
    });
  }
};
export const getFactura = async (req, res, next) => {
  try {
    const factura = await Factura.findById(req.params.id);
    if (!factura) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: factura,
    });
  } catch (err) {
    console.error("Error al obtener factura:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la factura",
      error: err.message,
    });
  }
};
export const updateFactura = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar facturas",
      });
    }

    const factura = await Factura.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Factura actualizada exitosamente",
      data: factura,
    });
  } catch (err) {
    console.error("Error al actualizar factura:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "El ID de factura ya existe",
        error: "DUPLICATE_ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar la factura",
      error: err.message,
    });
  }
};
export const patchFactura = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar facturas",
      });
    }

    const factura = await Factura.findById(req.params.id);
    if (!factura) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }

    Object.assign(factura, req.body);
    await factura.save();

    return res.status(200).json({
      success: true,
      message: "Factura actualizada parcialmente",
      data: factura,
    });
  } catch (err) {
    console.error("Error al actualizar factura parcialmente:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "El ID de factura ya existe",
        error: "DUPLICATE_ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar la factura",
      error: err.message,
    });
  }
};
export const deleteFactura = async (req, res, next) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar facturas",
      });
    }

    const factura = await Factura.findByIdAndDelete(req.params.id);
    if (!factura) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Factura eliminada exitosamente",
      data: {},
    });
  } catch (err) {
    console.error("Error al eliminar factura:", err);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar la factura",
      error: err.message,
    });
  }
};
export const facturasStats = async (req, res, next) => {
  try {
    const stats = await Factura.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pendientes: {
            $sum: { $cond: [{ $eq: ["$estado", "pendiente"] }, 1, 0] },
          },
          pagadas: {
            $sum: { $cond: [{ $eq: ["$estado", "pagada"] }, 1, 0] },
          },
          vencidas: {
            $sum: { $cond: [{ $eq: ["$estado", "vencida"] }, 1, 0] },
          },
          canceladas: {
            $sum: { $cond: [{ $eq: ["$estado", "cancelada"] }, 1, 0] },
          },
          totalFacturado: {
            $sum: {
              $cond: [{ $ne: ["$estado", "cancelada"] }, "$monto", 0],
            },
          },
          totalPagado: {
            $sum: {
              $cond: [{ $eq: ["$estado", "pagada"] }, "$monto", 0],
            },
          },
          totalPendiente: {
            $sum: {
              $cond: [{ $eq: ["$estado", "pendiente"] }, "$monto", 0],
            },
          },
        },
      },
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      pendientes: 0,
      pagadas: 0,
      vencidas: 0,
      canceladas: 0,
      totalFacturado: 0,
      totalPagado: 0,
      totalPendiente: 0
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las estadísticas",
      error: err.message,
    });
  }
};
