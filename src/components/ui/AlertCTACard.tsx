import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { AppButton } from './AppButton';

type AlertCTACardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
};

export function AlertCTACard({ icon, title, description, buttonLabel, onPress }: AlertCTACardProps) {
  return (
    <View className="items-center rounded-xl border-[1.5px] border-primary-100 bg-primary-50 p-6">
      {icon}
      <Text className="mt-3 font-sans-semibold text-lg text-neutral-900 dark:text-neutral-100">
        {title}
      </Text>
      <Text className="mt-1 text-center font-sans text-base text-neutral-500">
        {description}
      </Text>
      <View className="mt-4">
        <AppButton onPress={onPress}>{buttonLabel}</AppButton>
      </View>
    </View>
  );
}
