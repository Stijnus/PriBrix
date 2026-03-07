import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type ProgressBarProps = {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
};

const heights = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

export function ProgressBar({ progress, size = 'md' }: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(100, Math.max(0, progress)), { duration: 400 });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      className="overflow-hidden rounded-full bg-neutral-100"
      style={{ height: heights[size] }}
    >
      <Animated.View className="rounded-full bg-primary-500" style={[{ height: '100%' }, animatedStyle]} />
    </View>
  );
}
