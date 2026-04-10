import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ALPHA_VANTAGE_API_KEY" },
      { status: 500 }
    );
  }

  const url =
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSTR&outputsize=compact&apikey=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!data["Time Series (Daily)"]) {
    return NextResponse.json(
      { error: "Failed to fetch MSTR data", raw: data },
      { status: 500 }
    );
  }

  const series = data["Time Series (Daily)"];
  const rows = Object.entries(series).map(([date, value]: [string, any]) => ({
    date,
    close: Number(value["4. close"]),
  }));

  rows.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(rows);
}