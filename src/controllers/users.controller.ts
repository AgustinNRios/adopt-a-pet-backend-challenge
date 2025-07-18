import { Request, Response } from 'express';

import { usersService } from '../services/index';

const getAllUsers = async (req: Request, res: Response) => {
  const users = await usersService.getAll();
  res.send({ status: 'success', payload: users });
};

const getUser = async (req: Request, res: Response) => {
  const userId = req.params.uid;
  const user = await usersService.getUserById(userId);
  if (!user) res.status(404).send({ status: 'error', error: 'User not found' });
  res.send({ status: 'success', payload: user });
};

const updateUser = async (req: Request, res: Response) => {
  const updateBody = req.body;
  const userId = req.params.uid;
  const user = await usersService.getUserById(userId);
  if (!user) res.status(404).send({ status: 'error', error: 'User not found' });
  await usersService.update(userId, updateBody);
  res.send({ status: 'success', message: 'User updated' });
};

const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.uid;
  await usersService.getUserById(userId);
  res.send({ status: 'success', message: 'User deleted' });
};

const uploadDocuments = async (req: Request, res: Response) => {
  try {
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if (!user) res.status(404).send({ status: 'error', error: 'User not found' });

    // Si no hay archivos, retornar error
    if (!req.files || req.files.length === 0) {
      res.status(400).send({ status: 'error', error: 'No files were uploaded' });
    }

    // Crear array de documentos para agregar al usuario
    const files = req.files as Express.Multer.File[]; // task no usar as
    const documents = files.map(file => ({
      name: file.originalname,
      reference: `/documents/${file.filename}`,
    }));

    // Actualizar documentos del usuario usando el método específico
    await usersService.addDocuments(userId, documents);

    res.send({ status: 'success', message: 'Documents uploaded successfully' });
  } catch (error) {
    console.error('Error al subir documentos:', error);
    res.status(500).send({ status: 'error', error: 'Internal server error' });
  }
};

export default {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  uploadDocuments,
};
