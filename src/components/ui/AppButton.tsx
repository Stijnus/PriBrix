import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@/src/theme';
import { classes } from '@/src/utils/classes';

type AppButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

const sizeClasses = {
  xs: 'h-8 rounded-sm px-3',
  sm: 'h-10 rounded-md px-4',
  md: 'h-12 rounded-lg px-6',
  lg: 'h-14 rounded-lg px-8',
} as const;

const textSizeClasses = {
  xs: 'text-sm',
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
} as const;

const variantClasses = {
  primary: 'bg-primary-500',
  secondary: 'bg-neutral-100',
  ghost: 'border-[1.5px] border-primary-300 bg-transparent',
  dark: 'bg-neutral-900',
} as const;

const variantTextClasses = {
  primary: 'text-white',
  secondary: 'text-neutral-700 dark:text-neutral-100',
  ghost: 'text-primary-500',
  dark: 'text-white',
} as const;

export function AppButton({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
}: AppButtonProps) {
  return (
    <Pressable
      className={classes(
        'items-center justify-center',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        disabled && 'opacity-50',
      )}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        variant === 'primary' ? theme.shadow.red : undefined,
        pressed ? { transform: [{ scale: 0.97 }] } : undefined,
      ]}
    >
      <View className="flex-row items-center justify-center gap-2">
        {icon}
        <Text
          className={classes(
            'font-sans-semibold',
            textSizeClasses[size],
            variantTextClasses[variant],
          )}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}
