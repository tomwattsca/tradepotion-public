"""
Alert checking and email dispatch via Resend.
"""
import logging
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models import PriceAlert, Coin
from app.config import settings

logger = logging.getLogger(__name__)


async def check_and_fire_alerts(
    db: AsyncSession,
    coin_id: str,
    current_price: float,
) -> int:
    """
    Check untriggered alerts for coin_id against current_price.
    Fire email for any that breach threshold. Returns count fired.
    """
    result = await db.execute(
        select(PriceAlert)
        .where(
            PriceAlert.coin_id == coin_id,
            PriceAlert.triggered == False,  # noqa: E712
        )
    )
    alerts = result.scalars().all()

    fired = 0
    for alert in alerts:
        should_fire = False
        if alert.direction == "above" and current_price >= alert.target_price:
            should_fire = True
        elif alert.direction == "below" and current_price <= alert.target_price:
            should_fire = True

        if should_fire:
            await _send_alert_email(alert, current_price)
            alert.triggered = True
            alert.triggered_at = datetime.datetime.utcnow()
            fired += 1

    if fired:
        await db.commit()
        logger.info(f"Fired {fired} alert(s) for coin {coin_id} at price ${current_price:.6f}")

    return fired


async def _send_alert_email(alert: PriceAlert, current_price: float):
    """Send email via Resend API."""
    if not settings.RESEND_API_KEY:
        logger.warning(
            f"RESEND_API_KEY not set — skipping email for alert id={alert.id} "
            f"email={alert.email} coin={alert.coin_id}"
        )
        return

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY

        direction_word = "above" if alert.direction == "above" else "below"
        subject = f"Trade Potion Alert: {alert.coin_id.upper()} is {direction_word} ${alert.target_price:,.2f}"
        body = (
            f"<h2>Price Alert Triggered</h2>"
            f"<p><strong>{alert.coin_id.upper()}</strong> has crossed your target.</p>"
            f"<ul>"
            f"<li>Target: ${alert.target_price:,.6f} ({direction_word})</li>"
            f"<li>Current price: ${current_price:,.6f}</li>"
            f"</ul>"
            f"<p>View on <a href='https://tradepotion.com/coins/{alert.coin_id}'>Trade Potion</a></p>"
            f"<hr><p style='color:#888;font-size:12px;'>You're receiving this because you set a price alert on tradepotion.com. "
            f"<a href='https://tradepotion.com/alerts/unsubscribe?email={alert.email}'>Unsubscribe</a></p>"
        )

        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": [alert.email],
            "subject": subject,
            "html": body,
        })
        logger.info(f"Alert email sent to {alert.email} for {alert.coin_id}")
    except Exception as e:
        logger.error(f"Failed to send alert email: {e}")
