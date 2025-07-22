import { Request, Response } from 'express';

import { adoptionsService, petsService, usersService } from '../services/index';

const getAllAdoptions = async (req: Request, res: Response): Promise<void> => {
  const result = await adoptionsService.getAll();
  res.send({ status: 'success', payload: result });
};

const getAdoption = async (req: Request, res: Response): Promise<void> => {
  const adoptionId = req.params.aid;
  const adoption = await adoptionsService.getBy({ _id: adoptionId });
  if (!adoption) {
    res.status(404).send({ status: 'error', error: 'Adoption not found' });
    return;
  }
  res.send({ status: 'success', payload: adoption });
};

const createAdoption = async (req: Request, res: Response): Promise<void> => {
  const { uid, pid } = req.params;
  const user = await usersService.getUserById(uid);
  if (!user || !user._id) {
    res.status(404).send({ status: 'error', error: 'User not found or invalid' });
    return;
  }
  const pet = await petsService.getBy({ _id: pid });
  if (!pet || !pet._id) {
    res.status(404).send({ status: 'error', error: 'Pet not found or invalid' });
    return;
  }
  if (pet.adopted) {
    res.status(400).send({ status: 'error', error: 'Pet is already adopted' });
    return;
  }

  // Asegurar que pets sea un array de objetos con propiedad _id
  const userPets = user.pets || [];
  userPets.push({ _id: pet._id });

  // Convertir IDs a string para asegurar compatibilidad con la interfaz
  const userId = String(user._id);
  const petId = String(pet._id);

  await usersService.update(userId, { pets: userPets });
  await petsService.update(petId, { adopted: true, owner: userId });
  await adoptionsService.create({ owner: userId, pet: petId });
  res.send({ status: 'success', message: 'Pet adopted' });
};

export default {
  createAdoption,
  getAllAdoptions,
  getAdoption,
};
