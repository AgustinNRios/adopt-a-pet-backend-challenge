import Adoption from '../dao/Adoption';
import Pet from '../dao/Pets.dao';
import Users from '../dao/Users.dao';
import AdoptionRepository from '../repository/AdoptionRepository';
import PetRepository from '../repository/PetRepository';
import UserRepository from '../repository/UserRepository';

export const usersService = new UserRepository(new Users());
export const petsService = new PetRepository(new Pet());
export const adoptionsService = new AdoptionRepository(new Adoption());
