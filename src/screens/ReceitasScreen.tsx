import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@realm/react';
import { ReceitaModel } from '../models/ReceitaModel';
import { ClienteModel } from '../models/ClienteModel';
import { VendaModel } from '../models/VendaModel';
import { Card } from '../components/Card';
import { BSON } from 'realm';

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (d: Date) => new Date(d).toLocaleDateString('pt-BR');

// ─── Item de Receita ──────────────────────────────────────────────────────────

interface ReceitaItemProps {
  receita: ReceitaModel;
  clienteNome: string;
  vendaValor: number;
}

function ReceitaItem({ receita, clienteNome, vendaValor }: ReceitaItemProps) {
  return (
    <Card>
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-800">{clienteNome}</Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            Venda total: {formatCurrency(vendaValor)}
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            {formatDate(receita.dataPagamento)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-base font-bold text-success-700">
            + {formatCurrency(receita.valor)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ReceitasScreen() {
  const receitas = useQuery(ReceitaModel);
  const clientes = useQuery(ClienteModel);
  const vendas = useQuery(VendaModel);

  const getClienteNome = (id: BSON.UUID) =>
    clientes.find((c) => c._id.equals(id))?.nome ?? 'Desconhecido';

  const getVendaValor = (id: BSON.UUID) =>
    vendas.find((v) => v._id.equals(id))?.valor ?? 0;

  const totalRecebido = Array.from(receitas).reduce((acc, r) => acc + r.valor, 0);

  const receitasOrdenadas = Array.from(receitas).sort(
    (a, b) => b.dataPagamento.getTime() - a.dataPagamento.getTime(),
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header com total */}
      <View className="bg-success-500 px-5 pt-12 pb-5">
        <Text className="text-2xl font-bold text-white">Receitas</Text>
        <Text className="text-white/80 text-sm mt-1">
          Total recebido: {formatCurrency(totalRecebido)}
        </Text>
      </View>

      <FlatList
        data={receitasOrdenadas}
        keyExtractor={(item) => item._id.toHexString()}
        contentContainerClassName="px-4 pt-4 pb-10"
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-4xl mb-3">💰</Text>
            <Text className="text-gray-400 text-base">Nenhum pagamento registrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ReceitaItem
            receita={item}
            clienteNome={getClienteNome(item.clienteId)}
            vendaValor={getVendaValor(item.vendaId)}
          />
        )}
      />
    </View>
  );
}
