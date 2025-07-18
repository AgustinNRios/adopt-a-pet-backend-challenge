import { IPet } from '../dao/models/Pet';

import GenericRepository from './GenericRepository';

export default class PetRepository extends GenericRepository<IPet> {
  // El constructor se hereda automáticamente de GenericRepository
  // seria inutil agregarlo ya que no agrega funcionalidad
}
