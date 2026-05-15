import { ExternalLink } from 'lucide-react';
import { enabledExchangePartners, exchangePartnerRel } from '@/lib/exchange-partners';

interface Props {
  coinSymbol: string;
  coinName: string;
}

export default function ExchangeCTAs({ coinSymbol, coinName }: Props) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">Availability research</p>
        <h3 className="mt-1 text-sm font-semibold text-zinc-300">
          Research {coinName} market venues
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Use these neutral links to check whether the exact {coinSymbol.toUpperCase()} market is listed, liquid, and available in your region.
        </p>
      </div>
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
            aria-label={`Research ${coinName} market availability on ${ex.name}`}
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
      <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-300">Before acting on a venue result</h4>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-zinc-500">
          <li>Confirm the listing is the exact {coinSymbol.toUpperCase()} asset and network.</li>
          <li>Check regional availability, fees, liquidity, spread, custody, and withdrawal rules directly with the venue.</li>
          <li>Treat every outbound result as independent research, not a Trade Potion recommendation or sponsored ranking.</li>
        </ul>
      </div>
      <p className="mt-3 text-xs text-zinc-600">
        Trade Potion does not provide financial advice, execute trades, or verify venue access. Partner links stay clearly marked through non-PII tracking hooks.
      </p>
    </div>
  );
}
