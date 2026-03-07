import { View } from 'react-native';

type LoadingSkeletonProps = {
  count?: number;
  compact?: boolean;
};

export function LoadingSkeleton({ count = 3, compact = false }: LoadingSkeletonProps) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className={`rounded-xl bg-white p-3 dark:bg-neutral-800 ${compact ? 'h-20' : 'h-28'}`}
        >
          <View className="h-full rounded-lg bg-neutral-100 dark:bg-neutral-700" />
        </View>
      ))}
    </View>
  );
}
