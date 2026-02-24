import Realm from 'realm';
import { ReceitaModel } from '../models/ReceitaModel';
import { ReceitaRepository } from '../repositories/ReceitaRepository';
import { VendaRepository } from '../repositories/VendaRepository';
import { ClienteRepository } from '../repositories/ClienteRepository';
import type { CreateReceitaDTO, VendaStatus } from '../types';

export class ReceitaService {
  private receitaRepository: ReceitaRepository;
  private vendaRepository: VendaRepository;
  private clienteRepository: ClienteRepository;

  constructor(realm: Realm) {
    this.receitaRepository = new ReceitaRepository(realm);
    this.vendaRepository = new VendaRepository(realm);
    this.clienteRepository = new ClienteRepository(realm);
  }

  // ─── Criação com atualização automática da Venda ─────────────────────────────

  registrar(dto: CreateReceitaDTO): ReceitaModel {
    // 1. Validar existência da venda
    const venda = this.vendaRepository.findById(dto.vendaId);
    if (!venda) {
      throw new Error(`Venda não encontrada: ${dto.vendaId.toHexString()}`);
    }

    // 2. Validar existência do cliente
    const cliente = this.clienteRepository.findById(dto.clienteId);
    if (!cliente) {
      throw new Error(`Cliente não encontrado: ${dto.clienteId.toHexString()}`);
    }

    // 3. Validar valor do pagamento
    if (dto.valor <= 0) {
      throw new Error('O valor do pagamento deve ser maior que zero.');
    }

    const valorRestante = venda.valor - venda.valorPago;

    if (dto.valor > valorRestante) {
      throw new Error(
        `Pagamento de R$ ${dto.valor.toFixed(2)} excede o saldo devedor de R$ ${valorRestante.toFixed(2)}.`,
      );
    }

    // 4. Calcular novo valorPago e status
    const novoValorPago = venda.valorPago + dto.valor;
    const novoStatus = ReceitaService.calcularStatus(novoValorPago, venda.valor);

    // 5. Persistir receita e atualizar venda em uma única transação
    let receita!: ReceitaModel;

    // Usamos uma única transação para garantir atomicidade
    // (getRealmInstance da venda já é o mesmo realm passado no construtor)
    (this.receitaRepository as any).realm.write(() => {
      // 5a. Criar a receita
      receita = (this.receitaRepository as any).realm.create<ReceitaModel>(
        'Receita',
        {
          vendaId: dto.vendaId,
          clienteId: dto.clienteId,
          valor: dto.valor,
          dataPagamento: dto.dataPagamento,
        },
      );

      // 5b. Atualizar a venda
      venda.valorPago = novoValorPago;
      venda.status = novoStatus;
    });

    return receita;
  }

  // ─── Remoção (estorno) ───────────────────────────────────────────────────────

  /**
   * Estorna uma receita: remove o registro e reverte o valorPago da venda.
   */
  estornar(id: Realm.BSON.UUID): void {
    const receita = this.receitaRepository.findById(id);
    if (!receita) {
      throw new Error(`Receita não encontrada: ${id.toHexString()}`);
    }

    const venda = this.vendaRepository.findById(receita.vendaId);
    if (!venda) {
      throw new Error('Venda vinculada não encontrada.');
    }

    const novoValorPago = Math.max(0, venda.valorPago - receita.valor);
    const novoStatus = ReceitaService.calcularStatus(novoValorPago, venda.valor);

    (this.receitaRepository as any).realm.write(() => {
      venda.valorPago = novoValorPago;
      venda.status = novoStatus;
      (this.receitaRepository as any).realm.delete(receita);
    });
  }

  // ─── Consultas ───────────────────────────────────────────────────────────────

  buscarPorVenda(vendaId: Realm.BSON.UUID): Realm.Results<ReceitaModel> {
    return this.receitaRepository.findByVenda(vendaId);
  }

  buscarPorCliente(clienteId: Realm.BSON.UUID): Realm.Results<ReceitaModel> {
    return this.receitaRepository.findByCliente(clienteId);
  }

  totalRecebidoVenda(vendaId: Realm.BSON.UUID): number {
    return this.receitaRepository.totalRecebidoByVenda(vendaId);
  }

  // ─── Regra de negócio: cálculo de status ────────────────────────────────────

  static calcularStatus(valorPago: number, valorTotal: number): VendaStatus {
    if (valorPago <= 0) return 'pendente';
    if (valorPago >= valorTotal) return 'pago';
    return 'parcial';
  }
}
