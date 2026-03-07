import { Pressable, Text, View } from 'react-native';
import { ExternalLink, ShoppingCart, Store } from 'lucide-react-native';

import { Badge } from '@/src/components/ui/Badge';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import { openAffiliateLink } from '@/src/lib/affiliate/openLink';
import { theme } from '@/src/theme';

import type { OfferWithLatest } from '../types';

type OfferRowProps = {
  offer: OfferWithLatest;
  setNum: string;
  showDeliveredPrice: boolean;
  isBestPrice?: boolean;
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

export function OfferRow({ offer, setNum, showDeliveredPrice, isBestPrice = false }: OfferRowProps) {
  const activePrice = showDeliveredPrice ? offer.delivered_price : offer.price;

  return (
    <View
      className={`gap-3 rounded-lg bg-white p-4 dark:bg-neutral-800 ${
        isBestPrice
          ? 'border-2 border-primary-500'
          : 'border border-neutral-200 dark:border-neutral-700'
      }`}
      style={isBestPrice ? theme.shadow.md : undefined}
    >
      <View className="flex-row items-center gap-4">
        <View className="h-10 w-10 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-900">
          {isBestPrice ? (
            <ShoppingCart color={theme.colors.primary[500]} size={18} strokeWidth={2} />
          ) : (
            <Store color={theme.colors.neutral[600]} size={18} strokeWidth={2} />
          )}
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">
              {offer.retailer_name}
            </Text>
            {isBestPrice ? <Badge label="Best price" variant="country" /> : null}
          </View>
          <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
            {offer.country}
          </Text>
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
        <PriceDisplay compact price={activePrice} />
      </View>

      <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
        {getShippingText(offer.shipping)}
      </Text>

      <Pressable
        className={`flex-row items-center justify-center gap-2 rounded-md px-4 py-2.5 ${
          isBestPrice ? 'bg-primary-500' : 'border border-primary-300 bg-transparent'
        }`}
        onPress={() =>
          openAffiliateLink({
            setNum,
            retailer: offer.retailer_name,
            price: activePrice,
            url: offer.product_url,
          })
        }
      >
        <ExternalLink color={isBestPrice ? theme.colors.white : theme.colors.primary[500]} size={16} />
        <Text
          className={`font-sans-semibold text-sm ${
            isBestPrice ? 'text-white' : 'text-primary-500'
          }`}
        >
          {isBestPrice ? 'Buy now' : 'View deal'}
        </Text>
      </Pressable>
    </View>
  );
}
