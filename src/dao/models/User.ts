import mongoose from 'mongoose';

// Definir la interfaz para el documento de usuario
export interface IUserDocument {
  name?: string;
  reference?: string;
}

export interface IUser {
  first_name: string;
  last_name: string;
  email: string;
  documents?: IUserDocument[];
  password: string;
  role?: string;
  pets?: { _id: string }[];
  last_connection?: Date;
  _id?: mongoose.Types.ObjectId | string;
}

// Definir el tipo para el modelo de usuario
export type UserModelType = mongoose.Model<IUser>;

const collection = 'Users';

const schema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  documents: [
    {
      name: { type: String, required: true },
      reference: { type: String, required: true },
    },
  ],
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  pets: {
    type: [
      {
        _id: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Pets',
        },
      },
    ],
    default: [],
  },
  last_connection: {
    type: Date,
    default: Date.now,
  },
});

const userModel = mongoose.model<IUser>(collection, schema);

export default userModel;
