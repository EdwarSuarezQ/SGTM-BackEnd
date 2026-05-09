import Tarea from "../models/Tarea.js";
import Embarque from "../models/Embarque.js";
import Embarcacion from "../models/Embarcacion.js";
import Almacen from "../models/Almacen.js";
import Personal from "../models/Personal.js";
import Ruta from "../models/Ruta.js";
import Factura from "../models/Factura.js";

const collectionsMap = {
  tareas: Tarea,
  embarques: Embarque,
  embarcaciones: Embarcacion,
  almacen: Almacen,
  personal: Personal,
  rutas: Ruta,
  facturas: Factura,
};

export const exportCollection = async (req, res, next) => {
  try {
    const { recurso } = req.params; 
    const Model = collectionsMap[recurso];

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Recurso de exportación no válido",
      });
    }
    const items = await Model.find({}).lean();

    return res.status(200).json({
      success: true,
      recurso,
      total: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};
