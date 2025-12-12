import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "Por favor ingresa tu nombre"],
      trim: true,
      maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
    },
    email: {
      type: String,
      required: [true, "Por favor ingresa tu correo electrónico"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor ingresa un correo electrónico válido",
      ],
    },
    password: {
      type: String,
      required: [true, "Por favor ingresa una contraseña"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    rol: {
      type: Number,
      enum: [1, 2, 3], // 1 = admin, 2 = empleado, 3 = cliente
      default: 2, // Default to empleado
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema, "usuarios");
export default User;
