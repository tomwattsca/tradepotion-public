import { ExternalLink } from 'lucide-react';
import { enabledExchangePartners, exchangePartnerRel } from '@/lib/exchange-partners';

interface Props {
  coinSymbol: string;
  coinName: string;
}

export default function ExchangeCTAs({ coinSymbol, coinName }: Props) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">
        Research {coinName} markets
      </h3>
      <div className="flex flex-col gap-2">
        {enabledExchangePartners.map((ex) => (
          <a
            key={ex.name}
            href={ex.buildUrl(coinSymbol)}
            target="_blank"
            rel={exchangePartnerRel(ex)}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${ex.colorClassName}`}
            data-event="exchange_outbound_click"
            data-exchange-name={ex.name}
            data-coin-symbol={coinSymbol.toUpperCase()}
            data-page-type="coin"
            data-cta-location="coin_sidebar"
            data-sponsored={ex.sponsored ? 'true' : 'false'}
            aria-label={`Research ${coinName} markets on ${ex.name}`}
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
