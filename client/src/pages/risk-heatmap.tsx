import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Shield, Monitor, ArrowRight, Info } from "lucide-react";
import { useAnalysis } from "@/lib/analysisContext";
import { countVectors } from "@/lib/saasApps";
import type { AccessTier, UserTier, DeviceTrust } from "@shared/schema";

const tierColors: Record<AccessTier, string> = {
  native: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  secure_browser: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  full_daas: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
};

const tierLabels: Record<AccessTier, string> = {
  native: "Native", secure_browser: "Secure Browser", full_daas: "Full DaaS",
};

const tierCellBg: Record<AccessTier, string> = {
  native: "bg-emerald-500/15 dark:bg-emerald-500/20",
  secure_browser: "bg-amber-500/15 dark:bg-amber-500/20",
  full_daas: "bg-red-500/15 dark:bg-red-500/20",
};

export default function RiskHeatmap() {
  const { result } = useAnalysis();
  const [, navigate] = useLocation();
  const [filterTier, setFilterTier] = useState<string>("all");

  useEffect(() => {
    if (!result) navigate("/");
  }, [result, navigate]);

  if (!result) return null;

  const { decisions, selectedApps, riskSummary } = result;

  const userTiers = useMemo(() => [...new Set(decisions.map(d => d.userTier))], [decisions]);
  const deviceTrusts = useMemo(() => [...new Set(decisions.map(d => d.deviceTrust))], [decisions]);

  const contextCombinations = useMemo(() => {
    const combos: Array<{ userTier: UserTier; deviceTrust: DeviceTrust; label: string }> = [];
    userTiers.forEach(ut => {
      deviceTrusts.forEach(dt => {
        combos.push({ userTier: ut, deviceTrust: dt, label: `${ut}/${dt}` });
      });
    });
    return combos;
  }, [userTiers, deviceTrusts]);

  const getDecision = (appId: string, userTier: UserTier, deviceTrust: DeviceTrust) => {
    return decisions.find(d => d.app.id === appId && d.userTier === userTier && d.deviceTrust === deviceTrust);
  };

  const filteredApps = useMemo(() => {
    if (filterTier === "all") return selectedApps;
    return selectedApps.filter(app => {
      return decisions.some(d => d.app.id === app.id && d.recommendation === filterTier);
    });
  }, [selectedApps, decisions, filterTier]);

  const totalDecisions = decisions.length;
  const nativePct = Math.round((riskSummary.nativeCount / totalDecisions) * 100);
  const sbPct = Math.round((riskSummary.secureBrowserCount / totalDecisions) * 100);
  const daasPct = Math.round((riskSummary.fullDaaSCount / totalDecisions) * 100);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Risk Heatmap</h1>
          <p className="text-muted-foreground text-sm mt-1">
            App-by-context risk assessment matrix. Each cell shows the recommended access tier.
          </p>
        </div>
        <Button onClick={() => navigate("/policies")} data-testid="button-view-policies">
          View Policy Details <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Scenarios</div>
            <div className="text-2xl font-bold" data-testid="text-total-scenarios">{totalDecisions}</div>
            <div className="text-xs text-muted-foreground">{selectedApps.length} apps x {contextCombinations.length} contexts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Native Access
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-native-pct">{nativePct}%</div>
            <div className="text-xs text-muted-foreground">{riskSummary.nativeCount} scenarios ($0/mo)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" /> Secure Browser
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-sb-pct">{sbPct}%</div>
            <div className="text-xs text-muted-foreground">{riskSummary.secureBrowserCount} scenarios ($7/mo)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Full DaaS
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-daas-pct">{daasPct}%</div>
            <div className="text-xs text-muted-foreground">{riskSummary.fullDaaSCount} scenarios ($35/mo)</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-48" data-testid="select-filter-tier">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="native">Native Only</SelectItem>
            <SelectItem value="secure_browser">Secure Browser Only</SelectItem>
            <SelectItem value="full_daas">Full DaaS Only</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/30" /> Native</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/30" /> Secure Browser</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/30" /> Full DaaS</div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground sticky left-0 bg-card z-10 min-w-[180px]">Application</th>
                  {contextCombinations.map(combo => (
                    <th key={combo.label} className="text-center p-3 font-medium text-muted-foreground min-w-[100px]">
                      <div className="capitalize">{combo.userTier}</div>
                      <div className="font-normal text-[10px]">{combo.deviceTrust}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app, i) => (
                  <tr key={app.id} className={i % 2 === 0 ? "" : "bg-muted/30"}>
                    <td className="p-3 sticky left-0 bg-card z-10">
                      <div className="font-medium">{app.name}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        {app.category} | {countVectors(app.exfiltrationVectors)} vectors
                      </div>
                    </td>
                    {contextCombinations.map(combo => {
                      const decision = getDecision(app.id, combo.userTier, combo.deviceTrust);
                      if (!decision) return <td key={combo.label} className="p-2 text-center">-</td>;
                      return (
                        <td key={combo.label} className="p-2 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-medium ${tierCellBg[decision.recommendation]} cursor-help`}
                                data-testid={`cell-${app.id}-${combo.userTier}-${combo.deviceTrust}`}
                              >
                                {decision.riskScore}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px]">
                              <div className="space-y-1">
                                <div className="font-medium">{tierLabels[decision.recommendation]} - ${decision.monthlyCostPerUser}/mo</div>
                                <p className="text-xs">{decision.reason}</p>
                                {decision.dlpControls.clipboardBlocked && <Badge variant="secondary" className="text-[9px] mr-1">Clipboard Blocked</Badge>}
                                {decision.dlpControls.fileTransferBlocked && <Badge variant="secondary" className="text-[9px] mr-1">File Transfer Blocked</Badge>}
                                {decision.dlpControls.printBlocked && <Badge variant="secondary" className="text-[9px]">Print Blocked</Badge>}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
