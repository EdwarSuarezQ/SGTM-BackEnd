
import { z } from "zod";
const userBaseSchema = {
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
};
export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  ...userBaseSchema,
});
export const loginSchema = z.object({
  ...userBaseSchema,
});
export const updateProfileSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .optional(),
  email: z.string().email("Email inválido").optional(),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});
export const tareaSchema = z.object({
  titulo: z
    .string()
    .min(1, "El título es requerido")
    .max(100, "El título no puede tener más de 100 caracteres")
    .trim(),
  descripcion: z
    .string()
    .max(500, "La descripción no puede tener más de 500 caracteres")
    .trim()
    .optional()
    .default(""),
  asignado: z
    .string()
    .max(100, "El nombre asignado no puede tener más de 100 caracteres")
    .trim()
    .optional()
    .default(""),
  fecha: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Fecha inválida")
    .optional(), 
  prioridad: z.enum(["alta", "media", "baja"]).default("media"),
  estado: z.enum(["pendiente", "en-progreso", "completada"]).default("pendiente"),
  departamento: z
    .string()
    .max(100, "El departamento no puede tener más de 100 caracteres")
    .trim()
    .optional()
    .default(""),
});
export const updateTareaSchema = tareaSchema.partial();
export const facturaSchema = z.object({
  idFactura: z
    .string()
    .min(1, "El ID de factura es requerido")
    .max(50, "El ID de factura no puede tener más de 50 caracteres")
    .trim()
    .toUpperCase(),
  cliente: z
    .string()
    .min(1, "El cliente es requerido")
    .max(100, "El nombre del cliente no puede tener más de 100 caracteres")
    .trim(),
  fechaEmision: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Fecha de emisión inválida"),
  fechaVencimiento: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Fecha de vencimiento inválida")
    .optional()
    .default(""),
  monto: z
    .number()
    .min(0, "El monto no puede ser negativo")
    .max(9999999.99, "El monto es demasiado grande"),
  estado: z
    .enum(["pagada", "pendiente", "vencida", "cancelada"])
    .default("pendiente"),
  concepto: z
    .string()
    .max(500, "El concepto no puede tener más de 500 caracteres")
    .trim()
    .optional()
    .default(""),
  notas: z
    .string()
    .max(1000, "Las notas no pueden tener más de 1000 caracteres")
    .trim()
    .optional()
    .default(""),
});
export const updateFacturaSchema = facturaSchema.partial();
export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    console.error("Error de validación:", error);
    
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Error interno de validación",
      error: error.message
    });
  }
};
