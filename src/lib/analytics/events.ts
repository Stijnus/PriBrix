export function trackAffiliateClick(setNum: string, retailer: string, price: number | null) {
  if (__DEV__) {
    console.log('affiliate_click', {
      setNum,
      retailer,
      price,
    });
  }
}
