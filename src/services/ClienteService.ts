import Realm from 'realm';
import { ClienteModel } from '../models/ClienteModel';
import { ClienteRepository } from '../repositories/ClienteRepository';
import type { CreateClienteDTO, UpdateClienteDTO } from '../types';

export class ClienteService {
  private repository: ClienteRepository;

  constructor(realm: Realm) {
    this.repository = new ClienteRepository(realm);
  }

  criar(dto: CreateClienteDTO): ClienteModel {
    if (!dto.nome.trim()) {
      throw new Error('O nome do cliente não pode ser vazio.');
    }
    return this.repository.create({
      nome: dto.nome.trim(),
      telefone: dto.telefone?.trim() ?? undefined,
    });
  }

  atualizar(id: Realm.BSON.UUID, dto: UpdateClienteDTO): ClienteModel {
    const cliente = this.repository.findById(id);
    if (!cliente) {
      throw new Error(`Cliente não encontrado: ${id.toHexString()}`);
    }
    const updates: Partial<ClienteModel> = {};
    if (dto.nome !== undefined) updates.nome = dto.nome.trim();
    if (dto.telefone !== undefined) updates.telefone = dto.telefone.trim();

    this.repository.update(cliente, updates);
    return cliente;
  }

  remover(id: Realm.BSON.UUID): void {
    const removed = this.repository.deleteById(id);
    if (!removed) {
      throw new Error(`Cliente não encontrado: ${id.toHexString()}`);
    }
  }

  buscarTodos(): Realm.Results<ClienteModel> {
    return this.repository.findAllOrderedByNome();
  }

  buscarPorId(id: Realm.BSON.UUID): ClienteModel {
    const cliente = this.repository.findById(id);
    if (!cliente) {
      throw new Error(`Cliente não encontrado: ${id.toHexString()}`);
    }
    return cliente;
  }

  buscarPorNome(nome: string): Realm.Results<ClienteModel> {
    return this.repository.findByNome(nome);
  }
}
