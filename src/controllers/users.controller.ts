import { Request, Response } from 'express';

import { usersService } from '../services/index';

const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validar datos requeridos
    if (!firstName || !lastName || !email) {
      res.status(400).send({ status: 'error', error: 'Datos incompletos' });
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = await usersService.getUserByEmail(email);
    if (existingUser) {
      res.status(400).send({ status: 'error', error: 'El usuario ya existe' });
      return;
    }

    // Crear el usuario
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    };

    const newUser = await usersService.create(userData);
    res.status(200).send({ status: 'success', payload: newUser });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
  }
};

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await usersService.getAll();
  res.send({ status: 'success', payload: users });
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.uid;
  const user = await usersService.getUserById(userId);
  if (!user) {
    res.status(404).send({ status: 'error', error: 'User not found' });
    return;
  }
  res.send({ status: 'success', payload: user });
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  const updateBody = req.body;
  const userId = req.params.uid;
  const user = await usersService.getUserById(userId);
  if (!user) {
    res.status(404).send({ status: 'error', error: 'User not found' });
    return;
  }
  await usersService.update(userId, updateBody);
  res.send({ status: 'success', message: 'User updated' });
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.uid;
  const user = await usersService.getUserById(userId);
  if (!user) {
    res.status(404).send({ status: 'error', error: 'User not found' });
    return;
  }
  await usersService.delete(userId);
  res.send({ status: 'success', message: 'User deleted' });
};

const uploadDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if (!user) {
      res.status(404).send({ status: 'error', error: 'User not found' });
      return;
    }

    // Si no hay archivos, retornar error
    if (!req.files || req.files.length === 0) {
      res.status(400).send({ status: 'error', error: 'No files were uploaded' });
      return;
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
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  uploadDocuments,
};
