import Role from "../models/Role.js";
import DocumentType from "../models/DocumentType.js";

export const createRoles = async () => {
  try {
    const count = await Role.estimatedDocumentCount();

    if (count > 0) return;

    const values = await Promise.all([
      new Role({ idRol: 1, name: "admin", description: "Administrador del sistema" }).save(),
      new Role({ idRol: 2, name: "empleado", description: "Empleado de la empresa" }).save(),
      new Role({ idRol: 3, name: "cliente", description: "Cliente externo" }).save(),
    ]);

    console.log("Roles creados por defecto:", values);
  } catch (error) {
    console.error("Error creando roles:", error);
  }
};

export const createDocumentTypes = async () => {
  try {
    const count = await DocumentType.estimatedDocumentCount();

    if (count > 0) return;

    const values = await Promise.all([
      new DocumentType({ idTipoDocumento: 1, name: "Cédula de Ciudadanía", code: "CC" }).save(),
      new DocumentType({ idTipoDocumento: 2, name: "Tarjeta de Identidad", code: "TI" }).save(),
      new DocumentType({ idTipoDocumento: 3, name: "Cédula de Extranjería", code: "CE" }).save(),
      new DocumentType({ idTipoDocumento: 4, name: "Pasaporte", code: "PA" }).save(),
    ]);

    console.log("Tipos de documento creados por defecto:", values);
  } catch (error) {
    console.error("Error creando tipos de documento:", error);
  }
};
