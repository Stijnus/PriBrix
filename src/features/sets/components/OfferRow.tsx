import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import { openAffiliateLink } from '@/src/lib/affiliate/openLink';

import type { OfferWithLatest } from '../types';

type OfferRowProps = {
  offer: OfferWithLatest;
  setNum: string;
  showDeliveredPrice: boolean;
};

function getStockVariant(stockStatus: OfferWithLatest['stock_status']) {
  if (stockStatus === 'in_stock') {
    return 'in-stock';
  }

  if (stockStatus === 'out_of_stock') {
    return 'out-of-stock';
  }

  return 'unknown';
}

function getShippingText(shipping: number | null) {
  if (shipping == null) {
    return 'Shipping unknown';
  }

  if (shipping === 0) {
    return 'Free shipping';
  }

  return `Shipping EUR ${shipping.toFixed(2).replace('.', ',')}`;
}

export function OfferRow({ offer, setNum, showDeliveredPrice }: OfferRowProps) {
  return (
    <View className="gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-base font-medium text-neutral-700 dark:text-neutral-100">
            {offer.retailer_name}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">{offer.country}</Text>
        </View>
        <Badge
          label={
            offer.stock_status === 'in_stock'
              ? 'In stock'
              : offer.stock_status === 'out_of_stock'
                ? 'Out of stock'
                : 'Unknown'
          }
          variant={getStockVariant(offer.stock_status)}
        />
      </View>

      <PriceDisplay price={showDeliveredPrice ? offer.delivered_price : offer.price} compact />
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">{getShippingText(offer.shipping)}</Text>

      <Pressable
        className="items-center rounded-lg bg-primary-600 px-4 py-2.5"
        onPress={() =>
          openAffiliateLink({
            setNum,
            retailer: offer.retailer_name,
            price: showDeliveredPrice ? offer.delivered_price : offer.price,
            url: offer.product_url,
          })
        }
      >
        <Text className="text-sm font-semibold text-white">Buy</Text>
      </Pressable>
    </View>
  );
}
