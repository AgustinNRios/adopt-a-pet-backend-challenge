import { IGenericDAO } from './IGenericDao';
import userModel, { IUser, UserModelType } from './models/User';

export default class Users implements IGenericDAO<IUser> {
  private model: UserModelType = userModel as UserModelType;

  async get(params: Partial<IUser>): Promise<IUser[]> {
    return this.model.find(params).lean().exec();
  }

  async getBy(params: Partial<IUser>): Promise<IUser | null> {
    return this.model.findOne(params).lean().exec();
  }

  async save(doc: IUser): Promise<IUser> {
    const created = await this.model.create(doc);
    return created.toObject();
  }

  async update(id: string, doc: Partial<IUser>): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(id, { $set: doc }, { new: true }).lean().exec();
  }

  /**
   * Añade documentos al usuario y devuelve el usuario actualizado.
   */
  async addDocuments(
    userId: string,
    documents: Array<{ name: string; reference: string }>,
  ): Promise<IUser> {
    const updated = await this.model
      .findByIdAndUpdate(userId, { $push: { documents: { $each: documents } } }, { new: true })
      .lean()
      .exec();
    return updated as IUser; // asumimos que el usuario existe
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.model.findByIdAndDelete(id).exec();
    return res !== null;
  }
}
