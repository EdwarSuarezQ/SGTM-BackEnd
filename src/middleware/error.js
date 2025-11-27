import ErrorResponse from "../utils/errorResponse.js";

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Error en el servidor";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorHandler;
