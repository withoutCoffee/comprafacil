import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useRealm, useQuery } from '@realm/react';
import { VendaModel } from '../models/VendaModel';
import { ClienteModel } from '../models/ClienteModel';
import { ProdutoModel } from '../models/ProdutoModel';
import { VendaService } from '../services/VendaService';
import { ReceitaService } from '../services/ReceitaService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { BSON } from 'realm';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('pt-BR');

// ─── Componente: Item de Venda ────────────────────────────────────────────────

interface VendaItemProps {
  venda: VendaModel;
  clienteNome: string;
  produtoNome: string;
  onRegistrarPagamento: (venda: VendaModel) => void;
}

function VendaItem({ venda, clienteNome, produtoNome, onRegistrarPagamento }: VendaItemProps) {
  const valorRestante = venda.valor - venda.valorPago;

  return (
    <Card>
      {/* Cabeçalho */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-bold text-gray-800">{clienteNome}</Text>
          <Text className="text-sm text-gray-500">{produtoNome}</Text>
        </View>
        <StatusBadge status={venda.status} />
      </View>

      {/* Valores */}
      <View className="flex-row justify-between mt-2">
        <View>
          <Text className="text-xs text-gray-400">Total</Text>
          <Text className="text-sm font-semibold text-gray-700">
            {formatCurrency(venda.valor)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-gray-400">Pago</Text>
          <Text className="text-sm font-semibold text-success-700">
            {formatCurrency(venda.valorPago)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-gray-400">Restante</Text>
          <Text className="text-sm font-semibold text-danger-700">
            {formatCurrency(valorRestante)}
          </Text>
        </View>
      </View>

      {/* Descrição */}
      {venda.descricao ? (
        <Text className="text-xs text-gray-400 mt-2 italic">{venda.descricao}</Text>
      ) : null}

      {/* Data */}
      <Text className="text-xs text-gray-400 mt-1">{formatDate(venda.dataVenda)}</Text>

      {/* Ação */}
      {venda.status !== 'pago' && (
        <Button
          title="Registrar Pagamento"
          variant="primary"
          className="mt-3"
          onPress={() => onRegistrarPagamento(venda)}
        />
      )}
    </Card>
  );
}

// ─── Modal: Nova Venda ────────────────────────────────────────────────────────

interface NovaVendaModalProps {
  visible: boolean;
  onClose: () => void;
  clientes: Realm.Results<ClienteModel>;
  produtos: Realm.Results<ProdutoModel>;
  onSalvar: (clienteId: string, produtoId: string, valor: string, descricao: string) => void;
}

function NovaVendaModal({ visible, onClose, clientes, produtos, onSalvar }: NovaVendaModalProps) {
  const [clienteId, setClienteId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSalvar = () => {
    if (!clienteId || !produtoId || !valor) {
      Alert.alert('Erro', 'Preencha cliente, produto e valor.');
      return;
    }
    onSalvar(clienteId, produtoId, valor, descricao);
    setClienteId('');
    setProdutoId('');
    setValor('');
    setDescricao('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScrollView className="flex-1 bg-gray-50 p-5">
        <Text className="text-xl font-bold text-gray-800 mb-5">Nova Venda</Text>

        {/* Seleção de Cliente */}
        <Text className="text-sm font-medium text-gray-600 mb-1">Cliente</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {Array.from(clientes).map((c) => (
            <TouchableOpacity
              key={c._id.toHexString()}
              onPress={() => setClienteId(c._id.toHexString())}
              className={`mr-2 px-4 py-2 rounded-full border ${
                clienteId === c._id.toHexString()
                  ? 'bg-primary-600 border-primary-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  clienteId === c._id.toHexString() ? 'text-white' : 'text-gray-700'
                }`}
              >
                {c.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Seleção de Produto */}
        <Text className="text-sm font-medium text-gray-600 mb-1">Produto</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {Array.from(produtos).map((p) => (
            <TouchableOpacity
              key={p._id.toHexString()}
              onPress={() => setProdutoId(p._id.toHexString())}
              className={`mr-2 px-4 py-2 rounded-full border ${
                produtoId === p._id.toHexString()
                  ? 'bg-primary-600 border-primary-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  produtoId === p._id.toHexString() ? 'text-white' : 'text-gray-700'
                }`}
              >
                {p.nome} • {formatCurrency(p.preco)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Valor */}
        <Text className="text-sm font-medium text-gray-600 mb-1">Valor (R$)</Text>
        <TextInput
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
          placeholder="0,00"
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800"
        />

        {/* Descrição */}
        <Text className="text-sm font-medium text-gray-600 mb-1">Descrição (opcional)</Text>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex: Compra de uniforme"
          multiline
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 text-gray-800"
        />

        <Button title="Salvar Venda" onPress={handleSalvar} className="mb-3" />
        <Button title="Cancelar" variant="outline" onPress={onClose} />
      </ScrollView>
    </Modal>
  );
}

// ─── Modal: Registrar Pagamento ───────────────────────────────────────────────

interface PagamentoModalProps {
  visible: boolean;
  venda: VendaModel | null;
  onClose: () => void;
  onConfirmar: (vendaId: string, valor: string) => void;
}

function PagamentoModal({ visible, venda, onClose, onConfirmar }: PagamentoModalProps) {
  const [valor, setValor] = useState('');

  if (!venda) return null;

  const restante = venda.valor - venda.valorPago;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View className="flex-1 bg-gray-50 p-5">
        <Text className="text-xl font-bold text-gray-800 mb-2">Registrar Pagamento</Text>
        <Text className="text-sm text-gray-500 mb-5">
          Valor restante: {formatCurrency(restante)}
        </Text>

        <Text className="text-sm font-medium text-gray-600 mb-1">Valor recebido (R$)</Text>
        <TextInput
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
          placeholder={restante.toFixed(2)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 text-gray-800"
        />

        <Button
          title="Confirmar"
          variant="success"
          onPress={() => {
            onConfirmar(venda._id.toHexString(), valor);
            setValor('');
          }}
          className="mb-3"
        />
        <Button title="Cancelar" variant="outline" onPress={onClose} />
      </View>
    </Modal>
  );
}

// ─── Screen Principal ─────────────────────────────────────────────────────────

export function VendasScreen() {
  const realm = useRealm();
  const vendas = useQuery(VendaModel);
  const clientes = useQuery(ClienteModel);
  const produtos = useQuery(ProdutoModel);

  const vendaService = new VendaService(realm);
  const receitaService = new ReceitaService(realm);

  const [modalNovaVenda, setModalNovaVenda] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<VendaModel | null>(null);

  // ─── Helpers de nome ─────────────────────────────────────────────────────────

  const getClienteNome = useCallback(
    (clienteId: BSON.UUID) =>
      clientes.find((c) => c._id.equals(clienteId))?.nome ?? 'Cliente desconhecido',
    [clientes],
  );

  const getProdutoNome = useCallback(
    (produtoId: BSON.UUID) =>
      produtos.find((p) => p._id.equals(produtoId))?.nome ?? 'Produto desconhecido',
    [produtos],
  );

  // ─── Criar venda ─────────────────────────────────────────────────────────────

  const handleCriarVenda = (
    clienteIdStr: string,
    produtoIdStr: string,
    valorStr: string,
    descricao: string,
  ) => {
    try {
      const valor = parseFloat(valorStr.replace(',', '.'));
      vendaService.criar({
        clienteId: new BSON.UUID(clienteIdStr),
        produtoId: new BSON.UUID(produtoIdStr),
        valor,
        dataVenda: new Date(),
        descricao: descricao || undefined,
      });
      setModalNovaVenda(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  // ─── Registrar pagamento ──────────────────────────────────────────────────────

  const handlePagamento = (vendaIdStr: string, valorStr: string) => {
    try {
      const valor = parseFloat(valorStr.replace(',', '.'));
      receitaService.registrar({
        vendaId: new BSON.UUID(vendaIdStr),
        clienteId: vendaSelecionada!.clienteId,
        valor,
        dataPagamento: new Date(),
      });
      setModalPagamento(false);
      setVendaSelecionada(null);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  const vendasOrdenadas = Array.from(vendas).sort(
    (a, b) => b.dataVenda.getTime() - a.dataVenda.getTime(),
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-primary-600 px-5 pt-12 pb-5">
        <Text className="text-2xl font-bold text-white">Vendas</Text>
        <Text className="text-primary-200 text-sm mt-1">
          {vendas.length} venda{vendas.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={vendasOrdenadas}
        keyExtractor={(item) => item._id.toHexString()}
        contentContainerClassName="px-4 pt-4 pb-24"
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-4xl mb-3">🛒</Text>
            <Text className="text-gray-400 text-base">Nenhuma venda registrada ainda.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <VendaItem
            venda={item}
            clienteNome={getClienteNome(item.clienteId)}
            produtoNome={getProdutoNome(item.produtoId)}
            onRegistrarPagamento={(v) => {
              setVendaSelecionada(v);
              setModalPagamento(true);
            }}
          />
        )}
      />

      {/* FAB - Nova Venda */}
      <TouchableOpacity
        onPress={() => setModalNovaVenda(true)}
        className="absolute bottom-8 right-6 bg-primary-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-primary-600/50"
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>

      {/* Modais */}
      <NovaVendaModal
        visible={modalNovaVenda}
        onClose={() => setModalNovaVenda(false)}
        clientes={clientes}
        produtos={produtos}
        onSalvar={handleCriarVenda}
      />

      <PagamentoModal
        visible={modalPagamento}
        venda={vendaSelecionada}
        onClose={() => {
          setModalPagamento(false);
          setVendaSelecionada(null);
        }}
        onConfirmar={handlePagamento}
      />
    </View>
  );
}
