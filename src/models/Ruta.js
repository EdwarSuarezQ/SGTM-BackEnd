import mongoose from "mongoose";

const RutaSchema = new mongoose.Schema({
  idRuta: { type: String, required: true, unique: true, trim: true },
  nombre: { type: String, required: true, trim: true },
  origen: { type: String, required: true, trim: true },
  paisOrigen: { type: String, required: true, trim: true },
  estadoOrigen: { type: String, trim: true },
  destino: { type: String, required: true, trim: true },
  paisDestino: { type: String, required: true, trim: true },
  estadoDestino: { type: String, trim: true },
  distancia: { type: Number, min: 0 },
  duracion: { type: String, trim: true },
  tipo: {
    type: String,
    enum: ["internacional", "regional", "costera"],
    required: true,
  },
  estado: {
    type: String,
    enum: ["activa", "pendiente", "completada", "inactiva"],
    default: "activa",
  },
  viajesAnio: { type: Number, min: 0, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RutaSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Ruta = mongoose.model("Ruta", RutaSchema);
export default Ruta;
