import multer from 'multer';

declare module 'multer' {
  interface Multer {
    documents: multer.Multer;
    custom: (fileType: string) => multer.Multer;
  }
}
