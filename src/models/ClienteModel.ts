import Realm, { BSON, ObjectSchema } from 'realm';

export class ClienteModel extends Realm.Object<ClienteModel> {
  _id!: BSON.UUID;
  nome!: string;
  telefone?: string;
  createdAt!: Date;

  static schema: ObjectSchema = {
    name: 'Cliente',
    primaryKey: '_id',
    properties: {
      _id: {
        type: 'uuid',
        default: () => new BSON.UUID(),
      },
      nome: 'string',
      telefone: 'string?',
      createdAt: {
        type: 'date',
        default: () => new Date(),
      },
    },
  };
}
