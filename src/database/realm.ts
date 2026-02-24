import Realm from 'realm';
import { ClienteModel } from '../models/ClienteModel';
import { ProdutoModel } from '../models/ProdutoModel';
import { VendaModel } from '../models/VendaModel';
import { ReceitaModel } from '../models/ReceitaModel';

// ─── Configuração do Realm ────────────────────────────────────────────────────
//
// Para uso com @realm/react, utilize <RealmProvider> no App.tsx passando
// o array de schemas abaixo. O realmConfig é exportado para uso avançado
// (ex: operações fora do contexto React ou em testes).

export const realmSchema = [
  ClienteModel,
  ProdutoModel,
  VendaModel,
  ReceitaModel,
];

export const realmConfig: Realm.Configuration = {
  schema: realmSchema,
  schemaVersion: 1,
  // migration pode ser adicionada aqui quando a versão aumentar
};

// ─── Singleton manual (opcional, fora do contexto do @realm/react) ────────────
let realmInstance: Realm | null = null;

export async function getRealmInstance(): Promise<Realm> {
  if (realmInstance && !realmInstance.isClosed) {
    return realmInstance;
  }
  realmInstance = await Realm.open(realmConfig);
  return realmInstance;
}

export function closeRealm(): void {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
}
