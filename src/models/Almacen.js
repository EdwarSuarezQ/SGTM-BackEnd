import mongoose from "mongoose";

const AlmacenSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  ubicacion: { type: String, required: true, trim: true },
  capacidad: { type: Number, min: 0, required: true },
  ocupacion: { type: Number, min: 0, max: 100, default: 0 },
  estado: {
    type: String,
    enum: ["operativo", "mantenimiento", "inoperativo"],
    default: "operativo",
  },
  proximoMantenimiento: { type: Date },
  encargadoId: { type: mongoose.Schema.Types.ObjectId, ref: "Personal" }, // Jefe de bodega
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AlmacenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Almacen = mongoose.model("Almacen", AlmacenSchema, "almacenes");
export default Almacen;
