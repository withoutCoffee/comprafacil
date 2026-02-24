import React from 'react';
import { View, Text } from 'react-native';
import type { VendaStatus } from '../types';

interface StatusBadgeProps {
  status: VendaStatus;
}

const statusConfig: Record<VendaStatus, { container: string; text: string; label: string }> = {
  pendente: {
    container: 'bg-danger-100',
    text: 'text-danger-700',
    label: 'Pendente',
  },
  parcial: {
    container: 'bg-warning-100',
    text: 'text-warning-700',
    label: 'Parcial',
  },
  pago: {
    container: 'bg-success-100',
    text: 'text-success-700',
    label: 'Pago',
  },
};

/**
 * Badge visual para exibir o status de uma venda.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { container, text, label } = statusConfig[status];
  return (
    <View className={`rounded-full px-3 py-1 self-start ${container}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
