import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily";

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!data.prices) {
    return NextResponse.json(
      { error: "Failed to fetch BTC data", raw: data },
      { status: 500 }
    );
  }

  const rows = data.prices.map((item: [number, number]) => {
    const [timestamp, price] = item;
    const date = new Date(timestamp).toISOString().slice(0, 10);

    return {
      date,
      btcPrice: price,
    };
  });

  return NextResponse.json(rows);
}