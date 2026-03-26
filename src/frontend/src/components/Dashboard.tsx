import { useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "../lib/format";

const HOLDINGS = [
  { name: "RELIANCE", qty: 150, avgCost: 2450, ltp: 2891, type: "Equity" },
  { name: "TCS", qty: 80, avgCost: 3200, ltp: 3587, type: "Equity" },
  { name: "INFY", qty: 200, avgCost: 1420, ltp: 1638, type: "Equity" },
  { name: "NIFTY 50 ETF", qty: 500, avgCost: 220, ltp: 258, type: "ETF" },
  { name: "SBI DEBT FUND", qty: 1000, avgCost: 45, ltp: 48, type: "Debt" },
];

const PORTFOLIO_ALLOC = [
  { name: "Equity", value: 45, color: "#2F8CFF" },
  { name: "ETF", value: 25, color: "#2FD07F" },
  { name: "Debt", value: 20, color: "#F5A623" },
  { name: "Cash", value: 10, color: "#7F8CA3" },
];

export default function Dashboard() {
  const [ltv, setLtv] = useState(38);
  const [drawdown, setDrawdown] = useState(15);

  const portfolioValue = 4250000;
  const borrowedAmount = 1200000;
  const netWorth = portfolioValue - borrowedAmount;
  const marginUsed = (borrowedAmount / portfolioValue) * 100;
  const marginCallAt = 50; // SEBI LAS norm

  // Risk level
  const riskLevel =
    ltv < 30 ? "LOW" : ltv < 50 ? "MEDIUM" : ltv < 65 ? "HIGH" : "CRITICAL";
  const riskColor = {
    LOW: "#2FD07F",
    MEDIUM: "#F5A623",
    HIGH: "#E45858",
    CRITICAL: "#FF0000",
  }[riskLevel];

  const gaugeData = [{ value: ltv, fill: riskColor }];

  return (
    <div className="pt-6 space-y-4">
      {/* KPI Bar */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm" style={{ color: "#EAF0FF" }}>
            Portfolio Overview (INR ₹)
          </h2>
          <span
            className="text-xs px-2 py-1 rounded"
            style={{ background: "#1F2A3A", color: "#A9B4C6" }}
          >
            Live Data
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Portfolio",
              value: formatINR(portfolioValue),
              sub: "+8.4% YTD",
              subColor: "#2FD07F",
            },
            {
              label: "Utilized Leverage",
              value: formatINR(borrowedAmount),
              sub: `LTV: ${marginUsed.toFixed(1)}%`,
              subColor: "#F5A623",
            },
            {
              label: "Margin Used",
              value: `${marginUsed.toFixed(1)}%`,
              sub: `Trigger @ ${marginCallAt}%`,
              subColor: "#E45858",
            },
            {
              label: "Net Worth",
              value: formatINR(netWorth),
              sub: "After Debt",
              subColor: "#A9B4C6",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="p-3 rounded-lg"
              style={{ background: "#0F1724" }}
            >
              <div className="text-xs mb-1" style={{ color: "#7F8CA3" }}>
                {kpi.label}
              </div>
              <div className="text-xl font-bold" style={{ color: "#EAF0FF" }}>
                {kpi.value}
              </div>
              <div className="text-xs mt-1" style={{ color: kpi.subColor }}>
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Portfolio Card */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
        >
          <h3
            className="font-semibold text-sm mb-4"
            style={{ color: "#EAF0FF" }}
          >
            My Portfolio
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={PORTFOLIO_ALLOC}
                  cx={75}
                  cy={75}
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {PORTFOLIO_ALLOC.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {PORTFOLIO_ALLOC.map((a) => (
                  <div key={a.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: a.color }}
                    />
                    <span style={{ color: "#A9B4C6" }}>
                      {a.name} {a.value}%
                    </span>
                  </div>
                ))}
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: "#7F8CA3" }}>
                    <th className="text-left pb-1">Stock</th>
                    <th className="text-right pb-1">LTP</th>
                    <th className="text-right pb-1">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {HOLDINGS.map((h) => {
                    const pl = (h.ltp - h.avgCost) * h.qty;
                    return (
                      <tr
                        key={h.name}
                        style={{
                          color: "#EAF0FF",
                          borderTop: "1px solid #1F2A3A",
                        }}
                      >
                        <td className="py-1">{h.name}</td>
                        <td className="text-right">₹{h.ltp}</td>
                        <td
                          className="text-right"
                          style={{ color: pl >= 0 ? "#2FD07F" : "#E45858" }}
                        >
                          {pl >= 0 ? "+" : ""}
                          {formatINR(pl)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Margin Call Risk Card */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: "#EAF0FF" }}>
              Leverage & Margin Call Risk
            </h3>
            <span
              className="text-xs px-2 py-1 rounded font-semibold"
              style={{ background: `${riskColor}22`, color: riskColor }}
            >
              Risk: {riskLevel}
            </span>
          </div>

          {/* Gauge */}
          <div className="flex flex-col items-center mb-4">
            <ResponsiveContainer width={200} height={120}>
              <RadialBarChart
                cx={100}
                cy={100}
                innerRadius={60}
                outerRadius={90}
                startAngle={180}
                endAngle={0}
                data={gaugeData}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={5}
                  background={{ fill: "#1F2A3A" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="-mt-10 text-center">
              <div className="text-2xl font-bold" style={{ color: riskColor }}>
                {ltv}%
              </div>
              <div className="text-xs" style={{ color: "#7F8CA3" }}>
                Current LTV
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#A9B4C6" }}>LTV Ratio</span>
                <span style={{ color: riskColor }}>{ltv}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                value={ltv}
                onChange={(e) => setLtv(Number(e.target.value))}
                className="w-full h-1 rounded"
                style={{ accentColor: riskColor }}
              />
              <div
                className="flex justify-between text-xs mt-1"
                style={{ color: "#7F8CA3" }}
              >
                <span>0%</span>
                <span className="text-red-400">
                  ⚠ Margin Call @ {marginCallAt}%
                </span>
                <span>90%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#A9B4C6" }}>Hypothetical Drawdown</span>
                <span style={{ color: "#E45858" }}>-{drawdown}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={drawdown}
                onChange={(e) => setDrawdown(Number(e.target.value))}
                className="w-full h-1 rounded"
                style={{ accentColor: "#E45858" }}
              />
            </div>

            <div
              className="rounded-lg p-3 text-xs"
              style={{ background: "#0F1724" }}
            >
              <div style={{ color: "#A9B4C6" }}>
                After -{drawdown}% drawdown:
              </div>
              <div
                className="mt-1"
                style={{
                  color:
                    ltv * (1 + drawdown / 100) > marginCallAt
                      ? "#E45858"
                      : "#2FD07F",
                }}
              >
                {ltv * (1 + drawdown / 100) > marginCallAt
                  ? `⚠ Margin call triggered! LTV would reach ${(ltv * (1 + drawdown / 100)).toFixed(1)}%`
                  : `✓ Safe. LTV would be ${(ltv * (1 + drawdown / 100)).toFixed(1)}% (below ${marginCallAt}% SEBI limit)`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth chart */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
      >
        <h3 className="font-semibold text-sm mb-4" style={{ color: "#EAF0FF" }}>
          Compound Growth Projection (10Y @ 12% unleveraged vs 18% leveraged)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={Array.from({ length: 11 }, (_, i) => ({
              year: `Y${i}`,
              unleveraged: Math.round(4250000 * 1.12 ** i),
              leveraged: Math.round(4250000 * 1.18 ** i),
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2A3A" />
            <XAxis dataKey="year" tick={{ fill: "#7F8CA3", fontSize: 11 }} />
            <YAxis
              tickFormatter={(v) => formatINR(v)}
              tick={{ fill: "#7F8CA3", fontSize: 10 }}
            />
            <Tooltip
              formatter={(v) => formatINR(Number(v))}
              contentStyle={{
                background: "#121C2A",
                border: "1px solid #1F2A3A",
                color: "#EAF0FF",
              }}
            />
            <Line
              type="monotone"
              dataKey="unleveraged"
              stroke="#A9B4C6"
              strokeWidth={2}
              dot={false}
              name="Standard"
            />
            <Line
              type="monotone"
              dataKey="leveraged"
              stroke="#2F8CFF"
              strokeWidth={2}
              dot={false}
              name="Leveraged"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
