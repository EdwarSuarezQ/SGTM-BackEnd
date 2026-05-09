import mongoose from "mongoose";

const EmbarqueSchema = new mongoose.Schema(
  {
    numeroGuia: {
      type: String,
      required: [true, "El número de guía es obligatorio"],
      unique: true,
      trim: true,
    },
    cliente: {
      type: String,
      required: [true, "El cliente es obligatorio"],
      trim: true,
    },
    origen: {
      type: String,
      required: [true, "El origen es obligatorio"],
      trim: true,
    },
    destino: {
      type: String,
      required: [true, "El destino es obligatorio"],
      trim: true,
    },
    embarcacionId: { type: mongoose.Schema.Types.ObjectId, ref: "Embarcacion" }, 
    rutaId: { type: mongoose.Schema.Types.ObjectId, ref: "Ruta" }, 
    almacenId: { type: mongoose.Schema.Types.ObjectId, ref: "Almacen" }, 
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "Personal" }, 
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    fechaSalida: {
      type: Date,
      required: [true, "La fecha de salida es obligatoria"],
    },
    fechaEstimada: {
      type: Date,
    },
    estado: {
      type: String,
      enum: [
        "pendiente",
        "en-transito",
        "en-aduana",
        "entregado",
        "retrasado",
        "cancelado",
        "completado",
      ],
      default: "pendiente",
    },
    tipoCarga: {
      type: String,
      enum: [
        "seco",
        "refrigerado",
        "peligroso",
        "perecedero",
        "sobredimensionado",
      ],
      default: "seco",
    },
    peso: {
      type: Number,
      min: [0, "El peso no puede ser negativo"],
      default: 0,
    },
    volumen: {
      type: Number,
      min: [0, "El volumen no puede ser negativo"],
      default: 0,
    },
    valorDeclarado: {
      type: Number,
      min: [0, "El valor declarado no puede ser negativo"],
      default: 0,
    },
    observaciones: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
EmbarqueSchema.index({ cliente: 1 });
EmbarqueSchema.index({ estado: 1 });
EmbarqueSchema.index({ fechaSalida: 1 });

const Embarque = mongoose.model("Embarque", EmbarqueSchema, "embarques");
export default Embarque;
