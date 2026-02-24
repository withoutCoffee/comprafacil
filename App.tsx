/**
 * MyStore - App de Controle de Vendas e Receitas
 *
 * Pré-requisitos para rodar:
 *   1. Ter executado todos os passos de instalação do README.md
 *   2. react-native-get-random-values DEVE ser o primeiro import
 */
import 'react-native-get-random-values'; // polyfill para crypto.getRandomValues (UUID)
import './global.css'; // NativeWind v4 - estilos Tailwind

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RealmProvider } from '@realm/react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClienteModel } from './src/models/ClienteModel';
import { ProdutoModel } from './src/models/ProdutoModel';
import { VendaModel } from './src/models/VendaModel';
import { ReceitaModel } from './src/models/ReceitaModel';

import { VendasScreen } from './src/screens/VendasScreen';
import { ClientesScreen } from './src/screens/ClientesScreen';
import { ProdutosScreen } from './src/screens/ProdutosScreen';
import { ReceitasScreen } from './src/screens/ReceitasScreen';

// ─── Navegação simples por tabs (sem biblioteca externa) ──────────────────────
// Para produção, substitua por @react-navigation/native-stack + tab navigator.

type Tab = 'vendas' | 'clientes' | 'produtos' | 'receitas';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'vendas', label: 'Vendas', icon: '🛒' },
  { key: 'clientes', label: 'Clientes', icon: '👥' },
  { key: 'produtos', label: 'Produtos', icon: '📦' },
  { key: 'receitas', label: 'Receitas', icon: '💰' },
];

function AppNavigator() {
  const [activeTab, setActiveTab] = React.useState<Tab>('vendas');

  const renderScreen = () => {
    switch (activeTab) {
      case 'vendas':    return <VendasScreen />;
      case 'clientes':  return <ClientesScreen />;
      case 'produtos':  return <ProdutosScreen />;
      case 'receitas':  return <ReceitasScreen />;
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Tela ativa */}
      <View className="flex-1">{renderScreen()}</View>

      {/* Tab Bar */}
      <SafeAreaView edges={['bottom']} className="bg-white border-t border-gray-200">
        <View className="flex-row">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-1 items-center py-2 ${isActive ? 'border-t-2 border-primary-600' : ''}`}
              >
                <Text className="text-xl">{tab.icon}</Text>
                <Text
                  className={`text-xs mt-0.5 ${
                    isActive ? 'text-primary-600 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <RealmProvider
      schema={[ClienteModel, ProdutoModel, VendaModel, ReceitaModel]}
      schemaVersion={1}
      // deleteRealmIfMigrationNeeded apenas em desenvolvimento!
      deleteRealmIfMigrationNeeded={__DEV__}
    >
      <AppNavigator />
    </RealmProvider>
  );
}
