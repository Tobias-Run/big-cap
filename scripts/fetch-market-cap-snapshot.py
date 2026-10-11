#!/usr/bin/env python3
"""Fetch exact daily Stock Analysis market caps; fail closed on missing dates/currencies.

Uses curl for HTTP and the Python standard library. Raw pages are saved outside
version control; the committed snapshot retains URLs, dates, raw currency values,
FX inputs and SHA-256 fingerprints. No latest-value or interpolated fallback.
"""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def fetch(url):
    result = subprocess.run(['curl', '--fail', '--location', '--silent', '--show-error',
                             '--max-time', '45', url], capture_output=True, check=True)
    return result.stdout


def parse_daily(raw, date):
    text = raw.decode()
    currency_match = re.search(r'curr:\{main:"([A-Z]+)"', text)
    # This is the provider's market-cap table, not its price history or peer caps.
    table_match = re.search(r'tables:\{daily:\[(.*?)\]', text, re.S)
    if not currency_match or not table_match:
        raise ValueError('Currency or daily market-cap table missing')
    rows = re.findall(r'\{d:"([0-9-]+)"([^{}]*)\}', table_match.group(1))
    for observed_date, fields in rows:
        if observed_date == date:
            value_match = re.search(r'(?:^|,)v:([0-9.eE+]+)(?:,|$)', fields)
            if not value_match:
                raise ValueError('Market-cap value missing')
            value = float(value_match.group(1))
            if value <= 0:
                raise ValueError('Nonpositive market cap')
            return currency_match.group(1), value
    raise ValueError(f'No exact observation on {date}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', default='2026-09-30')
    parser.add_argument('--cache-dir', default='/tmp/big-cap-market-cap-evidence')
    args = parser.parse_args()
    datetime.date.fromisoformat(args.date)
    cache = Path(args.cache_dir)
    cache.mkdir(parents=True, exist_ok=True)
    source_map = json.loads((ROOT / 'data/market-cap-snapshots/sources.json').read_text())
    fx_url = f'https://api.frankfurter.dev/v1/{args.date}'
    fx_raw = fetch(fx_url)
    fx = json.loads(fx_raw)
    if fx['date'] != args.date or fx['base'] != 'EUR':
        raise ValueError('FX reference date/base does not match')
    (cache / 'fx.json').write_bytes(fx_raw)
    rates = {'EUR': 1, **fx['rates']}
    sar_url = f'https://api.frankfurter.dev/v2/rates?date={args.date}&base=USD&quotes=SAR'
    sar_raw = fetch(sar_url)
    sar = json.loads(sar_raw)
    if len(sar) != 1 or sar[0]['date'] != args.date or sar[0]['base'] != 'USD' or sar[0]['quote'] != 'SAR':
        raise ValueError('SAR reference date/base does not match')
    (cache / 'sar-fx.json').write_bytes(sar_raw)
    observations, failures = {}, {}

    def one(item):
        company_id, url = item
        path = cache / f'{company_id}.html'
        try:
            raw = path.read_bytes() if path.exists() else fetch(url)
            path.write_bytes(raw)
            currency, local_cap = parse_daily(raw, args.date)
            provider_match = re.search(r'source:"([^"]+)",trust:\{sources:\[\{name:"([^"]+)",short:"[^"]+",url:"([^"]+)"', raw.decode())
            if not provider_match:
                raise ValueError('Historical market-cap provider metadata missing')
            if currency == 'SAR':
                usd_rate = 1 / sar[0]['rate']
                fx_source = sar_url
                fx_method = 'Dated USD/SAR reference rate via Frankfurter v2'
            else:
                if currency not in rates:
                    raise ValueError(f'No dated FX rate for {currency}')
                usd_rate = rates['USD'] / rates[currency]
                fx_source = None if currency == 'USD' else fx_url
                fx_method = 'USD denomination' if currency == 'USD' else 'ECB reference rates via Frankfurter'
            return company_id, {
                'asOf': args.date, 'sourceDate': args.date, 'currency': currency,
                'localMarketCap': local_cap, 'usdRate': usd_rate,
                'marketCap': round(local_cap * usd_rate / 1e9, 6),
                'source': f'Stock Analysis / {provider_match.group(2)}',
                'provider': provider_match.group(1), 'providerUrl': provider_match.group(3),
                'sourceUrl': url, 'fxSourceUrl': fx_source, 'fxMethod': fx_method,
                'retrievedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'evidenceSha256': hashlib.sha256(raw).hexdigest(),
            }, None
        except (ValueError, subprocess.CalledProcessError) as error:
            return company_id, None, str(error)

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        for company_id, observation, error in pool.map(one, source_map.items()):
            if error:
                failures[company_id] = error
                print(f'MISSING {company_id}: {error}', flush=True)
            else:
                observations[company_id] = observation
                print(f'OK {company_id}: {observation["marketCap"]:.3f}B USD ({observation["currency"]})', flush=True)
    result = {'asOf': args.date, 'unit': 'USD billions', 'fx': {
        'date': fx['date'], 'base': fx['base'], 'rates': rates, 'sourceUrl': fx_url,
        'evidenceSha256': hashlib.sha256(fx_raw).hexdigest(),
        'sar': {'date': args.date, 'usdToSar': sar[0]['rate'], 'sourceUrl': sar_url,
                'evidenceSha256': hashlib.sha256(sar_raw).hexdigest()}
    }, 'companies': dict(sorted(observations.items())), 'missing': failures}
    destination = ROOT / f'data/market-cap-snapshots/{args.date}.json'
    destination.write_text(json.dumps(result, indent=2) + '\n')
    print(f'Saved {len(observations)}/{len(source_map)} observations to {destination}')
    if failures:
        raise SystemExit(1)
    # Ship only fields used by the app; keep the complete audit trail above.
    public_fields = ['asOf', 'sourceDate', 'currency', 'localMarketCap', 'usdRate',
                     'marketCap', 'sourceUrl', 'fxSourceUrl']
    public_snapshot = {'asOf': args.date, 'companies': {company_id: {
        key: observation[key] for key in public_fields
    } for company_id, observation in sorted(observations.items())}}
    (ROOT / 'src/data/marketCapSnapshot.json').write_text(json.dumps(public_snapshot, indent=2) + '\n')


if __name__ == '__main__':
    main()
