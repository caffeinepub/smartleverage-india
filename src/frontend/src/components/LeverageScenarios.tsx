import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useActor } from "../hooks/useActor";
import { formatINR, formatPct } from "../lib/format";

type Verdict = "SMART" | "CAUTION" | "DANGEROUS";

function getVerdict(
  spread: number,
  ltv: number,
): { verdict: Verdict; reason: string } {
  if (spread > 3 && ltv < 40)
    return {
      verdict: "SMART",
      reason: `Spread of ${spread.toFixed(2)}% with LTV below 40% — strong risk-adjusted return. SEBI Loan Against Securities norms satisfied.`,
    };
  if (spread < 1 || ltv > 60)
    return {
      verdict: "DANGEROUS",
      reason: `${spread < 1 ? `Thin spread of only ${spread.toFixed(2)}% barely covers borrow cost.` : ""} ${ltv > 60 ? `LTV of ${ltv.toFixed(1)}% exceeds safe SEBI threshold of 50%.` : ""} High margin call risk.`,
    };
  return {
    verdict: "CAUTION",
    reason: `Moderate spread of ${spread.toFixed(2)}% with LTV at ${ltv.toFixed(1)}%. Proceed with caution and maintain buffer.`,
  };
}

const VERDICTMETA = {
  SMART: { color: "#2FD07F", bg: "#2FD07F22", icon: "✓" },
  CAUTION: { color: "#F5A623", bg: "#F5A62322", icon: "⚠" },
  DANGEROUS: { color: "#E45858", bg: "#E4585822", icon: "✗" },
};

export default function LeverageScenarios() {
  const { actor } = useActor();
  const [portfolioValue, setPortfolioValue] = useState(5000000);
  const [borrowAmount, setBorrowAmount] = useState(2000000);
  const [borrowRate, setBorrowRate] = useState(9.5);
  const [targetYield, setTargetYield] = useState(13);
  const [horizon, setHorizon] = useState(5);
  const [assetType, setAssetType] = useState("Private Credit");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const ltv = (borrowAmount / portfolioValue) * 100;
  const netSpread = targetYield - borrowRate;
  const effectiveReturn =
    targetYield + (netSpread * borrowAmount) / portfolioValue;
  const { verdict, reason } = getVerdict(netSpread, ltv);
  const vm = VERDICTMETA[verdict];

  // Growth projection data
  const growthData = Array.from({ length: horizon + 1 }, (_, i) => ({
    year: `Y${i}`,
    unleveraged: Math.round(portfolioValue * (1 + targetYield / 100) ** i),
    leveraged: Math.round(
      (portfolioValue + borrowAmount) * (1 + effectiveReturn / 100) ** i -
        borrowAmount * (1 + borrowRate / 100) ** i,
    ),
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!actor) return;
      await actor.saveLeverageScenario({
        portfolioValue,
        borrowAmount,
        borrowRate,
        targetYield,
        horizonYears: horizon,
        ltvRatio: ltv / 100,
        assetType,
        timestamp: BigInt(Date.now()),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="pt-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Builder Form */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
        >
          <h3
            className="font-semibold text-sm mb-4"
            style={{ color: "#EAF0FF" }}
          >
            Scenario Builder
          </h3>
          <div className="space-y-4">
            <Field label="Portfolio Value (₹)" hint={formatINR(portfolioValue)}>
              <input
                type="number"
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(Number(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm"
                style={{
                  background: "#0E1622",
                  border: "1px solid #243246",
                  color: "#EAF0FF",
                }}
              />
            </Field>
            <Field label="Borrow Amount (₹)" hint={formatINR(borrowAmount)}>
              <input
                type="number"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(Number(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm"
                style={{
                  background: "#0E1622",
                  border: "1px solid #243246",
                  color: "#EAF0FF",
                }}
              />
            </Field>
            <Field label={`Borrow Rate: ${formatPct(borrowRate)}`}>
              <input
                type="range"
                min={6}
                max={18}
                step={0.1}
                value={borrowRate}
                onChange={(e) => setBorrowRate(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "#2F8CFF" }}
              />
              <div
                className="flex justify-between text-xs"
                style={{ color: "#7F8CA3" }}
              >
                <span>6%</span>
                <span>18%</span>
              </div>
            </Field>
            <Field label={`Target Investment Yield: ${formatPct(targetYield)}`}>
              <input
                type="range"
                min={1}
                max={25}
                step={0.1}
                value={targetYield}
                onChange={(e) => setTargetYield(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "#2FD07F" }}
              />
              <div
                className="flex justify-between text-xs"
                style={{ color: "#7F8CA3" }}
              >
                <span>1%</span>
                <span>25%</span>
              </div>
            </Field>
            <Field label="Investment Horizon">
              <div className="flex gap-2">
                {[1, 3, 5, 10].map((y) => (
                  <button
                    type="button"
                    key={y}
                    onClick={() => setHorizon(y)}
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{
                      background: horizon === y ? "#2F8CFF" : "#1F2A3A",
                      color: horizon === y ? "white" : "#A9B4C6",
                    }}
                  >
                    {y}Y
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Asset Type">
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full rounded px-3 py-2 text-sm"
                style={{
                  background: "#0E1622",
                  border: "1px solid #243246",
                  color: "#EAF0FF",
                }}
              >
                {[
                  "Equity ETF",
                  "Private Credit",
                  "Real Estate",
                  "Debt Fund",
                  "NCD",
                  "REITs",
                  "InvITs",
                ].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Verdict */}
          <div
            className="rounded-xl p-5"
            style={{ background: "#121C2A", border: `1px solid ${vm.color}44` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl font-black" style={{ color: vm.color }}>
                {vm.icon}
              </div>
              <div>
                <div
                  className="text-2xl font-black"
                  style={{ color: vm.color }}
                >
                  {verdict}
                </div>
                <div className="text-xs" style={{ color: "#A9B4C6" }}>
                  Leverage Assessment
                </div>
              </div>
            </div>
            <p className="text-sm" style={{ color: "#A9B4C6" }}>
              {reason}
            </p>
          </div>

          {/* Metrics */}
          <div
            className="rounded-xl p-5"
            style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
          >
            <h4
              className="text-sm font-semibold mb-3"
              style={{ color: "#EAF0FF" }}
            >
              Key Metrics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Net Spread",
                  value: formatPct(netSpread),
                  color:
                    netSpread > 3
                      ? "#2FD07F"
                      : netSpread > 0
                        ? "#F5A623"
                        : "#E45858",
                },
                {
                  label: "LTV Ratio",
                  value: formatPct(ltv),
                  color:
                    ltv < 40 ? "#2FD07F" : ltv < 60 ? "#F5A623" : "#E45858",
                },
                {
                  label: "Effective Return",
                  value: formatPct(effectiveReturn),
                  color: "#2F8CFF",
                },
                {
                  label: "Borrow Cost/Yr",
                  value: formatINR((borrowAmount * borrowRate) / 100),
                  color: "#E45858",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="p-3 rounded"
                  style={{ background: "#0F1724" }}
                >
                  <div className="text-xs" style={{ color: "#7F8CA3" }}>
                    {m.label}
                  </div>
                  <div
                    className="text-lg font-bold mt-1"
                    style={{ color: m.color }}
                  >
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <table className="w-full mt-4 text-xs">
              <thead>
                <tr
                  style={{
                    color: "#7F8CA3",
                    borderBottom: "1px solid #1F2A3A",
                  }}
                >
                  <th className="text-left py-2">Metric</th>
                  <th className="text-right py-2">Current</th>
                  <th className="text-right py-2">With Leverage</th>
                </tr>
              </thead>
              <tbody style={{ color: "#EAF0FF" }}>
                <tr style={{ borderBottom: "1px solid #1F2A3A" }}>
                  <td className="py-2">Portfolio Size</td>
                  <td className="text-right">{formatINR(portfolioValue)}</td>
                  <td className="text-right" style={{ color: "#2F8CFF" }}>
                    {formatINR(portfolioValue + borrowAmount)}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #1F2A3A" }}>
                  <td className="py-2">Annual Return (est)</td>
                  <td className="text-right">
                    {formatINR((portfolioValue * targetYield) / 100)}
                  </td>
                  <td
                    className="text-right"
                    style={{ color: netSpread > 0 ? "#2FD07F" : "#E45858" }}
                  >
                    {formatINR(
                      ((portfolioValue + borrowAmount) * targetYield) / 100 -
                        (borrowAmount * borrowRate) / 100,
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">LTV</td>
                  <td className="text-right">0%</td>
                  <td
                    className="text-right"
                    style={{ color: ltv > 50 ? "#E45858" : "#F5A623" }}
                  >
                    {formatPct(ltv)}
                  </td>
                </tr>
              </tbody>
            </table>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4 py-2 rounded text-sm font-medium"
              style={{
                background: saving ? "#1F2A3A" : "#2F8CFF",
                color: "white",
              }}
            >
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Scenario"}
            </button>
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
      >
        <h3 className="font-semibold text-sm mb-4" style={{ color: "#EAF0FF" }}>
          Compound Growth Projection ({horizon}Y)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={growthData}>
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
            <Legend wrapperStyle={{ color: "#A9B4C6", fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="unleveraged"
              stroke="#A9B4C6"
              strokeWidth={2}
              dot={false}
              name="Unleveraged"
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

function Field({
  label,
  hint,
  children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: "#A9B4C6" }}>{label}</span>
        {hint && <span style={{ color: "#7F8CA3" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
