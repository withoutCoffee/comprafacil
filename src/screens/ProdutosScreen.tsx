import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRealm, useQuery } from '@realm/react';
import { ProdutoModel } from '../models/ProdutoModel';
import { ProdutoService } from '../services/ProdutoService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Item ─────────────────────────────────────────────────────────────────────

interface ProdutoItemProps {
  produto: ProdutoModel;
  onDelete: (id: Realm.BSON.UUID) => void;
}

function ProdutoItem({ produto, onDelete }: ProdutoItemProps) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-800">{produto.nome}</Text>
          <Text className="text-sm text-primary-600 font-semibold mt-0.5">
            {formatCurrency(produto.preco)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Remover', `Remover ${produto.nome}?`, [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Remover', style: 'destructive', onPress: () => onDelete(produto._id) },
            ])
          }
          className="p-2"
        >
          <Text className="text-danger-500 text-lg">✕</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface NovoProdutoModalProps {
  visible: boolean;
  onClose: () => void;
  onSalvar: (nome: string, preco: string) => void;
}

function NovoProdutoModal({ visible, onClose, onSalvar }: NovoProdutoModalProps) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View className="flex-1 bg-gray-50 p-5">
        <Text className="text-xl font-bold text-gray-800 mb-5">Novo Produto</Text>

        <Text className="text-sm font-medium text-gray-600 mb-1">Nome *</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Uniforme escolar"
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800"
        />

        <Text className="text-sm font-medium text-gray-600 mb-1">Preço (R$) *</Text>
        <TextInput
          value={preco}
          onChangeText={setPreco}
          placeholder="0,00"
          keyboardType="decimal-pad"
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 text-gray-800"
        />

        <Button
          title="Salvar"
          onPress={() => {
            onSalvar(nome, preco);
            setNome('');
            setPreco('');
          }}
          className="mb-3"
        />
        <Button title="Cancelar" variant="outline" onPress={onClose} />
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ProdutosScreen() {
  const realm = useRealm();
  const produtos = useQuery(ProdutoModel);
  const service = new ProdutoService(realm);

  const [modalVisible, setModalVisible] = useState(false);

  const handleCriar = (nome: string, precoStr: string) => {
    try {
      const preco = parseFloat(precoStr.replace(',', '.'));
      service.criar({ nome, preco });
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  const handleDeletar = (id: Realm.BSON.UUID) => {
    try {
      service.remover(id);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  const produtosOrdenados = Array.from(produtos).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR'),
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-primary-600 px-5 pt-12 pb-5">
        <Text className="text-2xl font-bold text-white">Produtos</Text>
        <Text className="text-primary-200 text-sm mt-1">
          {produtos.length} produto{produtos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={produtosOrdenados}
        keyExtractor={(item) => item._id.toHexString()}
        contentContainerClassName="px-4 pt-4 pb-24"
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-4xl mb-3">📦</Text>
            <Text className="text-gray-400 text-base">Nenhum produto cadastrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProdutoItem produto={item} onDelete={handleDeletar} />
        )}
      />

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-6 bg-primary-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-primary-600/50"
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>

      <NovoProdutoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSalvar={handleCriar}
      />
    </View>
  );
}
