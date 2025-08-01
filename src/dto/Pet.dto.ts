import { IPet } from '../dao/models/Pet';

export default class PetDTO {
  static getPetInputFrom = (pet: IPet) => ({
    name: pet.name || '',
    specie: pet.specie || '',
    image: pet.image || '',
    birthDate: pet.birthDate || new Date('12-30-2000'),
    adopted: false,
  });
}
