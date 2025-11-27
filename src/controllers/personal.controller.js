import Personal from "../models/Personal.js";
import User from "../models/User.js";

// Crear registro de personal - VERSIÓN MEJORADA
export const createPersonal = async (req, res, next) => {
  try {
    // Verificar permisos (solo admin)
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear personal",
      });
    }

    // 1. Verificar si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado como usuario del sistema",
      });
    }

    // 2. Crear el personal
    const persona = new Personal(req.body);
    await persona.save();

    // 3. Crear el usuario asociado automáticamente
    try {
      // Ensure password has at least 6 characters (User model requirement)
      const password = persona.numeroDocumento.trim();
      const finalPassword = password.length >= 6 ? password : password.padEnd(6, '0');
      
      const newUser = await User.create({
        nombre: persona.nombre,
        email: persona.email,
        password: finalPassword,
        rol: req.body.rol || "user",
      });

      // Actualizar el personal con el ID del usuario creado
      persona.usuarioId = newUser._id;
      await persona.save();
    } catch (userError) {
      // Si falla la creación del usuario, eliminamos el personal creado (rollback manual)
      await Personal.findByIdAndDelete(persona._id);
      
      // Si es error de validación (ej. contraseña corta), devolver 400
      if (userError.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Error al crear el usuario: " + Object.values(userError.errors).map(e => e.message).join(", "),
        });
      }

      throw new Error(
        "Error al crear el usuario de sistema. Se ha revertido la operación. " +
          userError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Personal y usuario de sistema creados exitosamente",
      data: persona,
    });
  } catch (error) {
    console.error("Error al crear personal:", error);

    // Manejar errores de duplicado (email o documento único)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `El ${field} ya está registrado`,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear el personal",
      error: error.message,
    });
  }
};

// Listar personal con paginación y filtros - VERSIÓN MEJORADA
export const listPersonal = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      estado,
      departamento,
      q, // Búsqueda general
    } = req.query;

    const filters = {};

    if (estado) filters.estado = estado;
    if (departamento) filters.departamento = departamento;

    // Búsqueda general por nombre, email o puesto
    if (q) {
      filters.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { puesto: { $regex: q, $options: "i" } },
        { departamento: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Personal.find(filters).sort(sort).skip(skip).limit(parseInt(limit)).populate("usuarioId", "rol email"),
      Personal.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al listar personal:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el personal",
      error: error.message,
    });
  }
};

// Obtener personal por ID - VERSIÓN MEJORADA
export const getPersonal = async (req, res, next) => {
  try {
    const persona = await Personal.findById(req.params.id).populate("usuarioId", "rol email");

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Personal no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: persona,
    });
  } catch (error) {
    console.error("Error al obtener personal:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el personal",
      error: error.message,
    });
  }
};

// Actualizar personal completo - VERSIÓN MEJORADA
export const updatePersonal = async (req, res, next) => {
  try {
    // Verificar permisos (solo admin)
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar personal",
      });
    }

    const persona = await Personal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Personal no encontrado",
      });
    }

    // Si se envía el rol, actualizar también el usuario asociado
    if (req.body.rol && persona.usuarioId) {
      await User.findByIdAndUpdate(persona.usuarioId, { rol: req.body.rol });
    }

    return res.status(200).json({
      success: true,
      message: "Personal actualizado exitosamente",
      data: persona,
    });
  } catch (error) {
    console.error("Error al actualizar personal:", error);

    // Manejar errores de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el personal",
      error: error.message,
    });
  }
};

// Actualizar personal parcialmente - VERSIÓN MEJORADA
export const patchPersonal = async (req, res, next) => {
  try {
    // Verificar permisos (solo admin)
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar personal",
      });
    }

    const persona = await Personal.findById(req.params.id);

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Personal no encontrado",
      });
    }

    Object.assign(persona, req.body);
    await persona.save();

    return res.status(200).json({
      success: true,
      message: "Personal actualizado exitosamente",
      data: persona,
    });
  } catch (error) {
    console.error("Error al actualizar personal:", error);

    // Manejar errores de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el personal",
      error: error.message,
    });
  }
};

// Eliminar personal - VERSIÓN MEJORADA
export const deletePersonal = async (req, res, next) => {
  try {
    // Verificar permisos (solo admin)
    if (req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar personal",
      });
    }

    // Check if personal has assigned tareas
    const Tarea = (await import("../models/Tarea.js")).default;
    const tareasAsignadas = await Tarea.countDocuments({ asignadoId: req.params.id });
    
    if (tareasAsignadas > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Hay ${tareasAsignadas} tarea(s) asignada(s) a esta persona. Por favor, reasigna o elimina las tareas primero.`,
      });
    }

    const persona = await Personal.findByIdAndDelete(req.params.id);

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Personal no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Personal eliminado exitosamente",
      data: {},
    });
  } catch (error) {
    console.error("Error al eliminar personal:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el personal",
      error: error.message,
    });
  }
};

// Estadísticas de personal - NUEVO (como tareasStats)
// Estadísticas de personal - OPTIMIZADO CON AGREGACIÓN
export const personalStats = async (req, res, next) => {
  try {
    const stats = await Personal.aggregate([
      {
        $facet: {
          general: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                activos: {
                  $sum: { $cond: [{ $eq: ["$estado", "activo"] }, 1, 0] },
                },
                inactivos: {
                  $sum: { $cond: [{ $eq: ["$estado", "inactivo"] }, 1, 0] },
                },
              },
            },
          ],
          porDepartamento: [
            {
              $group: {
                _id: "$departamento",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const generalStats = stats[0].general[0] || {
      total: 0,
      activos: 0,
      inactivos: 0,
    };
    const porDepartamento = stats[0].porDepartamento || [];

    return res.status(200).json({
      success: true,
      data: {
        ...generalStats,
        porDepartamento,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};
