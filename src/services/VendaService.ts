import Realm from 'realm';
import { VendaModel } from '../models/VendaModel';
import { VendaRepository } from '../repositories/VendaRepository';
import { ClienteRepository } from '../repositories/ClienteRepository';
import { ProdutoRepository } from '../repositories/ProdutoRepository';
import type { CreateVendaDTO, UpdateVendaDTO, VendaStatus } from '../types';

export class VendaService {
  private vendaRepository: VendaRepository;
  private clienteRepository: ClienteRepository;
  private produtoRepository: ProdutoRepository;

  constructor(realm: Realm) {
    this.vendaRepository = new VendaRepository(realm);
    this.clienteRepository = new ClienteRepository(realm);
    this.produtoRepository = new ProdutoRepository(realm);
  }

  // ─── Criação ─────────────────────────────────────────────────────────────────

  criar(dto: CreateVendaDTO): VendaModel {
    // Validações de integridade referencial
    const cliente = this.clienteRepository.findById(dto.clienteId);
    if (!cliente) {
      throw new Error(`Cliente não encontrado: ${dto.clienteId.toHexString()}`);
    }

    const produto = this.produtoRepository.findById(dto.produtoId);
    if (!produto) {
      throw new Error(`Produto não encontrado: ${dto.produtoId.toHexString()}`);
    }

    if (dto.valor <= 0) {
      throw new Error('O valor da venda deve ser maior que zero.');
    }

    return this.vendaRepository.create({
      produtoId: dto.produtoId,
      clienteId: dto.clienteId,
      valor: dto.valor,
      dataVenda: dto.dataVenda,
      descricao: dto.descricao?.trim(),
      valorPago: 0,
      status: 'pendente' as VendaStatus,
    });
  }

  // ─── Atualização ─────────────────────────────────────────────────────────────

  atualizar(id: Realm.BSON.UUID, dto: UpdateVendaDTO): VendaModel {
    const venda = this.vendaRepository.findById(id);
    if (!venda) {
      throw new Error(`Venda não encontrada: ${id.toHexString()}`);
    }
    this.vendaRepository.update(venda, dto as Partial<VendaModel>);
    return venda;
  }

  // ─── Remoção ─────────────────────────────────────────────────────────────────

  remover(id: Realm.BSON.UUID): void {
    const removed = this.vendaRepository.deleteById(id);
    if (!removed) {
      throw new Error(`Venda não encontrada: ${id.toHexString()}`);
    }
  }

  // ─── Consultas ───────────────────────────────────────────────────────────────

  buscarTodas(): Realm.Results<VendaModel> {
    return this.vendaRepository.findAll();
  }

  buscarPorId(id: Realm.BSON.UUID): VendaModel {
    const venda = this.vendaRepository.findById(id);
    if (!venda) {
      throw new Error(`Venda não encontrada: ${id.toHexString()}`);
    }
    return venda;
  }

  buscarPendentes(): Realm.Results<VendaModel> {
    return this.vendaRepository.findPendentes();
  }

  buscarPorCliente(clienteId: Realm.BSON.UUID): Realm.Results<VendaModel> {
    return this.vendaRepository.findByCliente(clienteId);
  }

  totalPendenteCliente(clienteId: Realm.BSON.UUID): number {
    return this.vendaRepository.totalPendenteByCliente(clienteId);
  }
}
