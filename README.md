# SGTM-CRUD Backend

API REST para el sistema de gestión de transporte marítimo.

---

## � Requisitos Previos

### 1. Node.js (v18 o superior)

**Verificar:**
```bash
node --version
npm --version
```

**Instalar:**
- Descarga desde [https://nodejs.org/](https://nodejs.org/) (versión LTS)

### 2. MongoDB

**Opción A: MongoDB Atlas (Gratis en la nube)**
- Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- Obtén tu URI de conexión

**Opción B: MongoDB Local**
- **Windows:** Descarga desde [MongoDB Community](https://www.mongodb.com/try/download/community)
- **Linux:** `sudo apt-get install -y mongodb-org`
- **macOS:** `brew install mongodb-community`

**Verificar:**
```bash
mongosh
```

---

## �🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | v18+ | Runtime de JavaScript |
| **Express** | ^4.21.2 | Framework web |
| **MongoDB** | - | Base de datos NoSQL |
| **Mongoose** | ^8.0.0 | ODM para MongoDB |
| **JWT** | ^9.0.2 | Autenticación |
| **Bcryptjs** | ^2.4.3 | Encriptación de contraseñas |
| **Zod** | ^4.1.12 | Validación de esquemas |
| **Express Validator** | ^7.3.0 | Validación de datos |
| **Cookie Parser** | ^1.4.7 | Manejo de cookies |
| **CORS** | ^2.8.5 | Control de acceso |
| **Morgan** | ^1.10.1 | Logger HTTP |
| **Dotenv** | ^16.6.1 | Variables de entorno |
| **Nodemon** | ^3.0.1 | Auto-reinicio (dev) |

---

## 🚀 Instalación

### 1. Navega a la carpeta del backend

```bash
cd backend
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/sgtm-crud
TOKEN_SECRET=tu_clave_secreta_aqui
FRONTEND_URL=http://localhost:5173
```

**Nota:** Si usas MongoDB Atlas, reemplaza `MONGODB_URI` con tu URI de conexión.

### 4. Inicia el servidor

```bash
# Modo desarrollo (con auto-reinicio)
npm run dev

# Modo producción
npm start
```

---

## 📡 Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/verify` - Verificar token
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Recursos (CRUD Completo)
Todos los recursos tienen: `GET`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id`

- `/api/tareas` - Gestión de tareas
- `/api/embarques` - Gestión de embarques
- `/api/rutas` - Gestión de rutas
- `/api/personal` - Gestión de personal
- `/api/almacen` - Gestión de almacenes
- `/api/embarcaciones` - Gestión de embarcaciones
- `/api/facturas` - Gestión de facturas

### Otros
- `GET /api/estadisticas` - Estadísticas generales
- `GET /api/export/:recurso` - Exportar datos

---

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/      # Lógica de negocio
│   ├── models/           # Modelos de MongoDB
│   ├── routes/           # Rutas de la API
│   ├── middleware/       # Autenticación y validación
│   ├── schemas/          # Esquemas de validación Zod
│   ├── db.js             # Configuración de MongoDB
│   ├── app.js            # Configuración de Express
│   └── index.js          # Punto de entrada
├── .env                  # Variables de entorno
└── package.json          # Dependencias
```

---

## ❓ Solución de Problemas

| Error | Solución |
|-------|----------|
| "Cannot find module" | `rm -rf node_modules && npm install` |
| "EADDRINUSE" | Cambia el `PORT` en `.env` |
| "MongooseServerSelectionError" | Verifica que MongoDB esté corriendo |
| "JWT must be provided" | Verifica `TOKEN_SECRET` y `FRONTEND_URL` en `.env` |
