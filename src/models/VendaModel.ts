import Realm, { BSON, ObjectSchema } from 'realm';
import type { VendaStatus } from '../types';

export class VendaModel extends Realm.Object<VendaModel> {
  _id!: BSON.UUID;
  produtoId!: BSON.UUID;
  clienteId!: BSON.UUID;
  valor!: number;
  dataVenda!: Date;
  descricao?: string;
  valorPago!: number;
  status!: VendaStatus;

  static schema: ObjectSchema = {
    name: 'Venda',
    primaryKey: '_id',
    properties: {
      _id: {
        type: 'uuid',
        default: () => new BSON.UUID(),
      },
      produtoId: 'uuid',
      clienteId: 'uuid',
      valor: 'double',
      dataVenda: 'date',
      descricao: 'string?',
      valorPago: {
        type: 'double',
        default: 0,
      },
      // status é armazenado como string no Realm
      status: {
        type: 'string',
        default: 'pendente',
      },
    },
  };
}
