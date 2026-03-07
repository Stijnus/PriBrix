export const legoDisclaimer =
  'PriBrix is an independent price tracker and is not affiliated with or endorsed by the LEGO Group.';

export const privacyPolicySections = [
  {
    title: 'What PriBrix collects',
    body:
      'PriBrix stores the lists you create, your account email when you sign in with magic links, push notification tokens for alerts, and app preferences such as country and delivered-price display. Anonymous lists stay on your device until you choose to sign in.',
  },
  {
    title: 'How data is used',
    body:
      'We use your data to sync your watchlist, wishlist, and collection across devices, evaluate price alerts, send push notifications you requested, and improve app reliability. Price data shown in the app comes from authorized affiliate feeds and APIs, not scraping.',
  },
  {
    title: 'Third-party services',
    body:
      'PriBrix shares limited data with infrastructure providers that power authentication, database storage, notifications, crash reporting, analytics, and affiliate attribution. Affiliate networks may receive referral data when you open retailer links from the app.',
  },
  {
    title: 'Your rights',
    body:
      'Users in Belgium, the Netherlands, and the wider EU can request access, correction, deletion, or export of personal data. You can delete your PriBrix account from Settings, which removes synced user data and clears local app storage.',
  },
] as const;

export const termsSections = [
  {
    title: 'Using PriBrix',
    body:
      'PriBrix is provided for personal price-tracking use. You agree not to misuse the app, interfere with the service, reverse engineer private systems, or use PriBrix to violate retailer or affiliate network terms.',
  },
  {
    title: 'Pricing and availability',
    body:
      'Retailer prices, stock, shipping, and affiliate offers can change at any time. PriBrix does not guarantee that displayed data is complete, current, or error-free at the exact moment you visit a retailer.',
  },
  {
    title: 'Subscriptions',
    body:
      'Premium unlocks higher watchlist limits, longer history, and advanced alerts. Billing terms shown in the paywall or store listing apply to any paid plan. Beta builds may use manual entitlements before automated billing is live.',
  },
  {
    title: 'Liability',
    body:
      'PriBrix is provided on an as-is basis to the extent allowed by law. We are not responsible for retailer transactions, third-party sites, lost savings, or indirect damages arising from use of the app.',
  },
] as const;

export const affiliateDisclosureSections = [
  {
    title: 'Affiliate disclosure',
    body:
      'PriBrix earns a commission when you buy through some retailer links shown in the app. That commission may support the service at no additional cost to you.',
  },
  {
    title: 'How this affects ranking',
    body:
      'We aim to rank offers by the actual price data available for your selected country and display preference. Affiliate participation does not change the raw tracked price of a set.',
  },
  {
    title: 'Before you buy',
    body:
      'Always confirm the final retailer price, shipping cost, stock status, and product details on the retailer website before purchasing.',
  },
] as const;
