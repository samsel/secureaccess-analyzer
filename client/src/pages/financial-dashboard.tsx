import { useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingDown, DollarSign, Users, Shield } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useAnalysis } from "@/lib/analysisContext";
import type { AccessTier } from "@shared/schema";

const CHART_COLORS = {
  native: "#16a34a",
  secure_browser: "#f59e0b",
  full_daas: "#dc2626",
  savings: "#16a34a",
  vdi: "#dc2626",
  optimized: "#ff9900",
};

export default function FinancialDashboard() {
  const { result } = useAnalysis();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!result) navigate("/");
  }, [result, navigate]);

  if (!result) return null;

  const { organization, decisions, totalAnnualCost, blanketVDICost, totalAnnualSavings, riskSummary } = result;

  const costByTier = useMemo(() => {
    const tiers: Record<AccessTier, { count: number; monthlyCost: number }> = {
      native: { count: 0, monthlyCost: 0 },
      secure_browser: { count: 0, monthlyCost: 0 },
      full_daas: { count: 0, monthlyCost: 0 },
    };
    decisions.forEach(d => {
      tiers[d.recommendation].count++;
      tiers[d.recommendation].monthlyCost += d.monthlyCostPerUser;
    });
    return [
      { name: "Native Access", tier: "native" as const, scenarios: tiers.native.count, costPerUser: 0, color: CHART_COLORS.native },
      { name: "Secure Browser", tier: "secure_browser" as const, scenarios: tiers.secure_browser.count, costPerUser: 7, color: CHART_COLORS.secure_browser },
      { name: "Full DaaS", tier: "full_daas" as const, scenarios: tiers.full_daas.count, costPerUser: 35, color: CHART_COLORS.full_daas },
    ];
  }, [decisions]);

  const comparisonData = useMemo(() => [
    { name: "Blanket VDI", cost: blanketVDICost, fill: CHART_COLORS.vdi },
    { name: "Optimized Mix", cost: totalAnnualCost, fill: CHART_COLORS.optimized },
  ], [blanketVDICost, totalAnnualCost]);

  const pieData = useMemo(() => {
    const total = decisions.length;
    return costByTier.map(t => ({
      name: t.name,
      value: t.scenarios,
      percentage: Math.round((t.scenarios / total) * 100),
      color: t.color,
    }));
  }, [costByTier, decisions]);

  const projectionData = useMemo(() => {
    const monthlySavings = totalAnnualSavings / 12;
    return Array.from({ length: 37 }, (_, i) => ({
      month: i,
      savings: Math.round(monthlySavings * i),
      vdiCost: Math.round((blanketVDICost / 12) * i),
      optimizedCost: Math.round((totalAnnualCost / 12) * i),
    }));
  }, [totalAnnualSavings, blanketVDICost, totalAnnualCost]);

  const savingsPercent = blanketVDICost > 0 ? Math.round((totalAnnualSavings / blanketVDICost) * 100) : 0;

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Financial Impact</h1>
          <p className="text-muted-foreground text-[12px] mt-0.5">
            Cost optimization: optimized WorkSpaces tier mix vs. blanket VDI deployment.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/blueprint")} data-testid="button-view-blueprint" className="text-[12px] h-8">
          Export Blueprint <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: TrendingDown, label: "Annual Savings", value: `$${totalAnnualSavings.toLocaleString()}`, sub: `${savingsPercent}% reduction vs. VDI`, color: "text-emerald-600 dark:text-emerald-400" },
          { icon: DollarSign, label: "Optimized Cost", value: `$${totalAnnualCost.toLocaleString()}`, sub: "Right-sized allocation", color: "" },
          { icon: Users, label: "Blanket VDI Cost", value: `$${blanketVDICost.toLocaleString()}`, sub: `${organization.workforceSize.toLocaleString()} users x $35/mo`, color: "text-red-600 dark:text-red-400" },
          { icon: Shield, label: "Compliance Gaps", value: riskSummary.complianceGapsClosed, sub: "Gaps addressed", color: "" },
        ].map(item => (
          <div key={item.label} className="border rounded bg-card p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              <item.icon className="w-3 h-3" /> {item.label}
            </div>
            <div className={`text-xl font-semibold font-mono ${item.color}`} data-testid={`text-${item.label.toLowerCase().replace(/\s/g, '-')}`}>{item.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="border rounded bg-card">
          <div className="px-4 py-2.5 border-b text-[12px] font-medium">Annual Cost Comparison</div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={comparisonData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Annual Cost"]}
                  contentStyle={{ fontSize: 11, borderRadius: 2 }}
                />
                <Bar dataKey="cost" radius={[2, 2, 0, 0]}>
                  {comparisonData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              Save ${totalAnnualSavings.toLocaleString()}/yr ({savingsPercent}%)
            </div>
          </div>
        </div>

        <div className="border rounded bg-card">
          <div className="px-4 py-2.5 border-b text-[12px] font-medium">Workforce Coverage by Tier</div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number, name: string) => [`${value} scenarios`, name]}
                  contentStyle={{ fontSize: 11, borderRadius: 2 }}
                />
                <Legend formatter={(value) => <span style={{ fontSize: 10 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-5 text-[10px] font-mono mt-1">
              {pieData.map(p => (
                <div key={p.name} className="text-center">
                  <div className="font-semibold">{p.percentage}%</div>
                  <div className="text-muted-foreground">{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded bg-card">
        <div className="px-4 py-2.5 border-b text-[12px] font-medium">Projected Cumulative Savings (36 Months)</div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                label={{ value: "Month", position: "insideBottom", offset: -5, style: { fontSize: 10 } }}
              />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === "vdiCost" ? "Blanket VDI" : name === "optimizedCost" ? "Optimized Mix" : "Cumulative Savings"
                ]}
                contentStyle={{ fontSize: 11, borderRadius: 2 }}
              />
              <Legend formatter={(value) => {
                const labels: Record<string, string> = { vdiCost: "Blanket VDI", optimizedCost: "Optimized Mix", savings: "Cumulative Savings" };
                return <span style={{ fontSize: 10 }}>{labels[value] || value}</span>;
              }} />
              <Line type="monotone" dataKey="vdiCost" stroke={CHART_COLORS.vdi} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="optimizedCost" stroke={CHART_COLORS.optimized} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="savings" stroke={CHART_COLORS.savings} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border rounded bg-card">
        <div className="px-4 py-2.5 border-b text-[12px] font-medium">Cost per User by Tier</div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={costByTier} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <RechartsTooltip
                formatter={(value: number) => [`$${value}/month per user`, "Cost"]}
                contentStyle={{ fontSize: 11, borderRadius: 2 }}
              />
              <Bar dataKey="costPerUser" radius={[0, 2, 2, 0]}>
                {costByTier.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
