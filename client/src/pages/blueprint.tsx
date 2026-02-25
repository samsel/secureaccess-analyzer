import { useRef, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Shield, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
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

  const handlePrint = () => {
    window.print();
  };

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
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Secure Access Blueprint</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Exportable summary document for your CISO. Use the print button to generate a PDF.
          </p>
        </div>
        <Button onClick={handlePrint} data-testid="button-print">
          <Printer className="w-4 h-4 mr-2" /> Print / Export PDF
        </Button>
      </div>

      <div ref={printRef} className="space-y-6 print:space-y-4">
        <div className="border rounded-md p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center print:bg-blue-600">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Secure Access Blueprint</h2>
              <p className="text-sm text-muted-foreground">{organization.name} | Generated {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-2">Executive Summary</h3>
            <p className="text-sm leading-relaxed">
              {organization.name} uses <strong>{selectedApps.length} SaaS applications</strong> across
              a workforce of <strong>{organization.workforceSize.toLocaleString()} users</strong> ({organization.employeePercent}% employees,
              {organization.contractorPercent}% contractors, {organization.vendorPercent}% vendors).
              Our analysis identified <strong>{riskSummary.totalExfiltrationVectors} exfiltration vectors</strong> across
              {decisions.length} access scenarios. By implementing an optimized WorkSpaces access tier strategy,
              {organization.name} can <strong>save ${totalAnnualSavings.toLocaleString()}/year ({savingsPercent}% reduction)</strong> compared
              to blanket VDI deployment while maintaining compliance with {organization.complianceFrameworks.join(", ")} requirements.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-3">Risk Overview</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-md bg-emerald-500/10 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{riskSummary.nativeCount}</div>
                <div className="text-xs text-muted-foreground">Native Access</div>
                <div className="text-[10px] text-muted-foreground">$0/user/mo</div>
              </div>
              <div className="p-3 rounded-md bg-amber-500/10 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{riskSummary.secureBrowserCount}</div>
                <div className="text-xs text-muted-foreground">Secure Browser</div>
                <div className="text-[10px] text-muted-foreground">$7/user/mo</div>
              </div>
              <div className="p-3 rounded-md bg-red-500/10 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{riskSummary.fullDaaSCount}</div>
                <div className="text-xs text-muted-foreground">Full DaaS</div>
                <div className="text-[10px] text-muted-foreground">$35/user/mo</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-3">Recommended Architecture</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">Native Access (No Intervention)</span>
                </div>
                <div className="ml-6 flex flex-wrap gap-1">
                  {[...tierDistribution.native].slice(0, 8).map(name => (
                    <Badge key={name} variant="secondary" className="text-[10px]">{name}</Badge>
                  ))}
                  {tierDistribution.native.size > 8 && (
                    <Badge variant="secondary" className="text-[10px]">+{tierDistribution.native.size - 8} more</Badge>
                  )}
                  {tierDistribution.native.size === 0 && (
                    <span className="text-xs text-muted-foreground">No apps qualified for native access</span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">AWS Secure Browser ($7/mo per user)</span>
                </div>
                <div className="ml-6 flex flex-wrap gap-1">
                  {[...tierDistribution.secure_browser].slice(0, 8).map(name => (
                    <Badge key={name} variant="secondary" className="text-[10px]">{name}</Badge>
                  ))}
                  {tierDistribution.secure_browser.size > 8 && (
                    <Badge variant="secondary" className="text-[10px]">+{tierDistribution.secure_browser.size - 8} more</Badge>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">AWS WorkSpaces DaaS ($35/mo per user)</span>
                </div>
                <div className="ml-6 flex flex-wrap gap-1">
                  {[...tierDistribution.full_daas].slice(0, 8).map(name => (
                    <Badge key={name} variant="secondary" className="text-[10px]">{name}</Badge>
                  ))}
                  {tierDistribution.full_daas.size > 8 && (
                    <Badge variant="secondary" className="text-[10px]">+{tierDistribution.full_daas.size - 8} more</Badge>
                  )}
                  {tierDistribution.full_daas.size === 0 && (
                    <span className="text-xs text-muted-foreground">No apps required full DaaS</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-3">Cost Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Blanket VDI Deployment</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">${blanketVDICost.toLocaleString()}/yr</div>
                <div className="text-xs text-muted-foreground">{organization.workforceSize.toLocaleString()} users x $35/mo x 12</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Optimized WorkSpaces Mix</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${totalAnnualCost.toLocaleString()}/yr</div>
                <div className="text-xs text-muted-foreground">Right-sized per app + user context</div>
              </div>
            </div>
            <div className="mt-3 p-4 bg-emerald-500/10 rounded-md text-center">
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  Annual Savings: ${totalAnnualSavings.toLocaleString()} ({savingsPercent}%)
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-3">Top 10 Highest Risk Applications</h3>
            <div className="space-y-2">
              {topRiskApps.map(({ app, maxRisk }) => (
                <div key={app.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{app.name}</span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{app.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{countVectors(app.exfiltrationVectors)}/7 vectors</span>
                    <span className={`text-xs font-bold ${maxRisk >= 46 ? "text-red-500" : maxRisk >= 21 ? "text-amber-500" : "text-emerald-500"}`}>
                      Score: {maxRisk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {uniqueCompliance.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-base mb-3">Compliance Gaps Addressed</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueCompliance.map(gap => (
                    <Badge key={gap} variant="secondary">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-3">Recommended Next Steps</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>
                <strong>Pilot Secure Browser</strong> with your contractor population
                ({organization.contractorPercent}% of workforce) on highest-risk SaaS apps. Estimated pilot cost:
                ${Math.round(organization.workforceSize * organization.contractorPercent / 100 * 7)}/mo.
              </li>
              <li>
                <strong>Extend to remote employees</strong> accessing confidential or restricted data.
                Enable DLP controls for clipboard, file transfer, and print.
              </li>
              <li>
                <strong>Evaluate Full DaaS</strong> for power users requiring local OS integration
                (CAD, IDE, analytics desktop apps). Consider AutoStop pricing for part-time users.
              </li>
              <li>
                <strong>Integrate with existing CASB</strong> (if applicable) to automate SaaS discovery
                and continuous policy updates as new shadow IT apps are detected.
              </li>
              <li>
                <strong>Schedule architecture review</strong> with AWS Solutions Architect to finalize
                deployment plan, identity federation, and network connectivity requirements.
              </li>
            </ol>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Generated by SecureAccess Analyzer | {new Date().toLocaleDateString()}</p>
            <p>Risk scores are based on app capability analysis and organizational context. Validate with your security team before deployment.</p>
            <p>Pricing based on AWS published rates (US East). Actual costs may vary by region and usage pattern.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
