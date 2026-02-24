import Realm, { BSON, ObjectSchema } from 'realm';

export class ProdutoModel extends Realm.Object<ProdutoModel> {
  _id!: BSON.UUID;
  nome!: string;
  preco!: number;
  createdAt!: Date;

  static schema: ObjectSchema = {
    name: 'Produto',
    primaryKey: '_id',
    properties: {
      _id: {
        type: 'uuid',
        default: () => new BSON.UUID(),
      },
      nome: 'string',
      preco: 'double',
      createdAt: {
        type: 'date',
        default: () => new Date(),
      },
    },
  };
}
