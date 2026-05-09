import mongoose from "mongoose";

const TareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  asignado: { type: String, trim: true }, 
  asignadoId: { type: mongoose.Schema.Types.ObjectId, ref: "Personal" }, 
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  fecha: { type: Date, required: true },
  prioridad: {
    type: String,
    enum: ["alta", "media", "baja"],
    default: "media",
  },
  estado: {
    type: String,
    enum: ["pendiente", "en-progreso", "completada"],
    default: "pendiente",
  },
  departamento: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TareaSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Tarea = mongoose.model("Tarea", TareaSchema, "tareas");
export default Tarea;
