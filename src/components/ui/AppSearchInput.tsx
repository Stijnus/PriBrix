import { type ComponentProps, useState } from 'react';
import { TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

import { theme } from '@/src/theme';
import { classes } from '@/src/utils/classes';

type AppSearchInputProps = ComponentProps<typeof TextInput>;

export function AppSearchInput({ onFocus, onBlur, ...props }: AppSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={classes(
        'flex-row items-center gap-3 rounded-lg px-4',
        isFocused
          ? 'border-[1.5px] border-primary-400 bg-white dark:bg-neutral-800'
          : 'border border-transparent bg-neutral-100 dark:bg-neutral-800',
      )}
      style={
        isFocused
          ? {
              shadowColor: '#FDE8EA',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 3,
            }
          : undefined
      }
    >
      <Search color={theme.colors.neutral[400]} size={18} strokeWidth={2} />
      <TextInput
        placeholderTextColor={theme.colors.neutral[400]}
        className="h-12 flex-1 font-sans text-base text-neutral-900 dark:text-white"
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}
