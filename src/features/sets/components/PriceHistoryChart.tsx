import { useMemo } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { Badge } from '@/src/components/ui/Badge';
import { PremiumBadge } from '@/src/features/premium/components/PremiumBadge';
import type { PriceHistoryPoint } from '@/src/lib/validation/prices';
import { colors } from '@/src/theme/colors';
import { classes } from '@/src/utils/classes';
import { formatPrice } from '@/src/utils/formatPrice';

type PriceHistoryChartProps = {
  data: PriceHistoryPoint[];
  selectedHistoryDays: 30 | 90 | 365;
  onSelectHistoryDays: (days: 30 | 90 | 365) => void;
  maxHistoryDays: 30 | 365;
  onSelectLockedHistoryDays?: (days: 90 | 365) => void;
  isLoading?: boolean;
};

const periods = [
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: '365d', value: 365 },
] as const;

function formatHistoryLabel(date: string) {
  return new Intl.DateTimeFormat('nl-BE', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function PriceHistoryChart({
  data,
  selectedHistoryDays,
  onSelectHistoryDays,
  maxHistoryDays,
  onSelectLockedHistoryDays,
  isLoading = false,
}: PriceHistoryChartProps) {
  const { width } = useWindowDimensions();

  const visibleLabelStep = data.length > 12 ? Math.ceil(data.length / 6) : 1;
  const baseSeries = useMemo(
    () =>
      data.map((point, index) => ({
        value: point.min_base_price ?? 0,
        hideDataPoint: point.min_base_price == null,
        label: index % visibleLabelStep === 0 ? formatHistoryLabel(point.date) : '',
        dateLabel: formatHistoryLabel(point.date),
      })),
    [data, visibleLabelStep],
  );
  const deliveredSeries = useMemo(
    () =>
      data.map((point) => ({
        value: point.min_delivered_price ?? 0,
        hideDataPoint: point.min_delivered_price == null,
        dateLabel: formatHistoryLabel(point.date),
      })),
    [data],
  );
  const hasBaseData = data.filter((point) => point.min_base_price != null).length >= 2;
  const hasDeliveredData = data.filter((point) => point.min_delivered_price != null).length >= 2;
  const chartWidth = Math.max(240, width - 88);

  return (
    <View className="gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-md dark:border-neutral-800 dark:bg-neutral-800">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-bold text-2xl text-neutral-900 dark:text-white">Price history</Text>
        <Badge label={isLoading ? 'Updating' : 'Live'} variant={isLoading ? 'country' : 'premium'} />
      </View>

      <View className="flex-row gap-3">
        {periods.map((period) => {
          const isLocked = maxHistoryDays === 30 && period.value !== 30;

          return (
            <Pressable
              key={period.value}
              className={classes(
                'rounded-full border px-4 py-2',
                period.value === selectedHistoryDays
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-neutral-200 bg-white text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
                isLocked && 'opacity-80',
              )}
              onPress={() =>
                isLocked ? onSelectLockedHistoryDays?.(period.value) : onSelectHistoryDays(period.value)
              }
            >
              <View className="flex-row items-center gap-1.5">
                <Text
                  className={
                    period.value === selectedHistoryDays
                      ? 'font-sans-medium text-sm text-white'
                      : 'font-sans-medium text-sm text-neutral-500 dark:text-neutral-300'
                  }
                >
                  {period.label}
                </Text>
                {isLocked ? <PremiumBadge interactive={false} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {isLoading && data.length === 0 ? (
        <Text className="font-sans text-base text-neutral-500 dark:text-neutral-400">Loading history…</Text>
      ) : !hasBaseData && !hasDeliveredData ? (
        <Text className="font-sans text-base text-neutral-500 dark:text-neutral-400">
          Not enough history data yet
        </Text>
      ) : (
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-2">
              <View className="h-2.5 w-2.5 rounded-full bg-accent-500" />
              <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">Base</Text>
            </View>
            {hasDeliveredData ? (
              <View className="flex-row items-center gap-2">
                <View className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
                  Delivered
                </Text>
              </View>
            ) : null}
          </View>

          <LineChart
            areaChart
            data={baseSeries}
            data2={hasDeliveredData ? deliveredSeries : undefined}
            width={chartWidth}
            height={200}
            color={colors.accent[500]}
            color2={colors.primary[500]}
            startFillColor={colors.accent[100]}
            endFillColor={colors.accent[50]}
            startFillColor2={colors.primary[100]}
            endFillColor2={colors.primary[50]}
            startOpacity={0.18}
            endOpacity={0.02}
            startOpacity2={0.12}
            endOpacity2={0.01}
            initialSpacing={10}
            endSpacing={10}
            spacing={Math.max(28, chartWidth / Math.max(data.length, 4))}
            thickness={3}
            thickness2={3}
            hideDataPoints={false}
            hideDataPoints2={false}
            dataPointsRadius={4}
            dataPointsRadius2={4}
            dataPointsColor={colors.accent[500]}
            dataPointsColor2={colors.primary[500]}
            yAxisColor={colors.neutral[300]}
            xAxisColor={colors.neutral[300]}
            rulesColor={colors.neutral[200]}
            textColor1={colors.neutral[500]}
            textColor2={colors.neutral[500]}
            yAxisTextStyle={{ color: colors.neutral[500], fontFamily: 'DMMono_500Medium' }}
            xAxisLabelTextStyle={{
              color: colors.neutral[500],
              fontSize: 11,
              fontFamily: 'DMSans_500Medium',
            }}
            textShiftY={8}
            noOfSections={4}
            formatYLabel={(label) => `€${Math.round(Number(label))}`}
            pointerConfig={{
              showPointerStrip: true,
              pointerStripColor: colors.neutral[300],
              pointerStripWidth: 1,
              activatePointersInstantlyOnTouch: true,
              resetPointerIndexOnRelease: false,
              pointerColor: colors.accent[500],
              pointerLabelWidth: 172,
              pointerLabelHeight: hasDeliveredData ? 88 : 68,
              pointerLabelComponent: (items: { value?: number; dateLabel?: string }[], secondaryItems: { value?: number }[]) => {
                const baseItem = items[0];
                const deliveredItem = secondaryItems[0];

                return (
                  <View className="gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                    <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-neutral-400">
                      {baseItem?.dateLabel ?? ''}
                    </Text>
                    <Text className="font-sans-medium text-sm text-accent-600">
                      Base {formatPrice(baseItem?.value ?? null)}
                    </Text>
                    {hasDeliveredData ? (
                      <Text className="font-sans-medium text-sm text-primary-600">
                        Delivered {formatPrice(deliveredItem?.value ?? null)}
                      </Text>
                    ) : null}
                  </View>
                );
              },
            }}
          />
        </View>
      )}
    </View>
  );
}
