import Realm from 'realm';
import { ProdutoModel } from '../models/ProdutoModel';
import { ProdutoRepository } from '../repositories/ProdutoRepository';
import type { CreateProdutoDTO, UpdateProdutoDTO } from '../types';

export class ProdutoService {
  private repository: ProdutoRepository;

  constructor(realm: Realm) {
    this.repository = new ProdutoRepository(realm);
  }

  criar(dto: CreateProdutoDTO): ProdutoModel {
    if (!dto.nome.trim()) {
      throw new Error('O nome do produto não pode ser vazio.');
    }
    if (dto.preco < 0) {
      throw new Error('O preço do produto deve ser maior ou igual a zero.');
    }
    return this.repository.create({
      nome: dto.nome.trim(),
      preco: dto.preco,
    });
  }

  atualizar(id: Realm.BSON.UUID, dto: UpdateProdutoDTO): ProdutoModel {
    const produto = this.repository.findById(id);
    if (!produto) {
      throw new Error(`Produto não encontrado: ${id.toHexString()}`);
    }
    const updates: Partial<ProdutoModel> = {};
    if (dto.nome !== undefined) updates.nome = dto.nome.trim();
    if (dto.preco !== undefined) {
      if (dto.preco < 0) throw new Error('O preço deve ser maior ou igual a zero.');
      updates.preco = dto.preco;
    }
    this.repository.update(produto, updates);
    return produto;
  }

  remover(id: Realm.BSON.UUID): void {
    const removed = this.repository.deleteById(id);
    if (!removed) {
      throw new Error(`Produto não encontrado: ${id.toHexString()}`);
    }
  }

  buscarTodos(): Realm.Results<ProdutoModel> {
    return this.repository.findAllOrderedByNome();
  }

  buscarPorId(id: Realm.BSON.UUID): ProdutoModel {
    const produto = this.repository.findById(id);
    if (!produto) {
      throw new Error(`Produto não encontrado: ${id.toHexString()}`);
    }
    return produto;
  }
}
