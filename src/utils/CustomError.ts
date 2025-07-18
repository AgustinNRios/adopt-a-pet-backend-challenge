import { Request, Response, NextFunction } from 'express';

import { logger } from '../config/logger';

import errorsDictionary from './dictionary/errors.dictionary';
import { IDictionaryError } from './dictionary/IDictionaryError';

export class CustomError extends Error {
  // errorKey nose si deberia traer este dato en el obj dictionary error
  // in typescript public readonly ... type string
  private dictionaryError: IDictionaryError;

  private details: string[];

  constructor(dictionaryError: IDictionaryError, details: string[] = []) {
    if (!dictionaryError) {
      super('Unknown error, this error is not found in dictionary');
      this.dictionaryError = errorsDictionary.INTERNAL_SERVER_ERROR;
    } else {
      super(dictionaryError.message);
      this.dictionaryError = dictionaryError;
    }
    this.details = details;
  }

  logError() {
    logger.fatal(
      this.message,
      this.dictionaryError.code,
      this.dictionaryError.httpStatus,
      this.dictionaryError.isOperational,
      this.details,
    );
  }

  sendResponse(res: Response) {
    return res.status(this.dictionaryError.httpStatus).json({
      status: 'error',
      error: {
        code: this.dictionaryError.code,
        message: this.message,
        details: this.details,
      },
    });
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof CustomError) {
    err.logError();
    err.sendResponse(res);
  }

  // Error no manejado y no enviado anteriormente
  res.status(500).json({
    status: 'error',
    error: {
      code: 9001,
      message: 'Error interno del servidor',
    },
  });
};
// class ErrorHandler {
//     public async handleError(error: Er.ror, responseStream: Response): Promise<void> {
//         await logger.logError(error);
//         await fireMonitoringMetric(error);
//         await crashIfUntrustedErrorOrSendResponse(error, responseStream);
//     };
// }

// export const handler = new ErrorHandler();

// Middleware para manejar errores
