import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'outline';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantMap: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-600 active:bg-primary-700',
    text: 'text-white',
  },
  success: {
    container: 'bg-success-500 active:bg-success-700',
    text: 'text-white',
  },
  danger: {
    container: 'bg-danger-500 active:bg-danger-700',
    text: 'text-white',
  },
  outline: {
    container: 'border border-primary-600 bg-transparent active:bg-primary-50',
    text: 'text-primary-600',
  },
};

/**
 * Botão reutilizável com variantes e estado de carregamento.
 */
export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const { container, text } = variantMap[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center rounded-xl px-5 py-3 ${container} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563eb' : '#fff'} />
      ) : (
        <Text className={`font-semibold text-base ${text}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
