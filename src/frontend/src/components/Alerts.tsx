import { useState } from "react";
import { useActor } from "../hooks/useActor";

const MOCK_ALERTS = [
  {
    id: 1,
    type: "rate_drop",
    message: "Borrow rate dropped to 8.9% — below your 9.5% threshold",
    time: "2 hrs ago",
    action: { borrow: 1500000, rate: 8.9, invest: "NIFTY 50 ETF" },
    triggered: true,
  },
  {
    id: 2,
    type: "ltv_improve",
    message: "Portfolio LTV improved to 34% — below your 40% trigger",
    time: "Yesterday",
    action: { borrow: 800000, rate: 9.2, invest: "Private Credit" },
    triggered: true,
  },
  {
    id: 3,
    type: "margin_warn",
    message: "Margin call risk elevated — LTV approaching 48%",
    time: "3 days ago",
    action: null,
    triggered: false,
  },
];

export default function Alerts() {
  const { actor } = useActor();
  const [borrowThreshold, setBorrowThreshold] = useState(9.5);
  const [ltvThreshold, setLtvThreshold] = useState(40);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmAlert, setConfirmAlert] = useState<
    (typeof MOCK_ALERTS)[0] | null
  >(null);
  const [executed, setExecuted] = useState<number[]>([]);

  const handleSavePrefs = async () => {
    setSaving(true);
    try {
      if (!actor) return;
      await actor.setAlertPrefs({
        borrowRateThreshold: borrowThreshold,
        ltvThreshold,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleExecute = (alertId: number) => {
    setExecuted((prev) => [...prev, alertId]);
    setConfirmAlert(null);
  };

  return (
    <div className="pt-6 space-y-4">
      {/* Alert Config */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
      >
        <h3 className="font-semibold text-sm mb-4" style={{ color: "#EAF0FF" }}>
          Alert Configuration
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: "#A9B4C6" }}>
                Alert when Borrow Rate drops below
              </span>
              <span style={{ color: "#2F8CFF" }}>
                {borrowThreshold.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={6}
              max={15}
              step={0.1}
              value={borrowThreshold}
              onChange={(e) => setBorrowThreshold(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#2F8CFF" }}
            />
            <div
              className="flex justify-between text-xs"
              style={{ color: "#7F8CA3" }}
            >
              <span>6%</span>
              <span>15%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: "#A9B4C6" }}>
                Alert when Portfolio LTV drops below
              </span>
              <span style={{ color: "#2FD07F" }}>{ltvThreshold}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={70}
              step={1}
              value={ltvThreshold}
              onChange={(e) => setLtvThreshold(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#2FD07F" }}
            />
            <div
              className="flex justify-between text-xs"
              style={{ color: "#7F8CA3" }}
            >
              <span>10%</span>
              <span>70%</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSavePrefs}
          disabled={saving}
          className="mt-4 px-6 py-2 rounded text-sm font-medium"
          style={{ background: saving ? "#1F2A3A" : "#2F8CFF", color: "white" }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Preferences"}
        </button>
      </div>

      {/* Alert Feed */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#121C2A", border: "1px solid #1F2A3A" }}
      >
        <h3 className="font-semibold text-sm mb-4" style={{ color: "#EAF0FF" }}>
          Active Alerts
        </h3>
        <div className="space-y-3">
          {MOCK_ALERTS.map((alert) => {
            const isExecuted = executed.includes(alert.id);
            const color = alert.triggered
              ? alert.type === "margin_warn"
                ? "#F5A623"
                : "#2FD07F"
              : "#A9B4C6";
            return (
              <div
                key={alert.id}
                className="rounded-lg p-4"
                style={{
                  background: "#0F1724",
                  border: `1px solid ${color}33`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm" style={{ color: "#EAF0FF" }}>
                      {alert.message}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#7F8CA3" }}>
                      {alert.time}
                    </div>
                  </div>
                  {alert.action && !isExecuted && (
                    <button
                      type="button"
                      onClick={() => setConfirmAlert(alert)}
                      className="shrink-0 px-4 py-1.5 rounded text-xs font-semibold"
                      style={{ background: "#2F8CFF", color: "white" }}
                    >
                      Execute
                    </button>
                  )}
                  {isExecuted && (
                    <span
                      className="shrink-0 px-3 py-1.5 rounded text-xs"
                      style={{ background: "#2FD07F22", color: "#2FD07F" }}
                    >
                      ✓ Executed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAlert?.action && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="rounded-xl p-6 max-w-sm w-full mx-4"
            style={{ background: "#121C2A", border: "1px solid #2F8CFF44" }}
          >
            <h4
              className="font-bold text-base mb-2"
              style={{ color: "#EAF0FF" }}
            >
              Confirm Leverage Action
            </h4>
            <p className="text-sm mb-4" style={{ color: "#A9B4C6" }}>
              Borrow{" "}
              <strong style={{ color: "#2F8CFF" }}>
                ₹{confirmAlert.action.borrow.toLocaleString("en-IN")}
              </strong>{" "}
              at{" "}
              <strong style={{ color: "#F5A623" }}>
                {confirmAlert.action.rate}%
              </strong>{" "}
              and invest in{" "}
              <strong style={{ color: "#2FD07F" }}>
                {confirmAlert.action.invest}
              </strong>
              ?
            </p>
            <div
              className="rounded p-3 text-xs mb-4"
              style={{ background: "#0F1724", color: "#F5A623" }}
            >
              ⚠ This is a simulation. No actual transactions will be executed.
              Please consult your broker.
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmAlert(null)}
                className="flex-1 py-2 rounded text-sm"
                style={{ background: "#1F2A3A", color: "#A9B4C6" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecute(confirmAlert.id)}
                className="flex-1 py-2 rounded text-sm font-semibold"
                style={{ background: "#2F8CFF", color: "white" }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
