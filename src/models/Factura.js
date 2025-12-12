import mongoose from "mongoose";

const FacturaSchema = new mongoose.Schema({
  idFactura: {
    type: String,
    required: [true, "El ID de factura es requerido"],
    unique: true,
    trim: true,
    uppercase: true,
  },
  cliente: {
    type: String,
    required: [true, "El cliente es requerido"],
    trim: true,
  },
  embarqueId: { type: mongoose.Schema.Types.ObjectId, ref: "Embarque" }, // Relación opcional con Embarque
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Usuario que emitió la factura
  fechaEmision: {
    type: Date,
    required: [true, "La fecha de emisión es requerida"],
  },
  fechaVencimiento: {
    type: Date,
  },
  monto: {
    type: Number,
    min: [0, "El monto no puede ser negativo"],
    required: [true, "El monto es requerido"],
  },
  estado: {
    type: String,
    enum: {
      values: ["pagada", "pendiente", "vencida", "cancelada"],
      message: "Estado inválido",
    },
    default: "pendiente",
  },
  concepto: { type: String, trim: true },
  notas: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

FacturaSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Factura = mongoose.model("Factura", FacturaSchema, "facturas");
export default Factura;
