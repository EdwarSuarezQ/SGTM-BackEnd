import User from "../models/User.js";
import { createAccessToken, verifyToken as verifyJWT } from "../libs/jwt.js";
import ErrorResponse from "../utils/errorResponse.js";
const getRoleName = (rolId) => {
  const roles = { 1: "admin", 2: "empleado", 3: "cliente" };
  return roles[rolId] || "empleado";
};

export const register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse("El correo ya está registrado", 400));
    }
    const user = await User.create({
      nombre,
      email,
      password,
      rol: 2, 
    });

    const token = await createAccessToken({ id: user._id });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 12 * 60 * 60 * 1000), 
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(201).json({
      success: true,
      token: token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: getRoleName(user.rol),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse("Por favor ingresa correo y contraseña", 400)
      );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse("Credenciales inválidas", 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Credenciales inválidas", 401));
    }

    const token = await createAccessToken({ id: user._id });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 12 * 60 * 60 * 1000), 
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({
      success: true,
      token: token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: getRoleName(user.rol),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.sendStatus(200);
};
export const verifyToken = async (req, res) => {
  try {
    let { token } = req.cookies;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: "Token no proporcionado",
      });
    }

    const decoded = await verifyJWT(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: getRoleName(user.rol), 
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      message: error.message || "Token inválido",
    });
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const { nombre, email } = req.body;
    const userId = req.user._id;
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return next(new ErrorResponse("El correo ya está en uso", 400));
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { nombre, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return next(new ErrorResponse("Usuario no encontrado", 404));
    }

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return next(new ErrorResponse("Usuario no encontrado", 404));
    }
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse("La contraseña actual es incorrecta", 401));
    }
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (err) {
    next(err);
  }
};

