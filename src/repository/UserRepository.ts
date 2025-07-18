import mongoose from 'mongoose';

import { IUser } from '../dao/models/User';

import GenericRepository from './GenericRepository';

export default class UserRepository extends GenericRepository<IUser> {
  // El constructor se hereda automáticamente de GenericRepository
  // seria inutil agregarlo ya que no agrega funcionalidad

  getUserByEmail = (email: string) => this.getBy({ email });

  getUserById = (id: mongoose.Types.ObjectId | string) => this.getBy({ _id: id });
}
