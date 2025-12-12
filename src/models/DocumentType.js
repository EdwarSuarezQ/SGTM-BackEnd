import mongoose from "mongoose";

const documentTypeSchema = new mongoose.Schema(
  {
    idTipoDocumento: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true, // 'CC', 'TI', 'CE'
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("DocumentType", documentTypeSchema, "tiposdocumento");
