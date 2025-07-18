//  TS(7016): Could not find a declaration file for module 'mult... Remove this comment to see the full error message
import { Request } from 'express';
import multer, { StorageEngine } from 'multer';

import __dirname from './index';

// Función para crear storage configurado según tipo de archivo
const createStorage = (folder: string): StorageEngine =>
  multer.diskStorage({
    destination(
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ): void {
      cb(null, `${__dirname}/../public/${folder}`);
    },
    filename(
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ): void {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

// Storage por defecto para imágenes de mascotas
const petStorage = createStorage('img/pets');

// Storage para documentos
const documentsStorage = createStorage('documents');

// Uploader por defecto (para compatibilidad con código existente)
const uploader = multer({ storage: petStorage });

// Uploader específico para documentos
uploader.documents = multer({ storage: documentsStorage });

// Función auxiliar para elegir el storage según el tipo
uploader.custom = (fileType: string) => {
  switch (fileType) {
    case 'documents':
      return multer({ storage: documentsStorage });
    case 'pets':
    default:
      return multer({ storage: petStorage });
  }
};

export default uploader;
