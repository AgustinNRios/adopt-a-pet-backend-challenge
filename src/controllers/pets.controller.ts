import { Request, Response } from 'express';

import PetDTO from '../dto/Pet.dto';
import { petsService } from '../services/index';
import __dirname from '../utils/index';

const getAllPets = async (req: Request, res: Response) => {
  const pets = await petsService.getAll();
  res.send({ status: 'success', payload: pets });
};

const createPet = async (req: Request, res: Response) => {
  const { name, specie, birthDate } = req.body;
  if (!name || !specie || !birthDate) {
    res.status(400).send({ status: 'error', error: 'Incomplete values' });
    return;
  }
  const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
  const result = await petsService.create(pet);
  res.send({ status: 'success', payload: result });
};

const updatePet = async (req: Request, res: Response) => {
  const petUpdateBody = req.body;
  const petId = req.params.pid;
  await petsService.update(petId, petUpdateBody);
  res.send({ status: 'success', message: 'pet updated' });
};

const deletePet = async (req: Request, res: Response) => {
  const petId = req.params.pid;
  await petsService.delete(petId);
  res.send({ status: 'success', message: 'pet deleted' });
};

const createPetWithImage = async (req: Request, res: Response) => {
  const { file } = req;
  const { name, specie, birthDate } = req.body;
  if (!name || !specie || !birthDate) {
    res.status(400).send({ status: 'error', error: 'Incomplete values' });
    return;
  }
  if (!file) {
    res.status(400).send({ status: 'error', error: 'Image file is required' });
    return;
  }
  const pet = PetDTO.getPetInputFrom({
    name,
    specie,
    birthDate,
    image: `${__dirname}/../public/img/pets/${file.filename}`,
  });
  const result = await petsService.create(pet);
  res.send({ status: 'success', payload: result });
};

export default {
  getAllPets,
  createPet,
  updatePet,
  deletePet,
  createPetWithImage,
};
