import Realm, { BSON } from 'realm';
import { ReceitaModel } from '../models/ReceitaModel';
import { BaseRepository } from './BaseRepository';

export class ReceitaRepository extends BaseRepository<ReceitaModel> {
  constructor(realm: Realm) {
    super(realm, 'Receita');
  }

  // ─── Queries específicas ──────────────────────────────────────────────────────

  findByVenda(vendaId: BSON.UUID): Realm.Results<ReceitaModel> {
    return this.realm
      .objects<ReceitaModel>('Receita')
      .filtered('vendaId == $0', vendaId)
      .sorted('dataPagamento', true);
  }

  findByCliente(clienteId: BSON.UUID): Realm.Results<ReceitaModel> {
    return this.realm
      .objects<ReceitaModel>('Receita')
      .filtered('clienteId == $0', clienteId)
      .sorted('dataPagamento', true);
  }

  findByPeriodo(inicio: Date, fim: Date): Realm.Results<ReceitaModel> {
    return this.realm
      .objects<ReceitaModel>('Receita')
      .filtered('dataPagamento >= $0 AND dataPagamento <= $1', inicio, fim);
  }

  totalRecebidoByVenda(vendaId: BSON.UUID): number {
    const receitas = this.findByVenda(vendaId);
    return receitas.reduce((acc, r) => acc + r.valor, 0);
  }

  totalRecebidoByCliente(clienteId: BSON.UUID): number {
    const receitas = this.findByCliente(clienteId);
    return receitas.reduce((acc, r) => acc + r.valor, 0);
  }
}
