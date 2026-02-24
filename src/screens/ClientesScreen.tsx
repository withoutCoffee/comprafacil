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
import { ClienteModel } from '../models/ClienteModel';
import { ClienteService } from '../services/ClienteService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

// ─── Item de Cliente ──────────────────────────────────────────────────────────

interface ClienteItemProps {
  cliente: ClienteModel;
  onDelete: (id: Realm.BSON.UUID) => void;
}

function ClienteItem({ cliente, onDelete }: ClienteItemProps) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-800">{cliente.nome}</Text>
          {cliente.telefone ? (
            <Text className="text-sm text-gray-500 mt-0.5">{cliente.telefone}</Text>
          ) : (
            <Text className="text-sm text-gray-300 mt-0.5 italic">Sem telefone</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Remover', `Remover ${cliente.nome}?`, [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Remover', style: 'destructive', onPress: () => onDelete(cliente._id) },
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

// ─── Modal: Novo Cliente ──────────────────────────────────────────────────────

interface NovoClienteModalProps {
  visible: boolean;
  onClose: () => void;
  onSalvar: (nome: string, telefone: string) => void;
}

function NovoClienteModal({ visible, onClose, onSalvar }: NovoClienteModalProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View className="flex-1 bg-gray-50 p-5">
        <Text className="text-xl font-bold text-gray-800 mb-5">Novo Cliente</Text>

        <Text className="text-sm font-medium text-gray-600 mb-1">Nome *</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Nome completo"
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800"
        />

        <Text className="text-sm font-medium text-gray-600 mb-1">Telefone</Text>
        <TextInput
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 text-gray-800"
        />

        <Button
          title="Salvar"
          onPress={() => {
            onSalvar(nome, telefone);
            setNome('');
            setTelefone('');
          }}
          className="mb-3"
        />
        <Button title="Cancelar" variant="outline" onPress={onClose} />
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ClientesScreen() {
  const realm = useRealm();
  const clientes = useQuery(ClienteModel);
  const service = new ClienteService(realm);

  const [modalVisible, setModalVisible] = useState(false);

  const handleCriar = (nome: string, telefone: string) => {
    try {
      service.criar({ nome, telefone: telefone || undefined });
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

  const clientesOrdenados = Array.from(clientes).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR'),
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-primary-600 px-5 pt-12 pb-5">
        <Text className="text-2xl font-bold text-white">Clientes</Text>
        <Text className="text-primary-200 text-sm mt-1">
          {clientes.length} cadastrado{clientes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={clientesOrdenados}
        keyExtractor={(item) => item._id.toHexString()}
        contentContainerClassName="px-4 pt-4 pb-24"
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-4xl mb-3">👥</Text>
            <Text className="text-gray-400 text-base">Nenhum cliente cadastrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ClienteItem cliente={item} onDelete={handleDeletar} />
        )}
      />

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-6 bg-primary-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-primary-600/50"
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>

      <NovoClienteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSalvar={handleCriar}
      />
    </View>
  );
}
