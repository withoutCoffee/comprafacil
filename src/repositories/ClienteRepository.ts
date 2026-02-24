import Realm from 'realm';
import { ClienteModel } from '../models/ClienteModel';
import { BaseRepository } from './BaseRepository';

export class ClienteRepository extends BaseRepository<ClienteModel> {
  constructor(realm: Realm) {
    super(realm, 'Cliente');
  }

  // ─── Queries específicas ──────────────────────────────────────────────────────

  findByNome(nome: string): Realm.Results<ClienteModel> {
    return this.realm
      .objects<ClienteModel>('Cliente')
      .filtered('nome CONTAINS[c] $0', nome);
  }

  findByTelefone(telefone: string): ClienteModel | null {
    const results = this.realm
      .objects<ClienteModel>('Cliente')
      .filtered('telefone == $0', telefone);
    return results.length > 0 ? results[0] : null;
  }

  findAllOrderedByNome(): Realm.Results<ClienteModel> {
    return this.realm
      .objects<ClienteModel>('Cliente')
      .sorted('nome');
  }
}
