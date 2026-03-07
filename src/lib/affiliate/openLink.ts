import * as WebBrowser from 'expo-web-browser';

import { trackAffiliateClick } from '@/src/lib/analytics/events';

type OpenAffiliateLinkInput = {
  setNum: string;
  retailer: string;
  price: number | null;
  url: string;
};

export async function openAffiliateLink({ setNum, retailer, price, url }: OpenAffiliateLinkInput) {
  trackAffiliateClick(setNum, retailer, price);
  await WebBrowser.openBrowserAsync(url);
}
