import Realm, { BSON } from 'realm';

/**
 * BaseRepository fornece operações genéricas de CRUD para qualquer
 * modelo do Realm. Os repositórios concretos herdam esta classe.
 */
export abstract class BaseRepository<T extends Realm.Object<T>> {
  protected realm: Realm;
  protected schemaName: string;

  constructor(realm: Realm, schemaName: string) {
    this.realm = realm;
    this.schemaName = schemaName;
  }

  // ─── Busca ──────────────────────────────────────────────────────────────────

  findAll(): Realm.Results<T> {
    return this.realm.objects<T>(this.schemaName);
  }

  findById(id: BSON.UUID): T | null {
    return this.realm.objectForPrimaryKey<T>(this.schemaName, id) ?? null;
  }

  // ─── Criação ─────────────────────────────────────────────────────────────────

  create(data: Partial<T>): T {
    let created!: T;
    this.realm.write(() => {
      created = this.realm.create<T>(this.schemaName, data as T);
    });
    return created;
  }

  // ─── Atualização ─────────────────────────────────────────────────────────────

  /**
   * Atualiza campos de um objeto existente dentro de uma transação.
   * @param object  instância do Realm a atualizar
   * @param updates campos a alterar
   */
  update(object: T, updates: Partial<T>): void {
    this.realm.write(() => {
      Object.assign(object, updates);
    });
  }

  // ─── Remoção ─────────────────────────────────────────────────────────────────

  delete(object: T): void {
    this.realm.write(() => {
      this.realm.delete(object);
    });
  }

  deleteById(id: BSON.UUID): boolean {
    const object = this.findById(id);
    if (!object) return false;
    this.delete(object);
    return true;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  count(): number {
    return this.realm.objects<T>(this.schemaName).length;
  }
}
