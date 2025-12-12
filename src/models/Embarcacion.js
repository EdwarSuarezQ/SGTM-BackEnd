import mongoose from "mongoose";

const EmbarcacionSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  imo: { type: String, trim: true },
  fecha: { type: Date, required: true },
  capacidad: { type: String, required: true, trim: true },
  tipo: {
    type: String,
    enum: ["contenedor", "granel", "general", "cisterna"],
    required: true,
  },
  estado: {
    type: String,
    enum: ["pendiente", "en-transito", "en-ruta", "en-puerto"],
    default: "pendiente",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

EmbarcacionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Embarcacion = mongoose.model("Embarcacion", EmbarcacionSchema, "embarcaciones");
export default Embarcacion;
