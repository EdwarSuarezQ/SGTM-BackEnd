import mongoose from "mongoose";

const PersonalSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/,
  },
  puesto: { type: String, required: true, trim: true },
  departamento: { type: String, required: true, trim: true },
  tipoDocumento: {
    type: String,
    required: true,
    enum: ["Cédula de Ciudadanía", "Tarjeta de Identidad", "Cédula de Extranjería"],
  },
  numeroDocumento: { type: String, required: true, unique: true, trim: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Relación con Usuario
  estado: { type: String, enum: ["activo", "inactivo"], default: "activo" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PersonalSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Personal = mongoose.model("Personal", PersonalSchema);
export default Personal;
