import mongoose from 'mongoose';

import { IUserDocument } from './models/User';

// Interfaz genérica para los DAOs
export interface IGenericDAO<T> {
  get(params: Partial<T>): Promise<T[]>;
  getBy(params: Partial<T>): Promise<T | null>;
  save(doc: T): Promise<T>;
  update(id: mongoose.Types.ObjectId | string, doc: Partial<T>): Promise<T | null>;
  delete(id: mongoose.Types.ObjectId | string): Promise<boolean>;
  addDocuments?(userId: mongoose.Types.ObjectId | string, documents: IUserDocument[]): Promise<T>;
}
