import { CircleHelp } from "lucide-react";
import { useState } from "react";
import Alerts from "./components/Alerts";
import Dashboard from "./components/Dashboard";
import EstatePlanner from "./components/EstatePlanner";
import LeverageScenarios from "./components/LeverageScenarios";
import TaxImpact from "./components/TaxImpact";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0B1220", color: "#EAF0FF" }}
    >
      {/* Header */}
      <header
        style={{ background: "#0F1824", borderBottom: "1px solid #1F2A3A" }}
        className="px-6 py-3"
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "#2F8CFF", color: "white" }}
            >
              SL
            </div>
            <div>
              <div
                className="font-semibold text-sm tracking-wide"
                style={{ color: "#EAF0FF" }}
              >
                SMART LEVERAGE SIMULATOR
              </div>
              <div className="text-xs" style={{ color: "#7F8CA3" }}>
                Indian Market Edition
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="text-xs px-2 py-1 rounded"
              style={{ background: "#1F2A3A", color: "#F5A623" }}
            >
              ⚠ SEBI Regulated
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: "#2F8CFF" }}
            >
              RK
            </div>
            <div
              className="hidden sm:block text-sm"
              style={{ color: "#A9B4C6" }}
            >
              Ramesh K.
            </div>
          </div>
        </div>
      </header>

      {/* Nav */}
      <div
        style={{ background: "#111A27", borderBottom: "1px solid #1F2A3A" }}
        className="px-6"
      >
        <div className="max-w-[1400px] mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-10 gap-1 bg-transparent">
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "scenarios", label: "Leverage Scenarios" },
                { id: "tax", label: "Tax Impact" },
                { id: "estate", label: "Estate Planner" },
                { id: "alerts", label: "Alerts" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-xs px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2F8CFF] data-[state=active]:text-[#2F8CFF] data-[state=active]:bg-transparent"
                  style={{
                    color: activeTab === tab.id ? "#2F8CFF" : "#A9B4C6",
                  }}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="max-w-[1400px] mx-auto pb-8">
              <TabsContent value="dashboard">
                <Dashboard />
              </TabsContent>
              <TabsContent value="scenarios">
                <LeverageScenarios />
              </TabsContent>
              <TabsContent value="tax">
                <TaxImpact />
              </TabsContent>
              <TabsContent value="estate">
                <EstatePlanner />
              </TabsContent>
              <TabsContent value="alerts">
                <Alerts />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="px-6 py-4 mt-4"
        style={{ borderTop: "1px solid #1F2A3A", color: "#7F8CA3" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap gap-4 text-xs mb-2">
            {[
              "SEBI Regulations",
              "Disclaimers",
              "RBI Guidelines",
              "Privacy Policy",
              "Terms of Service",
            ].map((t) => (
              <span key={t} className="cursor-pointer hover:text-[#A9B4C6]">
                {t}
              </span>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#7F8CA3" }}>
            ⚠ This tool is for educational and simulation purposes only. Not
            financial advice. Leverage involves significant risk. Consult a
            SEBI-registered investment advisor. Loan Against Securities (LAS)
            governed by RBI Master Directions. © 2026 SmartLeverage India
          </p>
        </div>
      </footer>

      {/* Floating help */}
      <button
        type="button"
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-50"
        style={{ background: "#2F8CFF" }}
        title="Help"
      >
        <CircleHelp size={20} color="white" />
      </button>
    </div>
  );
}
