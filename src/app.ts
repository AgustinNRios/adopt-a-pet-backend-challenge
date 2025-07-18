import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

import config from './config/config';
import { logger, middLogg } from './config/logger';
import swaggerDocs from './config/swagger';
import adoptionsRouter from './routes/adoption.router';
import mocksRouter from './routes/mocks.router';
import petsRouter from './routes/pets.router';
import sessionsRouter from './routes/sessions.router';
import usersRouter from './routes/users.router';
import { errorHandler } from './utils/CustomError';

const app = express();
mongoose.connection.on('connected', () => {
  if (logger && logger.info) logger.info('✅ Conectado a MongoDB.');
});

mongoose.connection.on('error', err => {
  if (logger && logger.fatal) {
    logger.fatal('❌ Error al conectar a MongoDB:', err);
  } else {
    console.error('❌ Error al conectar a MongoDB:', err);
  }
});

// strictQuery es una opción de seguridad en Mongoose que controla cómo se manejan las consultas a la base de datos. Específicamente:
// Activado (true): Solo permite consultar campos que están definidos en el esquema del modelo.
// Desactivado (false): Permite consultar cualquier campo, incluso si no está definido en el esquema.
mongoose.set('strictQuery', false);

mongoose.connect(config.MONGO_DB_URL);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json());
app.use(cookieParser());
app.use(middLogg);

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);

app.get('/loggerTest', (req: Request, res: Response) => {
  req.logger.debug('Debug log test');
  req.logger.http('HTTP log test');
  req.logger.info('Info log test');
  req.logger.warning('Warning log test');
  req.logger.error('Error log test');
  req.logger.fatal('Fatal log test');
  res.send('Logger test completed. Check your console and errors.log file.');
});

// app.get("/error-no-controlado", (req, res) => {
//     const error = new CustomError(errorsDictionary.DEPENDENCY_NOT_FOUND,
// ['no se encontro la dependencia tal', 'tambien ocurrio esto']);
//     throw error;
// });

app.use(errorHandler);

process.on('unhandledRejection', (reason, p) => {
  logger.fatal('unhandledRejection', reason, p);
  // I just caught an unhandled promise rejection,
  // since we already have fallback handler for unhandled errors (see below),
  // let throw and let him handle that
  throw reason;
});

process.on('uncaughtException', error => {
  logger.fatal('uncaughtException', error);
  // pendiente ver si voy a salir del proceso
  // process.exit(1);

  // I just received an error that was never handled,
  // time to handle it and then decide whether a restart is needed
  // errorManagement.handler.handleError(error);
  // if (!errorManagement.handler.isTrustedError(error))
  //   process.exit(1);
});

// La inicialización del servidor se ha movido a server.js

export default app;
