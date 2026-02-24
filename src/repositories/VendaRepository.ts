import Realm, { BSON } from 'realm';
import { VendaModel } from '../models/VendaModel';
import { BaseRepository } from './BaseRepository';
import type { VendaStatus } from '../types';

export class VendaRepository extends BaseRepository<VendaModel> {
  constructor(realm: Realm) {
    super(realm, 'Venda');
  }

  // ─── Queries específicas ──────────────────────────────────────────────────────

  findByCliente(clienteId: BSON.UUID): Realm.Results<VendaModel> {
    return this.realm
      .objects<VendaModel>('Venda')
      .filtered('clienteId == $0', clienteId);
  }

  findByStatus(status: VendaStatus): Realm.Results<VendaModel> {
    return this.realm
      .objects<VendaModel>('Venda')
      .filtered('status == $0', status);
  }

  findPendentes(): Realm.Results<VendaModel> {
    return this.realm
      .objects<VendaModel>('Venda')
      .filtered('status != "pago"')
      .sorted('dataVenda', true); // mais recentes primeiro
  }

  findByPeriodo(inicio: Date, fim: Date): Realm.Results<VendaModel> {
    return this.realm
      .objects<VendaModel>('Venda')
      .filtered('dataVenda >= $0 AND dataVenda <= $1', inicio, fim);
  }

  totalPendenteByCliente(clienteId: BSON.UUID): number {
    const vendas = this.findByCliente(clienteId).filtered('status != "pago"');
    return vendas.reduce((acc, v) => acc + (v.valor - v.valorPago), 0);
  }

  // ─── Atualização de pagamento (dentro de uma transação) ──────────────────────

  updatePagamento(
    venda: VendaModel,
    novoValorPago: number,
    novoStatus: VendaStatus,
  ): void {
    this.realm.write(() => {
      venda.valorPago = novoValorPago;
      venda.status = novoStatus;
    });
  }
}
