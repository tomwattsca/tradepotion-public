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

interface WelcomeEmailParams {
  to: string;
  unsubscribeToken: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[mailer] RESEND_API_KEY not set — skipping welcome email to', params.to);
    return;
  }

  const unsubUrl = `https://tradepotion.com/api/newsletter/unsubscribe?token=${params.unsubscribeToken}`;
  const subject = "Welcome to Trade Potion — your crypto edge starts here";
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#09090b;color:#fff;padding:32px;border-radius:12px">
      <h1 style="font-size:24px;margin:0 0 8px">Welcome to Trade Potion</h1>
      <p style="color:#a1a1aa;font-size:14px;margin:0 0 24px">You're now subscribed to the sharpest crypto market intelligence newsletter.</p>

      <h2 style="font-size:16px;color:#8b5cf6;margin:0 0 12px">Here's what you'll get:</h2>
      <ul style="color:#d4d4d8;font-size:14px;line-height:1.8;padding-left:20px;margin:0 0 24px">
        <li><strong>Daily Market Pulse</strong> — key signals, breakouts, and volume anomalies</li>
        <li><strong>Weekly Trade Roundup</strong> — top trades, sentiment recap, upcoming catalysts</li>
        <li><strong>Deep Dives</strong> — on-chain analysis, liquidation maps, and data-driven insights</li>
      </ul>

      <p style="color:#d4d4d8;font-size:14px;margin:0 0 24px">
        While you wait for the first send, check out the latest market data on
        <a href="https://tradepotion.com" style="color:#8b5cf6;text-decoration:none">Trade Potion</a>.
      </p>

      <hr style="border:none;border-top:1px solid #27272a;margin:24px 0" />
      <p style="color:#71717a;font-size:12px;margin:0">
        You're receiving this because you subscribed at tradepotion.com.<br />
        <a href="${unsubUrl}" style="color:#71717a;text-decoration:underline">Unsubscribe</a>
      </p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Trade Potion <newsletter@tradepotion.com>',
      to: [params.to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[mailer] Resend welcome error:', res.status, body);
    throw new Error(`Resend failed: ${res.status}`);
  }
}
