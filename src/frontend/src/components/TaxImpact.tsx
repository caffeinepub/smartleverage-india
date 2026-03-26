import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useActor } from "../hooks/useActor";
import { formatINR } from "../lib/format";

function calcTax(gains: number, isLTCG: boolean, income: number) {
  let tax: number;
  if (isLTCG) {
    const taxableGains = Math.max(0, gains - 100000);
    tax = taxableGains * 0.1;
    if (income > 20000000) tax *= 1.25;
    else if (income > 10000000) tax *= 1.15;
    else if (income > 5000000) tax *= 1.1;
  } else {
    tax = gains * 0.15;
    if (income > 20000000) tax *= 1.25;
    else if (income > 10000000) tax *= 1.15;
    else if (income > 5000000) tax *= 1.1;
  }
  return { tax, effectiveRate: gains > 0 ? (tax / gains) * 100 : 0 };
}

export default function TaxImpact() {
  const { actor } = useActor();
  const [gains, setGains] = useState(500000);
  const [isLTCG, setIsLTCG] = useState(false);
  const [income, setIncome] = useState(2000000);
  const [borrowCost, setBorrowCost] = useState(150000);
  const [saved, setSaved] = useState(false);

  const { tax, effectiveRate } = calcTax(gains, isLTCG, income);
  const netGains = gains - tax;
  const netAfterInterest = netGains - borrowCost;
  const interestDeduction = Math.min(borrowCost, gains);
  const { tax: taxWithDeduction } = calcTax(
    Math.max(0, gains - interestDeduction),
    isLTCG,
    income,
  );
  const taxSaved = tax - taxWithDeduction;

  const chartData = [1, 1.5, 2, 2.5, 3].map((leverageMultiple) => {
    const leveragedGains = gains * leverageMultiple;
    const leveragedBorrow = borrowCost * (leverageMultiple - 1);
    const { tax: t } = calcTax(
      Math.max(0, leveragedGains - (isLTCG ? 100000 : 0)),
      isLTCG,
      income,
    );
    return {
      leverage: `${leverageMultiple}x`,
      grossReturn: Math.round(leveragedGains),
      netReturn: Math.round(leveragedGains - t - leveragedBorrow),
      taxDrag: Math.round(t),
    };
  });

  const handleSave = async () => {
    try {
      if (!actor) return;
      await actor.saveTaxCalculation({
        ltcg: isLTCG ? gains : 0,
        stcg: isLTCG ? 0 : gains,
        interestDeduction: borrowCost,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="pt-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Calculator */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
        >
          <h3
            className="font-semibold text-sm mb-4"
            style={{ color: "#EAF0FF" }}
          >
            Tax Calculator (India)
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs mb-1 block" style={{ color: "#A9B4C6" }}>
                Investment Gains (₹)
              </span>
              <input
                type="number"
                value={gains}
                onChange={(e) => setGains(Number(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm"
                style={{
                  background: "#0E1622",
                  border: "1px solid #243246",
                  color: "#EAF0FF",
                }}
              />
            </div>
            <div>
              <span className="text-xs mb-1 block" style={{ color: "#A9B4C6" }}>
                Annual Income (for surcharge)
              </span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm"
                style={{
                  background: "#0E1622",
                  border: "1px solid #243246",
                  color: "#EAF0FF",
                }}
              />
            </div>
            <div>
              <span className="text-xs mb-1 block" style={{ color: "#A9B4C6" }}>
                Interest Paid on Borrowed Capital (₹)
              </span>
              <input
                type="number"
                value={borrowCost}
                onChange={(e) => setBorrowCost(Number(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm"
                style={{
                  background: "#0E1622",
                  border: "1px solid #243246",
                  color: "#EAF0FF",
                }}
              />
            </div>
            <div>
              <span className="text-xs mb-2 block" style={{ color: "#A9B4C6" }}>
                Gain Type
              </span>
              <div className="flex gap-2">
                {[
                  { label: "STCG (< 1 yr) — 15%", value: false },
                  { label: "LTCG (> 1 yr) — 10%", value: true },
                ].map((opt) => (
                  <button
                    type="button"
                    key={String(opt.value)}
                    onClick={() => setIsLTCG(opt.value)}
                    className="flex-1 py-2 px-2 rounded text-xs font-medium"
                    style={{
                      background: isLTCG === opt.value ? "#2F8CFF" : "#1F2A3A",
                      color: isLTCG === opt.value ? "white" : "#A9B4C6",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div
            className="rounded-xl p-5"
            style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
          >
            <h4
              className="text-sm font-semibold mb-3"
              style={{ color: "#EAF0FF" }}
            >
              Tax Breakdown
            </h4>
            <table className="w-full text-sm">
              <tbody>
                {[
                  {
                    label: "Gross Gains",
                    value: formatINR(gains),
                    color: "#EAF0FF",
                  },
                  {
                    label: isLTCG
                      ? "LTCG Exemption (₹1L)"
                      : "Taxable at 15% STCG",
                    value: isLTCG
                      ? formatINR(100000)
                      : `15% on ${formatINR(gains)}`,
                    color: "#A9B4C6",
                  },
                  {
                    label: "Tax Owed",
                    value: formatINR(tax),
                    color: "#E45858",
                  },
                  {
                    label: "Net Gains (after tax)",
                    value: formatINR(netGains),
                    color: "#2FD07F",
                  },
                  {
                    label: "Interest Cost (S.57 deduction)",
                    value: `-${formatINR(borrowCost)}`,
                    color: "#F5A623",
                  },
                  {
                    label: "Tax Saved via S.57",
                    value: `+${formatINR(taxSaved)}`,
                    color: "#2FD07F",
                  },
                  {
                    label: "Net After Interest & Tax",
                    value: formatINR(netAfterInterest),
                    color: netAfterInterest > 0 ? "#2FD07F" : "#E45858",
                  },
                ].map((row) => (
                  <tr
                    key={row.label}
                    style={{ borderBottom: "1px solid #1F2A3A" }}
                  >
                    <td className="py-2 text-xs" style={{ color: "#A9B4C6" }}>
                      {row.label}
                    </td>
                    <td
                      className="py-2 text-xs text-right font-medium"
                      style={{ color: row.color }}
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="mt-3 rounded p-3 text-xs"
              style={{ background: "#0F1724", color: "#F5A623" }}
            >
              Effective Tax Rate: {effectiveRate.toFixed(1)}%
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="w-full mt-3 py-2 rounded text-sm font-medium"
              style={{ background: "#2F8CFF", color: "white" }}
            >
              {saved ? "✓ Saved!" : "Save Calculation"}
            </button>
          </div>
        </div>
      </div>

      {/* Tax Rules Panel */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
      >
        <h3 className="font-semibold text-sm mb-3" style={{ color: "#EAF0FF" }}>
          India Tax Rules for Leveraged Investing
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            {
              title: "STCG — 15%",
              desc: "Short Term Capital Gains on equity/ETF held < 1 year. No exemption.",
              color: "#F5A623",
            },
            {
              title: "LTCG — 10%",
              desc: "Long Term Capital Gains on equity/ETF. First ₹1L exempt per year. Budget 2024 changed rate to 12.5% for FY25+.",
              color: "#2F8CFF",
            },
            {
              title: "Section 57 Deduction",
              desc: "Interest paid on borrowed capital is deductible against investment income under Section 57 of the Income Tax Act.",
              color: "#2FD07F",
            },
            {
              title: "STT",
              desc: "0.1% on equity delivery buy+sell. Applies on gross transaction value.",
              color: "#A9B4C6",
            },
            {
              title: "HNI Surcharge",
              desc: "Income > ₹50L: +10%. > ₹1Cr: +15%. > ₹2Cr: +25%. Applies on income tax before cess.",
              color: "#E45858",
            },
            {
              title: "Health & Edu Cess",
              desc: "4% cess on total tax including surcharge. Applicable to all taxpayers.",
              color: "#7F8CA3",
            },
          ].map((r) => (
            <div
              key={r.title}
              className="rounded p-3"
              style={{ background: "#0F1724" }}
            >
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: r.color }}
              >
                {r.title}
              </div>
              <div className="text-xs" style={{ color: "#A9B4C6" }}>
                {r.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax drag chart */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
      >
        <h3 className="font-semibold text-sm mb-4" style={{ color: "#EAF0FF" }}>
          Tax Drag at Different Leverage Levels
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2A3A" />
            <XAxis
              dataKey="leverage"
              tick={{ fill: "#7F8CA3", fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(v) => formatINR(Number(v))}
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
            <Bar
              dataKey="grossReturn"
              name="Gross Return"
              fill="#2F8CFF"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="taxDrag"
              name="Tax"
              fill="#E45858"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="netReturn"
              name="Net Return"
              fill="#2FD07F"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
