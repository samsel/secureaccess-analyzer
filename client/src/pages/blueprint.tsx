import { useRef, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Printer, Shield, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAnalysis } from "@/lib/analysisContext";
import { countVectors } from "@/lib/saasApps";
import type { AccessTier } from "@shared/schema";

const tierLabels: Record<AccessTier, string> = {
  native: "Native Access", secure_browser: "Secure Browser ($7/mo)", full_daas: "Full DaaS ($35/mo)",
};

export default function Blueprint() {
  const { result } = useAnalysis();
  const [, navigate] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) navigate("/");
  }, [result, navigate]);

  if (!result) return null;

  const { organization, decisions, selectedApps, totalAnnualCost, blanketVDICost, totalAnnualSavings, riskSummary } = result;

  const handlePrint = () => { window.print(); };

  const topRiskApps = useMemo(() => {
    const appMaxRisk = new Map<string, number>();
    decisions.forEach(d => {
      const current = appMaxRisk.get(d.app.id) || 0;
      if (d.riskScore > current) appMaxRisk.set(d.app.id, d.riskScore);
    });
    return selectedApps
      .map(app => ({ app, maxRisk: appMaxRisk.get(app.id) || 0 }))
      .sort((a, b) => b.maxRisk - a.maxRisk)
      .slice(0, 10);
  }, [decisions, selectedApps]);

  const tierDistribution = useMemo(() => {
    const dist: Record<AccessTier, Set<string>> = { native: new Set(), secure_browser: new Set(), full_daas: new Set() };
    decisions.forEach(d => dist[d.recommendation].add(d.app.name));
    return dist;
  }, [decisions]);

  const uniqueCompliance = useMemo(() => {
    const all = new Set<string>();
    decisions.forEach(d => d.complianceGapsClosed.forEach(g => all.add(g)));
    return [...all];
  }, [decisions]);

  const savingsPercent = blanketVDICost > 0 ? Math.round((totalAnnualSavings / blanketVDICost) * 100) : 0;

  return (
    <div className="p-4 md:p-5 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Secure Access Blueprint</h1>
          <p className="text-muted-foreground text-[12px] mt-0.5">
            Exportable summary for your CISO. Print to generate a PDF.
          </p>
        </div>
        <Button size="sm" onClick={handlePrint} data-testid="button-print" className="text-[12px] h-8">
          <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / PDF
        </Button>
      </div>

      <div ref={printRef} className="space-y-0 print:space-y-0">
        <div className="border rounded bg-card">
          <div className="px-5 py-4 border-b flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[hsl(36,100%,50%)] flex items-center justify-center print:bg-orange-500">
              <Shield className="w-4 h-4 text-[hsl(214,40%,12%)]" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Secure Access Blueprint</h2>
              <p className="text-[11px] text-muted-foreground">{organization.name} | {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="px-5 py-4 border-b">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Executive Summary</div>
            <p className="text-[12px] leading-relaxed">
              {organization.name} uses <strong>{selectedApps.length} SaaS applications</strong> across
              a workforce of <strong>{organization.workforceSize.toLocaleString()} users</strong> ({organization.employeePercent}% employees,
              {organization.contractorPercent}% contractors, {organization.vendorPercent}% vendors).
              Analysis identified <strong>{riskSummary.totalExfiltrationVectors} exfiltration vectors</strong> across
              {decisions.length} access scenarios. Optimized WorkSpaces strategy yields <strong>${totalAnnualSavings.toLocaleString()}/year savings ({savingsPercent}% reduction)</strong> vs.
              blanket VDI, maintaining {organization.complianceFrameworks.join(", ")} compliance.
            </p>
          </div>

          <div className="px-5 py-4 border-b">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Risk Overview</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="border rounded p-3 text-center">
                <div className="text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">{riskSummary.nativeCount}</div>
                <div className="text-[11px] text-muted-foreground">Native Access</div>
                <div className="text-[10px] font-mono text-muted-foreground">$0/user/mo</div>
              </div>
              <div className="border rounded p-3 text-center">
                <div className="text-2xl font-semibold font-mono text-amber-600 dark:text-amber-400">{riskSummary.secureBrowserCount}</div>
                <div className="text-[11px] text-muted-foreground">Secure Browser</div>
                <div className="text-[10px] font-mono text-muted-foreground">$7/user/mo</div>
              </div>
              <div className="border rounded p-3 text-center">
                <div className="text-2xl font-semibold font-mono text-red-600 dark:text-red-400">{riskSummary.fullDaaSCount}</div>
                <div className="text-[11px] text-muted-foreground">Full DaaS</div>
                <div className="text-[10px] font-mono text-muted-foreground">$35/user/mo</div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-b">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Recommended Architecture</div>
            <div className="space-y-3">
              {[
                { icon: CheckCircle2, color: "text-emerald-500", label: "Native Access (No Intervention)", apps: tierDistribution.native, emptyMsg: "No apps qualified for native access" },
                { icon: AlertTriangle, color: "text-amber-500", label: "AWS Secure Browser ($7/mo per user)", apps: tierDistribution.secure_browser, emptyMsg: "" },
                { icon: Shield, color: "text-red-500", label: "AWS WorkSpaces DaaS ($35/mo per user)", apps: tierDistribution.full_daas, emptyMsg: "No apps required full DaaS" },
              ].map(tier => (
                <div key={tier.label}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <tier.icon className={`w-3.5 h-3.5 ${tier.color}`} />
                    <span className="text-[12px] font-medium">{tier.label}</span>
                  </div>
                  <div className="ml-5 flex flex-wrap gap-1">
                    {[...tier.apps].slice(0, 8).map(name => (
                      <span key={name} className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{name}</span>
                    ))}
                    {tier.apps.size > 8 && <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">+{tier.apps.size - 8} more</span>}
                    {tier.apps.size === 0 && tier.emptyMsg && <span className="text-[11px] text-muted-foreground">{tier.emptyMsg}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 border-b">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Cost Summary</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border rounded p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Blanket VDI</div>
                <div className="text-lg font-semibold font-mono text-red-600 dark:text-red-400">${blanketVDICost.toLocaleString()}/yr</div>
                <div className="text-[10px] font-mono text-muted-foreground">{organization.workforceSize.toLocaleString()} users x $35/mo x 12</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Optimized Mix</div>
                <div className="text-lg font-semibold font-mono text-emerald-600 dark:text-emerald-400">${totalAnnualCost.toLocaleString()}/yr</div>
                <div className="text-[10px] font-mono text-muted-foreground">Right-sized per app + context</div>
              </div>
            </div>
            <div className="mt-2 p-3 border rounded border-emerald-500/30 bg-emerald-500/5 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[14px] font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                  Annual Savings: ${totalAnnualSavings.toLocaleString()} ({savingsPercent}%)
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-b">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Top 10 Highest Risk Applications</div>
            <div className="border rounded overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 px-3 py-1.5 border-b">
                <span>Application</span>
                <span className="w-20 text-center">Vectors</span>
                <span className="w-16 text-right">Score</span>
              </div>
              {topRiskApps.map(({ app, maxRisk }) => (
                <div key={app.id} className="grid grid-cols-[1fr_auto_auto] items-center px-3 py-1.5 border-b last:border-0 text-[12px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{app.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{app.category}</span>
                  </div>
                  <span className="w-20 text-center font-mono text-[11px] text-muted-foreground">{countVectors(app.exfiltrationVectors)}/7</span>
                  <span className={`w-16 text-right font-mono font-semibold text-[11px] ${maxRisk >= 46 ? "text-red-500" : maxRisk >= 21 ? "text-amber-500" : "text-emerald-500"}`}>
                    {maxRisk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {uniqueCompliance.length > 0 && (
            <div className="px-5 py-4 border-b">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Compliance Gaps Addressed</div>
              <div className="flex flex-wrap gap-1.5">
                {uniqueCompliance.map(gap => (
                  <span key={gap} className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 py-4 border-b">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Recommended Next Steps</div>
            <ol className="space-y-1.5 text-[12px] list-decimal list-inside leading-relaxed">
              <li>
                <strong>Pilot Secure Browser</strong> with contractor population
                ({organization.contractorPercent}% of workforce) on highest-risk apps. Est. pilot: ${Math.round(organization.workforceSize * organization.contractorPercent / 100 * 7)}/mo.
              </li>
              <li>
                <strong>Extend to remote employees</strong> accessing confidential/restricted data.
                Enable DLP controls for clipboard, file transfer, and print.
              </li>
              <li>
                <strong>Evaluate Full DaaS</strong> for power users requiring local OS integration
                (CAD, IDE, analytics). Consider AutoStop pricing.
              </li>
              <li>
                <strong>Integrate with CASB</strong> to automate SaaS discovery and continuous policy updates.
              </li>
              <li>
                <strong>Schedule architecture review</strong> with AWS Solutions Architect for deployment,
                identity federation, and network connectivity.
              </li>
            </ol>
          </div>

          <div className="px-5 py-3 text-[10px] text-muted-foreground text-center space-y-0.5">
            <p>Generated by SecureAccess Analyzer | {new Date().toLocaleDateString()}</p>
            <p>Risk scores based on app capability analysis and organizational context. Validate with your security team.</p>
            <p>Pricing based on AWS published rates (US East). Actual costs may vary.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
