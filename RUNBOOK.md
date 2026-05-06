# Tradepotion Public Site Runbook

Public site: https://tradepotion.com/  
Repo: `/home/tom/projects/tradepotion-public`  
Branch: `main`  
Private app boundary: `https://app.tradepotion.com/` is out of scope.

## Scope and safety

- Work only on the public information site in `/home/tom/projects/tradepotion-public`.
- Do not modify or crawl `app.tradepotion.com` unless Tom explicitly scopes that private app work.
- Keep crypto copy neutral and informational: no investment advice, predictions, earnings claims, ratings, or unsupported exchange/sponsor claims.
- Do not change database, DNS, account, payment, or private-app settings from SEO/content tasks.

## Prerequisite checks

```bash
cd /home/tom/projects/tradepotion-public
git status --short --branch
git log -1 --oneline
node --version
npm --version
```

Expected current branch: `main...origin/main`.

## Build and tests

```bash
cd /home/tom/projects/tradepotion-public
npm run lint
npm run test
npm run build
```

Expected as of 2026-05-06: lint passes, Vitest passes, and build passes on the clean public repo.

## Local smoke pattern

```bash
cd /home/tom/projects/tradepotion-public
npm run start -- -p 3433
```

Smoke examples from another terminal:

```bash
curl -sS -I http://127.0.0.1:3433/
curl -sS http://127.0.0.1:3433/sitemap.xml | grep -c "<loc>"
curl -sS http://127.0.0.1:3433/compare/bitcoin-vs-ethereum | grep -i "<h1"
curl -sS http://127.0.0.1:3433/coins/akash-network | grep -i "akash"
```

For schema/canonical checks, use a browser-rendered or raw HTML extraction appropriate to the template. Prior inventory found no checked canonical tags and no rendered H1 on compare/search pages; verify fixes with rendered checks, not title/meta alone.

## Deploy and production verification

```bash
cd /home/tom/projects/tradepotion-public
git status --short
git add <changed-files>
git commit -m "Short imperative summary"
git push origin main
```

Then verify public URLs only:

```bash
curl -sS -I https://tradepotion.com/
curl -sS https://tradepotion.com/sitemap.xml | grep -c "<loc>"
curl -sS "https://tradepotion.com/compare/bitcoin-vs-ethereum?verification=$(git rev-parse --short HEAD)" | grep -i "bitcoin"
curl -sS "https://tradepotion.com/coins/akash-network?verification=$(git rev-parse --short HEAD)" | grep -i "akash"
```

## Cache/deploy pitfalls

- Check both canonical URLs and cache-busted query URLs after deploy.
- Cloudflare/edge cache clearing can lag. If cache-busted production shows the new content but canonical is stale, log the cache state instead of reverting.
- Keep `app.tradepotion.com` untouched and out of smoke-test target lists.

## Current SEO priorities

- First TP-3 target: add rendered H1/canonical and neutral intro copy to comparison pages, starting with `/compare/bitcoin-vs-ethereum`.
- Secondary target: improve `/coins/akash-network` copy using available public-market data while avoiding investment advice.
