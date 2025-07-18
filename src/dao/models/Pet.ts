import mongoose from 'mongoose';

// Definir la interfaz para el documento de mascota
export interface IPet {
  name: string;
  specie: string;
  birthDate?: Date;
  adopted: boolean;
  owner?: string;
  image?: string;
  _id?: string;
}

// Definir el tipo para el modelo de mascota
export type PetModelType = mongoose.Model<IPet>;

const collection = 'Pets';

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specie: {
    type: String,
    required: true,
  },
  birthDate: Date,
  adopted: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Users',
  },
  image: String,
});

const petModel = mongoose.model<IPet>(collection, schema);

export default petModel;
