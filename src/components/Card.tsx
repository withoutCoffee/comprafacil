import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  /** Variante de elevação: 'flat' não tem sombra */
  variant?: 'default' | 'flat';
}

/**
 * Card genérico estilizado com NativeWind.
 */
export function Card({ children, variant = 'default', className = '', ...rest }: CardProps) {
  const shadow =
    variant === 'default'
      ? 'shadow-md shadow-black/10'
      : '';

  return (
    <View
      className={`bg-white rounded-2xl p-4 mb-3 ${shadow} ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
