import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

type LoadingSkeletonProps = {
  count?: number;
  compact?: boolean;
};

// Single opacity value is passed in — no per-placeholder animation overhead
function SkeletonPlaceholder({
  className,
  opacity,
}: {
  className: string;
  opacity: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View className={className} style={animatedStyle} />;
}

export function LoadingSkeleton({ count = 3, compact = false }: LoadingSkeletonProps) {
  // One shared value drives ALL placeholders across ALL skeleton cards
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.4, { duration: 1200 }), -1, true);
  }, [opacity]);

  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className={`overflow-hidden rounded-xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800 ${compact ? 'h-24' : 'h-32'}`}
        >
          <SkeletonPlaceholder
            className="h-4 w-24 rounded-full bg-neutral-100 dark:bg-neutral-700"
            opacity={opacity}
          />
          <SkeletonPlaceholder
            className="mt-3 h-4 w-3/4 rounded-full bg-neutral-100 dark:bg-neutral-700"
            opacity={opacity}
          />
          <SkeletonPlaceholder
            className="mt-4 h-full rounded-lg bg-neutral-100 dark:bg-neutral-700"
            opacity={opacity}
          />
        </View>
      ))}
    </View>
  );
}
