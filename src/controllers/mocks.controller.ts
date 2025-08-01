import { faker } from '@faker-js/faker';
import { Request, Response } from 'express';

import { IUser } from '../dao/models/User';
import PetDTO from '../dto/Pet.dto';
// Importaciones no utilizadas comentadas para evitar errores de lint
// import { petsService, usersService } from '../services/index';
import { handleMongooseError, createHash } from '../utils';

const mockingPets = async (req: Request, res: Response) => {
  try {
    const num = 100;
    const pets = [];

    // Generamos las mascotas sin intentar guardarlas en la base de datos
    for (let i = 0; i < num; i += 1) {
      const pet = PetDTO.getPetInputFrom({
        name: faker.animal.petName(),
        specie: faker.animal.type(),
        birthDate: faker.date.past(),
        adopted: false,
        image: faker.image.avatar(),
      });
      pets.push(pet);
    }

    // Solo devolvemos los datos generados sin intentar guardarlos
    // Esto evita errores de conexión a MongoDB
    res.status(200).send({ status: 'success', payload: pets });
  } catch (err: unknown) {
    handleMongooseError(res, err);
  }
};

const mockingUsers = async (req: Request, res: Response) => {
  try {
    const num = 50;
    const users = [];
    const hashedPassword = await createHash('coder123');

    for (let i = 0; i < num; i += 1) {
      // Generamos un ID de MongoDB simulado
      const mockId = faker.database.mongodbObjectId();

      const user: IUser = {
        _id: mockId,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: hashedPassword,
        role: faker.helpers.arrayElement(['user', 'admin']),
        pets: [],
        last_connection: faker.date.recent(),
        documents: [],
      };
      users.push(user);
    }

    // No creamos realmente los usuarios en la base de datos para evitar conflictos
    // const result = await usersService.create(users);
    console.log('Ejecutando versión actualizada del mockingUsers');
    res.status(200).send({ status: 'success', message: 'Versión actualizada', payload: users });
  } catch (error: unknown) {
    handleMongooseError(res, error);
  }
};

const generateData = async (req: Request, res: Response) => {
  try {
    const { users = 0, pets = 0 } = req.body;

    const generatedUsers = [];
    const hashedPassword = await createHash('coder123');

    for (let i = 0; i < users; i += 1) {
      // Generamos un ID de MongoDB simulado
      const mockId = faker.database.mongodbObjectId();

      const user = {
        _id: mockId,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: hashedPassword,
        role: faker.helpers.arrayElement(['user', 'admin']),
        pets: [],
        __v: 0,
        last_connection: faker.date.recent(),
        documents: [],
      };
      generatedUsers.push(user);
    }

    const generatedPets = [];
    for (let i = 0; i < pets; i += 1) {
      const pet = PetDTO.getPetInputFrom({
        name: faker.animal.petName(),
        specie: faker.animal.type(),
        birthDate: faker.date.past(),
        adopted: false,
        image: faker.image.avatar(),
      });
      generatedPets.push(pet);
    }

    // Solo devolvemos los datos generados sin intentar guardarlos
    // Esto evita errores de conexión a MongoDB
    res.status(200).send({
      status: 'success',
      payload: {
        users: generatedUsers,
        pets: generatedPets,
      },
    });
  } catch (error: unknown) {
    handleMongooseError(res, error);
  }
};

export default {
  mockingPets,
  mockingUsers,
  generateData,
};
