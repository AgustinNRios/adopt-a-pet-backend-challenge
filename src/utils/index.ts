import { dirname } from 'path';
import { fileURLToPath } from 'url';

import bcrypt from 'bcrypt';
import { Response } from 'express';
import mongoose from 'mongoose';

export const createHash = async (password: string) => {
  const salts = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salts);
};

export const passwordValidation = async (user: { password: string }, password: string) =>
  bcrypt.compare(password, user.password);

const filename = fileURLToPath(import.meta.url);
const dirName = dirname(filename);

export const handleMongooseError = (res: Response, err: unknown): Response => {
  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
    return res.status(400).send({ status: 'error', error: (err as Error).message });
  }
  return res.status(500).send({ status: 'error', error: 'Unexpected error' });
};

export default dirName;
