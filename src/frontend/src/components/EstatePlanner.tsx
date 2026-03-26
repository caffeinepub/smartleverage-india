import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { formatINR } from "../lib/format";

export default function EstatePlanner() {
  const { actor } = useActor();
  const [estateValue, setEstateValue] = useState(50000000);
  const [leveragedPortion, setLeveragedPortion] = useState(20000000);
  const [outstandingLoan, setOutstandingLoan] = useState(10000000);
  const [heirsCount, setHeirsCount] = useState(2);
  const [distribution, setDistribution] = useState("equal");
  const [saved, setSaved] = useState(false);

  const netEstate = estateValue - outstandingLoan;
  const perHeir = heirsCount > 0 ? netEstate / heirsCount : 0;
  const loanPerHeir = heirsCount > 0 ? outstandingLoan / heirsCount : 0;
  const grossPerHeir = heirsCount > 0 ? estateValue / heirsCount : 0;

  const handleSave = async () => {
    try {
      if (!actor) return;
      await actor.saveEstatePlan({
        estateValue,
        heirsCount: BigInt(heirsCount),
        distributionStrategy: distribution,
        timestamp: BigInt(Date.now()),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="pt-6 space-y-4">
      {/* India Law Info */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#121C2A", border: "1px solid #F5A62344" }}
      >
        <h3 className="font-semibold text-sm mb-3" style={{ color: "#F5A623" }}>
          ⚖ Indian Succession & Estate Law
        </h3>
        <div
          className="grid md:grid-cols-2 gap-3 text-xs"
          style={{ color: "#A9B4C6" }}
        >
          <div className="space-y-2">
            <p>
              <strong style={{ color: "#EAF0FF" }}>No Estate Tax:</strong> India
              abolished estate duty in 1985. Inheritance is generally tax-free
              for legal heirs.
            </p>
            <p>
              <strong style={{ color: "#EAF0FF" }}>
                Gift Tax Implications:
              </strong>{" "}
              Gifts above ₹50,000 from non-relatives are taxable as income in
              recipient's hands.
            </p>
            <p>
              <strong style={{ color: "#EAF0FF" }}>
                Hindu Succession Act (1956):
              </strong>{" "}
              Governs intestate succession for Hindus. Class I heirs (spouse,
              children, mother) inherit equally.
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <strong style={{ color: "#EAF0FF" }}>LAS on Death:</strong> Loan
              Against Securities pledged by the deceased must be repaid by
              nominees before securities are transferred.
            </p>
            <p>
              <strong style={{ color: "#EAF0FF" }}>
                SEBI Transmission Rules:
              </strong>{" "}
              Demat account requires transmission form + death certificate.
              Pledges must be cleared first.
            </p>
            <p>
              <strong style={{ color: "#EAF0FF" }}>Debt Liability:</strong>{" "}
              Legal heirs are liable for debts only up to the value of assets
              inherited — not personal liability beyond estate.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Inputs */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
        >
          <h3
            className="font-semibold text-sm mb-4"
            style={{ color: "#EAF0FF" }}
          >
            Estate Simulation
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Total Estate Value (₹)",
                value: estateValue,
                onChange: setEstateValue,
              },
              {
                label: "Leveraged Portfolio Portion (₹)",
                value: leveragedPortion,
                onChange: setLeveragedPortion,
              },
              {
                label: "Outstanding Loan (LAS / Margin) (₹)",
                value: outstandingLoan,
                onChange: setOutstandingLoan,
              },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "#A9B4C6" }}>{f.label}</span>
                  <span style={{ color: "#7F8CA3" }}>{formatINR(f.value)}</span>
                </div>
                <input
                  type="number"
                  value={f.value}
                  onChange={(e) => f.onChange(Number(e.target.value))}
                  className="w-full rounded px-3 py-2 text-sm"
                  style={{
                    background: "#0E1622",
                    border: "1px solid #243246",
                    color: "#EAF0FF",
                  }}
                />
              </div>
            ))}
            <div>
              <span className="text-xs mb-1 block" style={{ color: "#A9B4C6" }}>
                Number of Heirs
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setHeirsCount(n)}
                    className="w-10 h-10 rounded text-sm font-semibold"
                    style={{
                      background: heirsCount === n ? "#2F8CFF" : "#1F2A3A",
                      color: heirsCount === n ? "white" : "#A9B4C6",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs mb-2 block" style={{ color: "#A9B4C6" }}>
                Distribution Strategy
              </span>
              <div className="flex gap-2">
                {["equal", "stepwise", "single heir"].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDistribution(d)}
                    className="flex-1 py-2 rounded text-xs font-medium capitalize"
                    style={{
                      background: distribution === d ? "#2F8CFF" : "#1F2A3A",
                      color: distribution === d ? "white" : "#A9B4C6",
                    }}
                  >
                    {d}
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
              Inheritance Summary
            </h4>
            <div className="space-y-2">
              {[
                {
                  label: "Gross Estate",
                  value: formatINR(estateValue),
                  color: "#EAF0FF",
                },
                {
                  label: "Outstanding Debt (LAS)",
                  value: `-${formatINR(outstandingLoan)}`,
                  color: "#E45858",
                },
                {
                  label: "Net Estate (after debt)",
                  value: formatINR(netEstate),
                  color: "#2FD07F",
                },
                {
                  label: "Each Heir Receives (gross)",
                  value: formatINR(grossPerHeir),
                  color: "#2F8CFF",
                },
                {
                  label: "Loan Liability per Heir",
                  value: `-${formatINR(loanPerHeir)}`,
                  color: "#E45858",
                },
                {
                  label: "Net Inheritance per Heir",
                  value: formatINR(perHeir),
                  color: perHeir > 0 ? "#2FD07F" : "#E45858",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid #1F2A3A" }}
                >
                  <span className="text-xs" style={{ color: "#A9B4C6" }}>
                    {row.label}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div
            className="rounded-xl p-4"
            style={{
              background:
                outstandingLoan / estateValue > 0.5 ? "#E4585822" : "#2FD07F22",
              border: `1px solid ${outstandingLoan / estateValue > 0.5 ? "#E45858" : "#2FD07F"}44`,
            }}
          >
            <div
              className="text-sm font-semibold mb-2"
              style={{
                color:
                  outstandingLoan / estateValue > 0.5 ? "#E45858" : "#2FD07F",
              }}
            >
              {outstandingLoan / estateValue > 0.5
                ? "⚠ Reduce Leverage Before Death"
                : "✓ Estate Structure Looks Healthy"}
            </div>
            <p className="text-xs" style={{ color: "#A9B4C6" }}>
              {outstandingLoan / estateValue > 0.5
                ? `Debt is ${((outstandingLoan / estateValue) * 100).toFixed(0)}% of estate. Heirs will inherit a heavily leveraged portfolio. Consider reducing loan or purchasing term insurance to cover outstanding debt.`
                : `Debt is only ${((outstandingLoan / estateValue) * 100).toFixed(0)}% of estate. Heirs will inherit meaningful net assets. Ensure Nomination + Will is in place for smooth SEBI demat transmission.`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2 rounded text-sm font-medium"
            style={{ background: "#2F8CFF", color: "white" }}
          >
            {saved ? "✓ Saved!" : "Save Estate Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
