import { ExternalLink } from 'lucide-react';

interface Props {
  coinSymbol: string;
  coinName: string;
}

const EXCHANGES = [
  {
    name: 'Binance',
    url: (symbol: string) =>
      `https://www.binance.com/en/trade/${symbol.toUpperCase()}_USDT`,
    color: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400',
    badge: 'Large spot market',
  },
  {
    name: 'Bybit',
    url: (symbol: string) =>
      `https://www.bybit.com/en/trade/spot/${symbol.toUpperCase()}/USDT`,
    color: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-400',
    badge: 'Spot market',
  },
  {
    name: 'KuCoin',
    url: (symbol: string) =>
      `https://www.kucoin.com/trade/${symbol.toUpperCase()}-USDT`,
    color: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-400',
    badge: 'Altcoin market',
  },
];

export default function ExchangeCTAs({ coinSymbol, coinName }: Props) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">
        Research {coinName} markets
      </h3>
      <div className="flex flex-col gap-2">
        {EXCHANGES.map((ex) => (
          <a
            key={ex.name}
            href={ex.url(coinSymbol)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${ex.color}`}
          >
            <div>
              <span className="text-sm font-semibold">{ex.name}</span>
              {ex.badge && (
                <span className="ml-2 text-xs opacity-60">{ex.badge}</span>
              )}
            </div>
            <ExternalLink className="h-4 w-4 opacity-70" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-600">
        Outbound exchange links are for independent research. Trade Potion does not provide financial advice; verify availability, fees, and regional rules directly with each exchange.
      </p>
    </div>
  );
}
