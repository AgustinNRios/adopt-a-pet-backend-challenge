import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import UserDTO from '../dto/User.dto';
import { usersService } from '../services/index';
import { createHash, passwordValidation } from '../utils/index';

const register = async (req: Request, res: Response) => {
  try {
    const { first_name: firstName, last_name: lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      res.status(400).send({ status: 'error', error: 'Incomplete values' });
    const exists = await usersService.getUserByEmail(email);
    if (exists) res.status(400).send({ status: 'error', error: 'User already exists' });
    const hashedPassword = await createHash(password);
    const user = {
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
    };
    const result = await usersService.create(user);
    res.send({ status: 'success', payload: result._id });
  } catch {
    res.status(500).send({ status: 'error', error: 'Error al registrar usuario' });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) res.status(400).send({ status: 'error', error: 'Incomplete values' });
    const user = await usersService.getUserByEmail(email);
    if (!user) res.status(404).send({ status: 'error', error: "User doesn't exist" });
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) res.status(400).send({ status: 'error', error: 'Incorrect password' });
    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, 'tokenSecretJWT', { expiresIn: '1h' });
    user.last_connection = Date.now();
    await usersService.update(user._id, { last_connection: user.last_connection });
    res
      .cookie('coderCookie', token, { maxAge: 3600000 })
      .send({ status: 'success', message: 'Logged in' });
  } catch {
    res.status(500).send({ status: 'error', error: 'Error al iniciar sesión' });
  }
};

const current = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies.coderCookie;
    if (!cookie) res.status(401).send({ status: 'error', error: 'No autenticado' });

    const user = jwt.verify(cookie, 'tokenSecretJWT');
    res.send({ status: 'success', payload: user });
  } catch {
    res.status(401).send({ status: 'error', error: 'Token inválido o expirado' });
  }
};

const unprotectedLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) res.status(400).send({ status: 'error', error: 'Incomplete values' });
    const user = await usersService.getUserByEmail(email);
    if (!user) res.status(404).send({ status: 'error', error: "User doesn't exist" });
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) res.status(400).send({ status: 'error', error: 'Incorrect password' });
    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, 'tokenSecretJWT', { expiresIn: '1h' });
    res
      .cookie('unprotectedCookie', token, { maxAge: 3600000 })
      .send({ status: 'success', message: 'Unprotected Logged in' });
  } catch {
    res.status(500).send({ status: 'error', error: 'Error al iniciar sesión' });
  }
};
const unprotectedCurrent = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies.unprotectedCookie;
    if (!cookie) res.status(401).send({ status: 'error', error: 'No autenticado' });

    const user = jwt.verify(cookie, 'tokenSecretJWT');
    if (user) {
      res.send({ status: 'success', payload: user });
    }
    res.status(401).send({ status: 'error', error: 'Token inválido o expirado' });
  } catch {
    res.status(401).send({ status: 'error', error: 'Token inválido/expirado o no autenticado' });
  }
};

// Logout: borra la cookie y actualiza last_connection
const logout = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies.coderCookie;
    if (!cookie) res.status(400).send({ status: 'error', error: 'No session' });
    const userData = jwt.verify(cookie, 'tokenSecretJWT') as { _id: string }; // fix
    // Actualiza last_connection
    await usersService.update(userData._id, { last_connection: new Date() });
    res.clearCookie('coderCookie').send({ status: 'success', message: 'Logged out' });
  } catch {
    res.status(500).send({ status: 'error', error: 'Error al cerrar sesión' });
  }
};

export default {
  current,
  login,
  register,
  logout,
  unprotectedLogin,
  unprotectedCurrent,
};
