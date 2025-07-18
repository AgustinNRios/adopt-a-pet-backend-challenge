import mongoose from 'mongoose';

// Definir la interfaz para el documento de adopción
export interface IAdoption {
  owner: string;
  pet: string;
  _id?: string;
}

// Definir el tipo para el modelo de adopción
export type AdoptionModelType = mongoose.Model<IAdoption>;

const collection = 'Adoptions';

const schema = new mongoose.Schema({
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Users',
  },
  pet: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Pets',
  },
});

const adoptionModel = mongoose.model<IAdoption>(collection, schema);

export default adoptionModel;
