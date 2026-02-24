import Realm, { BSON, ObjectSchema } from 'realm';

export class ReceitaModel extends Realm.Object<ReceitaModel> {
  _id!: BSON.UUID;
  vendaId!: BSON.UUID;
  clienteId!: BSON.UUID;
  valor!: number;
  dataPagamento!: Date;

  static schema: ObjectSchema = {
    name: 'Receita',
    primaryKey: '_id',
    properties: {
      _id: {
        type: 'uuid',
        default: () => new BSON.UUID(),
      },
      vendaId: 'uuid',
      clienteId: 'uuid',
      valor: 'double',
      dataPagamento: 'date',
    },
  };
}
