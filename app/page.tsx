"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Row = {
  date: string;
  mstrClose: number;
  btcPrice: number;
  navPerShare: number;
  premiumPct: number;
};

export default function Home() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"1M" | "3M" | "ALL">("ALL");
  useEffect(() => {
    fetch("/api/premium")
      .then((res) => res.json())
      .then((json) => {
        setData(json.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const latest = data[data.length - 1];
  const filteredData =
    range === "1M"
      ? data.slice(-30)
      : range === "3M"
      ? data.slice(-90)
      : data;
  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">
          DAT.co Dashboard — MSTR Premium to NAV
        </h1>

        <p className="text-gray-600">
          This dashboard shows a daily premium-to-NAV proxy for Strategy (MSTR).
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {latest && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-gray-500">Latest Date</div>
                  <div className="text-xl font-semibold">{latest.date}</div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-gray-500">MSTR Price</div>
                  <div className="text-xl font-semibold">
                    ${latest.mstrClose}
                  </div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-gray-500">BTC Price</div>
                  <div className="text-xl font-semibold">
                    ${latest.btcPrice}
                  </div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-gray-500">Premium to NAV</div>
                  <div className="text-xl font-semibold">
                    {latest.premiumPct}%
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Premium to NAV Over Time</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setRange("1M")}
                  className={`px-3 py-1 rounded-lg border ${
                    range === "1M" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  1M
                </button>

                <button
                  onClick={() => setRange("3M")}
                  className={`px-3 py-1 rounded-lg border ${
                    range === "3M" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  3M
                </button>

                <button
                  onClick={() => setRange("ALL")}
                  className={`px-3 py-1 rounded-lg border ${
                    range === "ALL" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  All
                </button>
              </div>
            </div>
            <div className="rounded-2xl border p-4">
              <h2 className="text-xl font-semibold mb-4">
                MSTR Price Over Time
              </h2>

              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" minTickGap={40} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="mstrClose" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
                        <div className="rounded-2xl border p-4">
              <h2 className="text-xl font-semibold mb-4">
                BTC Price Over Time
              </h2>

              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" minTickGap={40} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="btcPrice" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border p-4">
              <h2 className="text-xl font-semibold mb-2">Formula</h2>
              <p className="text-gray-700">
                NAV per share = (BTC Holdings × BTC Price) / Shares Outstanding
              </p>
              <p className="text-gray-700">
                Premium to NAV = (MSTR Price / NAV per share - 1) × 100%
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <h2 className="text-xl font-semibold mb-2">Interpretation</h2>
              <p className="text-gray-700">
                This premium-to-NAV proxy compares MSTR's stock price with the
                implied Bitcoin treasury value per share. A higher premium may
                suggest that investors are willing to pay extra for Strategy's
                Bitcoin exposure, capital structure, or future accumulation
                strategy.
              </p>
            </div>
                        <div className="rounded-2xl border p-4">
              <h2 className="text-xl font-semibold mb-2">
                Data Source & Disclaimer
              </h2>
              <p className="text-gray-700">
                MSTR price data is fetched from Alpha Vantage, and BTC price
                data is fetched from CoinGecko. This dashboard uses a simplified
                premium-to-NAV proxy based on fixed BTC holdings and shares
                outstanding assumptions, so it should be interpreted as an
                analytical approximation rather than an official accounting NAV.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}