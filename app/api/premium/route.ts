import { NextResponse } from "next/server";

const BTC_HOLDINGS = 713502;
const SHARES_OUTSTANDING = 245000000;

export async function GET() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ALPHA_VANTAGE_API_KEY" },
      { status: 500 }
    );
  }

  const mstrUrl =
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSTR&outputsize=compact&apikey=${apiKey}`;

  const btcUrl =
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily";

  const [mstrRes, btcRes] = await Promise.all([
    fetch(mstrUrl, { cache: "no-store" }),
    fetch(btcUrl, { cache: "no-store" }),
  ]);

  const [mstrData, btcData] = await Promise.all([
    mstrRes.json(),
    btcRes.json(),
  ]);

  const mstrSeries = mstrData["Time Series (Daily)"];
  const btcPrices = btcData.prices;

  if (!mstrSeries || !btcPrices) {
    return NextResponse.json(
      { error: "Failed to fetch source data", mstrData, btcData },
      { status: 500 }
    );
  }

  const mstrRows = Object.entries(mstrSeries).map(([date, value]: [string, any]) => ({
    date,
    mstrClose: Number(value["4. close"]),
  }));

  const btcRows = btcPrices.map((item: [number, number]) => {
    const [timestamp, price] = item;
    const date = new Date(timestamp).toISOString().slice(0, 10);

    return {
      date,
      btcPrice: price,
    };
  });

  const btcMap = new Map<string, number>();
  for (const row of btcRows) {
    btcMap.set(row.date, row.btcPrice);
  }

  const merged = mstrRows
    .filter((row) => btcMap.has(row.date))
    .map((row) => {
      const btcPrice = btcMap.get(row.date)!;
      const navPerShare = (BTC_HOLDINGS * btcPrice) / SHARES_OUTSTANDING;
      const premiumPct = ((row.mstrClose / navPerShare) - 1) * 100;

      return {
        date: row.date,
        mstrClose: Number(row.mstrClose.toFixed(2)),
        btcPrice: Number(btcPrice.toFixed(2)),
        navPerShare: Number(navPerShare.toFixed(2)),
        premiumPct: Number(premiumPct.toFixed(2)),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    assumptions: {
      btcHoldings: BTC_HOLDINGS,
      sharesOutstanding: SHARES_OUTSTANDING,
    },
    data: merged,
  });
}