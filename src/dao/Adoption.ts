import { IGenericDAO } from './IGenericDao';
import adoptionModel, { IAdoption, AdoptionModelType } from './models/Adoption';

export default class Adoption implements IGenericDAO<IAdoption> {
  private model: AdoptionModelType = adoptionModel as AdoptionModelType;

  async get(params: Partial<IAdoption>): Promise<IAdoption[]> {
    return this.model.find(params).lean().exec(); // ⇒ Promise<IAdoption[]>
  }

  async getBy(params: Partial<IAdoption>): Promise<IAdoption | null> {
    return this.model.findOne(params).lean().exec(); // ⇒ Promise<IAdoption | null>
  }

  async save(doc: IAdoption): Promise<IAdoption> {
    const created = await this.model.create(doc); // ⇒ IAdoption & Document
    return created.toObject(); // ⇒ IAdoption plano
  }

  async update(id: string, doc: Partial<IAdoption>): Promise<IAdoption | null> {
    return this.model.findByIdAndUpdate(id, { $set: doc }, { new: true }).lean().exec(); // ⇒ Promise<IAdoption | null>
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.model.findByIdAndDelete(id).exec();
    return res !== null; // ⇒ true si algo se borró
  }
}
