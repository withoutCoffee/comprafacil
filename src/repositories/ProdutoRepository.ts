import Realm from 'realm';
import { ProdutoModel } from '../models/ProdutoModel';
import { BaseRepository } from './BaseRepository';

export class ProdutoRepository extends BaseRepository<ProdutoModel> {
  constructor(realm: Realm) {
    super(realm, 'Produto');
  }

  // ─── Queries específicas ──────────────────────────────────────────────────────

  findByNome(nome: string): Realm.Results<ProdutoModel> {
    return this.realm
      .objects<ProdutoModel>('Produto')
      .filtered('nome CONTAINS[c] $0', nome);
  }

  findAllOrderedByNome(): Realm.Results<ProdutoModel> {
    return this.realm
      .objects<ProdutoModel>('Produto')
      .sorted('nome');
  }

  findAllOrderedByPreco(asc = true): Realm.Results<ProdutoModel> {
    return this.realm
      .objects<ProdutoModel>('Produto')
      .sorted('preco', !asc);
  }
}
