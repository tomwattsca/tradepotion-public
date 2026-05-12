export type ExchangePartner = {
  name: string;
  badge: string;
  colorClassName: string;
  enabled: boolean;
  sponsored: boolean;
  placementAllowlist: Array<'coin_sidebar'>;
  disclosure: string;
  buildUrl: (symbol: string) => string;
};

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase();

export const exchangePartners: ExchangePartner[] = [
  {
    name: 'Binance',
    badge: 'Large spot market',
    colorClassName: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400',
    enabled: true,
    sponsored: false,
    placementAllowlist: ['coin_sidebar'],
    disclosure: 'Independent exchange research link; no referral tracking configured.',
    buildUrl: (symbol: string) => `https://www.binance.com/en/trade/${normalizeSymbol(symbol)}_USDT`,
  },
  {
    name: 'Bybit',
    badge: 'Spot market',
    colorClassName: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-400',
    enabled: true,
    sponsored: false,
    placementAllowlist: ['coin_sidebar'],
    disclosure: 'Independent exchange research link; no referral tracking configured.',
    buildUrl: (symbol: string) => `https://www.bybit.com/en/trade/spot/${normalizeSymbol(symbol)}/USDT`,
  },
  {
    name: 'KuCoin',
    badge: 'Altcoin market',
    colorClassName: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-400',
    enabled: true,
    sponsored: false,
    placementAllowlist: ['coin_sidebar'],
    disclosure: 'Independent exchange research link; no referral tracking configured.',
    buildUrl: (symbol: string) => `https://www.kucoin.com/trade/${normalizeSymbol(symbol)}-USDT`,
  },
];

export const enabledExchangePartners = exchangePartners.filter((partner) => partner.enabled);

export function exchangePartnerRel(partner: ExchangePartner): string {
  return partner.sponsored ? 'sponsored noopener noreferrer' : 'noopener noreferrer';
}
