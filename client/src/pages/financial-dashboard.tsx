import { useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  native: "hsl(152, 69%, 40%)",
  secure_browser: "hsl(38, 92%, 50%)",
  full_daas: "hsl(0, 72%, 51%)",
  savings: "hsl(152, 69%, 40%)",
  vdi: "hsl(0, 72%, 51%)",
  optimized: "hsl(221, 83%, 53%)",
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
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Impact</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cost optimization analysis: optimized WorkSpaces tier mix vs. blanket VDI deployment.
          </p>
        </div>
        <Button onClick={() => navigate("/blueprint")} data-testid="button-view-blueprint">
          Export Blueprint <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingDown className="w-3.5 h-3.5" /> Annual Savings
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-annual-savings">
              ${totalAnnualSavings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">{savingsPercent}% reduction vs. blanket VDI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="w-3.5 h-3.5" /> Optimized Annual Cost
            </div>
            <div className="text-2xl font-bold" data-testid="text-optimized-cost">
              ${totalAnnualCost.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Right-sized tier allocation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Users className="w-3.5 h-3.5" /> Blanket VDI Cost
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-vdi-cost">
              ${blanketVDICost.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">{organization.workforceSize.toLocaleString()} users x $35/mo</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Shield className="w-3.5 h-3.5" /> Compliance Gaps Closed
            </div>
            <div className="text-2xl font-bold" data-testid="text-compliance-gaps">
              {riskSummary.complianceGapsClosed}
            </div>
            <div className="text-xs text-muted-foreground">Security posture improvements</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Annual Cost Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparisonData} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Annual Cost"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <Badge variant="secondary" className="text-xs">
                Save ${totalAnnualSavings.toLocaleString()}/year ({savingsPercent}% reduction)
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workforce Coverage by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number, name: string) => [`${value} scenarios`, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs mt-1">
              {pieData.map(p => (
                <div key={p.name} className="text-center">
                  <div className="font-medium">{p.percentage}%</div>
                  <div className="text-muted-foreground">{p.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Projected Cumulative Savings (36 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                label={{ value: "Month", position: "insideBottom", offset: -5, style: { fontSize: 11 } }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <RechartsTooltip
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === "vdiCost" ? "Blanket VDI" : name === "optimizedCost" ? "Optimized Mix" : "Cumulative Savings"
                ]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend formatter={(value) => {
                const labels: Record<string, string> = { vdiCost: "Blanket VDI", optimizedCost: "Optimized Mix", savings: "Cumulative Savings" };
                return <span style={{ fontSize: 11 }}>{labels[value] || value}</span>;
              }} />
              <Line type="monotone" dataKey="vdiCost" stroke={CHART_COLORS.vdi} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="optimizedCost" stroke={CHART_COLORS.optimized} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="savings" stroke={CHART_COLORS.savings} strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cost per User by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={costByTier} layout="vertical" barSize={24}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <RechartsTooltip
                formatter={(value: number) => [`$${value}/month per user`, "Cost"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="costPerUser" radius={[0, 4, 4, 0]}>
                {costByTier.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
