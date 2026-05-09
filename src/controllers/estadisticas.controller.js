import Tarea from "../models/Tarea.js";
import Embarque from "../models/Embarque.js";
import Embarcacion from "../models/Embarcacion.js";
import Almacen from "../models/Almacen.js";
import Factura from "../models/Factura.js";

export const getResumenEstadisticas = async (req, res, next) => {
  try {
    const [
      totalTareas,
      tareasPendientes,
      tareasCompletadas,
      totalEmbarques,
      embarquesEnTransito,
      totalEmbarcaciones,
      embarcacionesEnPuerto,
      totalAlmacenes,
      facturasTotal,
      facturasPaid,
      facturasPending,
      facturasOverdue,
    ] = await Promise.all([
      Tarea.countDocuments(),
      Tarea.countDocuments({ estado: "pendiente" }),
      Tarea.countDocuments({ estado: "completada" }),
      Embarque.countDocuments(),
      Embarque.countDocuments({ estado: "en-transito" }),
      Embarcacion.countDocuments(),
      Embarcacion.countDocuments({ estado: "en-puerto" }),
      Almacen.countDocuments(),
      Factura.countDocuments(),
      Factura.countDocuments({ estado: "pagada" }),
      Factura.countDocuments({ estado: "pendiente" }),
      Factura.countDocuments({ estado: "vencida" }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        tareas: {
          total: totalTareas,
          pendientes: tareasPendientes,
          completadas: tareasCompletadas,
        },
        embarques: {
          total: totalEmbarques,
          enTransito: embarquesEnTransito,
        },
        embarcaciones: {
          total: totalEmbarcaciones,
          enPuerto: embarcacionesEnPuerto,
        },
        almacenes: {
          total: totalAlmacenes,
        },
        facturas: {
          total: facturasTotal,
          pagadas: facturasPaid,
          pendientes: facturasPending,
          vencidas: facturasOverdue,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
