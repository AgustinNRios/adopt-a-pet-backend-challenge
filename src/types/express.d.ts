// Augmentación del namespace Express para incluir tipado de `logger` obligatorio y `user` opcional.
// Coloca este archivo en `src/types/express.d.ts` y asegúrate de que TypeScript lo recoja automáticamente (por defecto lo hará si está dentro de la carpeta src).

import type { Logger } from 'winston';

import type UserDTO from '../dto/User.dto';

declare global {
  namespace Express {
    interface Request {
      /**
       * Instancia de winston logger inyectada por el middleware `middLogg`.
       * Siempre presente en cada request.
       */
      logger: Logger;
      /**
       * Información del usuario autenticado.
       * Será definida por middleware de autenticación cuando corresponda.
       */
      user?: UserDTO;
    }
  }
}

export {};
