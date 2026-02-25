import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight, ClipboardCopy, Download, Upload, Printer, Monitor, Unplug, Database, Info } from "lucide-react";
import { useAnalysis } from "@/lib/analysisContext";
import { countVectors } from "@/lib/saasApps";
import { getScoreBreakdown } from "@/lib/policyEngine";
import { ScoreBreakdownPanel, ScoreFormulaInfo } from "@/components/score-breakdown";
import type { AccessTier, UserTier, DeviceTrust } from "@shared/schema";

const vectorLabels = [
  { key: "clipboardPaste" as const, label: "Clipboard", icon: ClipboardCopy },
  { key: "fileDownload" as const, label: "Download", icon: Download },
  { key: "fileUpload" as const, label: "Upload", icon: Upload },
  { key: "printCapable" as const, label: "Print", icon: Printer },
  { key: "screenCapturable" as const, label: "Screen Capture", icon: Monitor },
  { key: "apiExport" as const, label: "API Export", icon: Unplug },
  { key: "bulkDataExport" as const, label: "Bulk Export", icon: Database },
];

const tierLabels: Record<AccessTier, string> = {
  native: "Native", secure_browser: "Secure Browser", full_daas: "Full DaaS",
};

const tierCellBg: Record<AccessTier, string> = {
  native: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  secure_browser: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  full_daas: "bg-red-500/12 text-red-700 dark:text-red-300",
};

export default function RiskHeatmap() {
  const { result } = useAnalysis();
  const [, navigate] = useLocation();
  const [filterTier, setFilterTier] = useState<string>("all");
  const [showFormula, setShowFormula] = useState(false);

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
    <div className="p-4 md:p-5 space-y-4 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Risk Heatmap</h1>
          <p className="text-muted-foreground text-[12px] mt-0.5">
            App-by-context risk assessment matrix showing recommended access tiers.
            <button
              className="ml-1.5 text-[hsl(36,100%,45%)] hover:underline inline-flex items-center gap-0.5"
              onClick={() => setShowFormula(f => !f)}
              data-testid="button-show-formula-heatmap"
            >
              <Info className="w-3 h-3" />
              {showFormula ? "Hide scoring method" : "How is scoring calculated?"}
            </button>
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/policies")} data-testid="button-view-policies" className="text-[12px] h-8">
          Policy Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>

      {showFormula && <ScoreFormulaInfo />}

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total Scenarios", value: totalDecisions, sub: `${selectedApps.length} apps x ${contextCombinations.length} contexts`, color: "" },
          { label: "Native Access", value: `${nativePct}%`, sub: `${riskSummary.nativeCount} scenarios ($0/mo)`, color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
          { label: "Secure Browser", value: `${sbPct}%`, sub: `${riskSummary.secureBrowserCount} scenarios ($7/mo)`, color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
          { label: "Full DaaS", value: `${daasPct}%`, sub: `${riskSummary.fullDaaSCount} scenarios ($35/mo)`, color: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
        ].map(item => (
          <div key={item.label} className="border rounded bg-card p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              {item.dot && <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />}
              {item.label}
            </div>
            <div className={`text-xl font-semibold font-mono ${item.color}`} data-testid={`text-${item.label.toLowerCase().replace(/\s/g, '-')}`}>{item.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-44 h-8 text-[12px]" data-testid="select-filter-tier">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="native">Native Only</SelectItem>
            <SelectItem value="secure_browser">Secure Browser Only</SelectItem>
            <SelectItem value="full_daas">Full DaaS Only</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/30" /> Native</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-500/30" /> Secure Browser</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/20 border border-red-500/30" /> Full DaaS</span>
        </div>
      </div>

      <div className="border rounded bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground sticky left-0 bg-muted/30 z-10 min-w-[180px] text-[11px] uppercase tracking-wider">Application</th>
                {contextCombinations.map(combo => (
                  <th key={combo.label} className="text-center px-2 py-2 font-medium text-muted-foreground min-w-[90px] text-[10px] uppercase tracking-wider">
                    <div className="capitalize">{combo.userTier}</div>
                    <div className="font-normal opacity-60">{combo.deviceTrust}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app, i) => (
                <tr key={app.id} className={`border-b last:border-0 ${i % 2 === 1 ? "bg-muted/15" : ""}`}>
                  <td className="px-3 py-2 sticky left-0 bg-card z-10">
                    <div className="font-medium text-[12px]">{app.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <span>{app.category}</span>
                      <span>|</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help underline decoration-dotted underline-offset-2">{countVectors(app.exfiltrationVectors)}/7 vectors</span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="w-52 p-0">
                          <div className="px-3 py-2 border-b text-[11px] font-medium">{app.name} - Vectors</div>
                          <div className="px-3 py-1.5 space-y-1">
                            {vectorLabels.map(v => {
                              const active = app.exfiltrationVectors[v.key];
                              return (
                                <div key={v.key} className={`flex items-center gap-2 text-[11px] ${active ? "" : "opacity-30"}`}>
                                  <v.icon className="w-3 h-3 shrink-0" />
                                  <span className="flex-1">{v.label}</span>
                                  <span className={`text-[10px] font-mono ${active ? "text-red-500" : "text-muted-foreground"}`}>{active ? "YES" : "NO"}</span>
                                </div>
                              );
                            })}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                  {contextCombinations.map(combo => {
                    const decision = getDecision(app.id, combo.userTier, combo.deviceTrust);
                    if (!decision) return <td key={combo.label} className="px-2 py-2 text-center text-muted-foreground">-</td>;
                    return (
                      <td key={combo.label} className="px-2 py-2 text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`inline-flex items-center justify-center w-8 h-6 rounded text-[10px] font-mono font-semibold cursor-help ${tierCellBg[decision.recommendation]}`}
                              data-testid={`cell-${app.id}-${combo.userTier}-${combo.deviceTrust}`}
                            >
                              {decision.riskScore}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[340px] text-[11px] p-0">
                            <div className="px-3 py-1.5 border-b font-medium">{tierLabels[decision.recommendation]} - ${decision.monthlyCostPerUser}/mo</div>
                            <div className="px-3 py-2 border-b text-muted-foreground">{decision.reason}</div>
                            <div className="px-3 py-2">
                              <ScoreBreakdownPanel
                                breakdown={getScoreBreakdown(
                                  app, combo.userTier, combo.deviceTrust, decision.locationRisk,
                                  result.organization.complianceFrameworks
                                )}
                                compact
                              />
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
      </div>
    </div>
  );
}
