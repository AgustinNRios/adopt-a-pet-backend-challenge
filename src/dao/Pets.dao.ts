import { IGenericDAO } from './IGenericDao';
import petModel, { IPet, PetModelType } from './models/Pet';

export default class Pet implements IGenericDAO<IPet> {
  private model: PetModelType = petModel as PetModelType;

  async get(params: Partial<IPet>): Promise<IPet[]> {
    return this.model.find(params).lean().exec();
  }

  async getBy(params: Partial<IPet>): Promise<IPet | null> {
    return this.model.findOne(params).lean().exec();
  }

  async save(doc: IPet): Promise<IPet> {
    const created = await this.model.create(doc);
    return created.toObject();
  }

  async update(id: string, doc: Partial<IPet>): Promise<IPet | null> {
    return this.model.findByIdAndUpdate(id, { $set: doc }, { new: true }).lean().exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.model.findByIdAndDelete(id).exec();
    return res !== null;
  }
}
