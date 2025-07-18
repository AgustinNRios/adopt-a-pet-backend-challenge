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
  if (!user) {
    res.status(404).send({ status: 'error', error: 'user Not found' });
    return;
  }
  const pet = await petsService.getBy({ _id: pid });
  if (!pet) {
    res.status(404).send({ status: 'error', error: 'Pet not found' });
    return;
  }
  if (pet.adopted) {
    res.status(400).send({ status: 'error', error: 'Pet is already adopted' });
    return;
  }
  user.pets.push(pet._id);
  await usersService.update(user._id, { pets: user.pets });
  await petsService.update(pet._id, { adopted: true, owner: user._id });
  await adoptionsService.create({ owner: user._id, pet: pet._id });
  res.send({ status: 'success', message: 'Pet adopted' });
};

export default {
  createAdoption,
  getAllAdoptions,
  getAdoption,
};
