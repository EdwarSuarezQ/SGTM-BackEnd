import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "./config.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import tareasRoutes from "./routes/tareas.routes.js";
import embarquesRoutes from "./routes/embarques.routes.js";
import rutasRoutes from "./routes/rutas.routes.js";
import personalRoutes from "./routes/personal.routes.js";
import almacenRoutes from "./routes/almacen.routes.js";
import embarcacionesRoutes from "./routes/embarcaciones.routes.js";
import facturasRoutes from "./routes/facturas.routes.js";
import estadisticasRoutes from "./routes/estadisticas.routes.js";
import exportRoutes from "./routes/export.routes.js";
import errorHandler from "./middleware/error.js";

import { createRoles, createDocumentTypes } from "./libs/initialSetup.js";

const app = express();
createRoles();
createDocumentTypes();
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = config.corsOrigin ? config.corsOrigin.split(",") : [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tareas", tareasRoutes);
app.use("/api/embarques", embarquesRoutes);
app.use("/api/rutas", rutasRoutes);
app.use("/api/personal", personalRoutes);
app.use("/api/almacen", almacenRoutes);
app.use("/api/embarcaciones", embarcacionesRoutes);
app.use("/api/facturas", facturasRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/export", exportRoutes);
app.use(errorHandler);

export default app;
