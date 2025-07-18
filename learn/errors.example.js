import express from 'express';
import { logger } from '../src/config/logger';

const app = express();
// Solo fallback, se puede eliminar si solo se usa req.logger
const port = 3000;

//* Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
//* Objeto Lista de Errores
// -------------------------
const ListErrors = {
  ROUTING_ERROR: 1,
  INVALID_TYPES_ERROR: 2,
  DATABASE_ERROR: 3,
  AUTH_ERROR: 4,
  INVALID_PARAM_ERROR: 5,
};

// function errorer(code) {
//   if(code===1) console.log(code);
//   if(code===2)  console.error(code);
//   return
// }

// -------------------------
//* CustomError Class <- Hemos creado una Clase Error personalizada
// -------------------------
class CustomError extends Error {
  constructor(message, code = 500, cause = null) {
    super(message); // Herencia -> Es para el constructor del padre -> Error(message)
    this.code = code;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}

// const errors = new CustomError("soy el mensaje", 404, {campo: "email", detalle: "Este campo es obligatorio y debe ser un string tipo email"})

app.get('/', (req, res) => {
  // errorer(ListErrors.INVALID_PARAM_ERROR)
  res.send('Hello World!');
});

// Route 01 - Error no controlado
app.get('/error-no-controlado', (req, res) => {
  throw new Error('Este es un error de nannannanana no controlado');
});

// Route 02 - Error Controlado
app.get('/error-custom', (req, res, next) => {});

// Route 03 - Error Controlado
app.get('/error-custom-pro', (req, res, next) => {
  const { id, name } = req.query;

  const errores = [];
  if (!id) {
    errores.push({ campo: 'id', detalle: "El parámetro 'id' es requerido" }); //* Cargamos la 'cause'
  } else if (isNaN(Number(id))) {
    errores.push({ campo: 'id', detalle: "El 'id' debe ser un número" });
  }

  if (!name) {
    errores.push({
      campo: 'name',
      detalle: "El parámetro 'name' es requerido",
    });
  } else if (typeof name !== 'string' || name.trim().length < 2) {
    errores.push({
      campo: 'name',
      detalle: "El 'name' debe ser un string de al menos 2 caracteres",
    });
  }

  //* En esta parte estamos atrapando los errores utilizando nuestra clase y retornando next(error) -> para que se active nuestro middelware de errorHandle
  if (errores.length > 0) {
    const error = new CustomError(
      'Parámetros inválidos en la consulta',
      ListErrors.INVALID_PARAM_ERROR,
      errores,
    );
    return next(error);
  }

  res.status(200).json({
    status: 'success',
    message: 'Parámetros válidos',
    data: { id: Number(id), name },
  });
});

// -------------------------
//* Function errorHandle para nuestro Middelware
// -------------------------

// class ErrorHandler {
//     public async handleError(error: Error, responseStream: Response): Promise<void> {
//         await logger.logError(error);
//         await fireMonitoringMetric(error);
//         await crashIfUntrustedErrorOrSendResponse(error, responseStream);
//     };
// }

export const handler = new ErrorHandler();
function errorHandle(error, req, res, next) {
  req.logger.fatal('Error capturado por el middleware:');
  let statusCode = 500;
  if (error.code && typeof error.code === 'number') {
    if (error.code === ListErrors.INVALID_PARAM_ERROR) statusCode = 402;

    req.logger.warn('Error controlado:');
    req.logger.warn('Mensaje:', error.message);
    req.logger.warn('Causa:', JSON.stringify(error.cause, null, 2));
    req.logger.warn('Stack trace:', error.stack);
    res.setHeader('Content-Type', 'application/json');

    //* Respuesta controlada
    return res.status(statusCode).json({
      status: 'error',
      message: error.message,
      cause: error.cause || 'No se proporcionó causa',
    });
  }
}
app.use(errorHandle);
export default app;
