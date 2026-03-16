interface AlertEmailParams {
  to: string;
  coinName: string;
  coinSymbol: string;
  targetPrice: number;
  currentPrice: number;
  direction: 'above' | 'below';
}

export async function sendAlertEmail(params: AlertEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[mailer] RESEND_API_KEY not set — skipping email to', params.to);
    return;
  }

  const directionWord = params.direction === 'above' ? 'risen above' : 'fallen below';
  const subject = `🚨 ${params.coinSymbol.toUpperCase()} alert — price ${directionWord} $${params.targetPrice.toLocaleString()}`;
  const html = `
    <h2>Trade Potion Price Alert</h2>
    <p><strong>${params.coinName} (${params.coinSymbol.toUpperCase()})</strong> has ${directionWord} your target price.</p>
    <ul>
      <li>Target: <strong>$${params.targetPrice.toLocaleString()}</strong></li>
      <li>Current price: <strong>$${params.currentPrice.toLocaleString()}</strong></li>
    </ul>
    <p><a href="https://tradepotion.com/coins/${params.coinSymbol.toLowerCase()}">View on Trade Potion →</a></p>
    <hr />
    <small>You're receiving this because you set a price alert on tradepotion.com. 
    <a href="https://tradepotion.com">Manage alerts</a></small>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Trade Potion Alerts <alerts@tradepotion.com>',
      to: [params.to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[mailer] Resend error:', res.status, body);
    throw new Error(`Resend failed: ${res.status}`);
  }
}
