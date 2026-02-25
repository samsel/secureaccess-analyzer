import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowRight, Search, ArrowUpDown, ClipboardX, FileX, PrinterCheck,
  Droplets, Globe, ChevronDown, ChevronUp, Info
} from "lucide-react";
import { useAnalysis } from "@/lib/analysisContext";
import type { AccessTier, PolicyDecision } from "@shared/schema";

const tierBadge: Record<AccessTier, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  native: { label: "Native", variant: "secondary" },
  secure_browser: { label: "Secure Browser", variant: "default" },
  full_daas: { label: "Full DaaS", variant: "destructive" },
};

type SortField = "app" | "riskScore" | "tier" | "cost" | "savings";
type SortDir = "asc" | "desc";

export default function PolicyTable() {
  const { result } = useAnalysis();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("riskScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    if (!result) navigate("/");
  }, [result, navigate]);

  if (!result) return null;

  const { decisions } = result;

  const userTiers = useMemo(() => [...new Set(decisions.map(d => d.userTier))], [decisions]);
  const deviceTrusts = useMemo(() => [...new Set(decisions.map(d => d.deviceTrust))], [decisions]);

  const filtered = useMemo(() => {
    let items = [...decisions];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(d => d.app.name.toLowerCase().includes(term));
    }
    if (filterTier !== "all") items = items.filter(d => d.recommendation === filterTier);
    if (filterUser !== "all") items = items.filter(d => d.userTier === filterUser);
    if (filterDevice !== "all") items = items.filter(d => d.deviceTrust === filterDevice);

    const tierRank: Record<string, number> = { native: 0, secure_browser: 1, full_daas: 2 };
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "app": cmp = a.app.name.localeCompare(b.app.name); break;
        case "riskScore": cmp = a.riskScore - b.riskScore; break;
        case "tier": cmp = (tierRank[a.recommendation] ?? 0) - (tierRank[b.recommendation] ?? 0); break;
        case "cost": cmp = a.monthlyCostPerUser - b.monthlyCostPerUser; break;
        case "savings": cmp = a.annualSavingsPerUser - b.annualSavingsPerUser; break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return items;
  }, [decisions, searchTerm, filterTier, filterUser, filterDevice, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex ml-1">
      {sortField === field ? (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
    </span>
  );

  const rowKey = (d: PolicyDecision) => `${d.app.id}-${d.userTier}-${d.deviceTrust}`;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Access Policy Table</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Detailed policy decisions with full reasoning for every app and user context combination.
          </p>
        </div>
        <Button onClick={() => navigate("/financial")} data-testid="button-view-financial">
          View Financial Impact <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-policy-search"
            className="pl-9 w-56"
            placeholder="Search apps..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-40" data-testid="select-policy-tier">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="native">Native</SelectItem>
            <SelectItem value="secure_browser">Secure Browser</SelectItem>
            <SelectItem value="full_daas">Full DaaS</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-36" data-testid="select-policy-user">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {userTiers.map(ut => <SelectItem key={ut} value={ut} className="capitalize">{ut}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDevice} onValueChange={setFilterDevice}>
          <SelectTrigger className="w-36" data-testid="select-policy-device">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            {deviceTrusts.map(dt => <SelectItem key={dt} value={dt} className="capitalize">{dt}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} of {decisions.length} policies</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("app")}>
                    Application <SortIcon field="app" />
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">User Tier</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Device</th>
                  <th className="text-center p-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("riskScore")}>
                    Risk Score <SortIcon field="riskScore" />
                  </th>
                  <th className="text-center p-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("tier")}>
                    Recommendation <SortIcon field="tier" />
                  </th>
                  <th className="text-center p-3 font-medium text-muted-foreground">DLP Controls</th>
                  <th className="text-right p-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("cost")}>
                    Cost/mo <SortIcon field="cost" />
                  </th>
                  <th className="text-right p-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("savings")}>
                    Savings/yr <SortIcon field="savings" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => {
                  const key = rowKey(d);
                  const isExpanded = expandedRow === key;
                  const tb = tierBadge[d.recommendation];
                  return (
                    <tr
                      key={key}
                      className={`border-b last:border-0 cursor-pointer transition-colors ${isExpanded ? "bg-muted/40" : i % 2 === 0 ? "" : "bg-muted/20"}`}
                      onClick={() => setExpandedRow(isExpanded ? null : key)}
                      data-testid={`row-policy-${key}`}
                    >
                      <td className="p-3">
                        <div className="font-medium">{d.app.name}</div>
                        <div className="text-[10px] text-muted-foreground">{d.app.category}</div>
                        {isExpanded && (
                          <div className="mt-2 p-2 rounded-md bg-muted/50 text-[11px] space-y-1">
                            <div className="font-medium">Reasoning:</div>
                            <p className="text-muted-foreground">{d.reason}</p>
                            {d.complianceGapsClosed.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-muted-foreground">Compliance:</span>
                                {d.complianceGapsClosed.map(g => <Badge key={g} variant="secondary" className="text-[9px]">{g}</Badge>)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3 capitalize">{d.userTier}</td>
                      <td className="p-3 capitalize">{d.deviceTrust}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-6 rounded-md text-[11px] font-bold ${
                          d.riskScore >= 46 ? "bg-red-500/15 text-red-600 dark:text-red-400" :
                          d.riskScore >= 21 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {d.riskScore}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={tb.variant}>{tb.label}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          {d.dlpControls.clipboardBlocked && (
                            <Tooltip><TooltipTrigger><ClipboardX className="w-3.5 h-3.5 text-amber-500" /></TooltipTrigger>
                            <TooltipContent>Clipboard blocked</TooltipContent></Tooltip>
                          )}
                          {d.dlpControls.fileTransferBlocked && (
                            <Tooltip><TooltipTrigger><FileX className="w-3.5 h-3.5 text-amber-500" /></TooltipTrigger>
                            <TooltipContent>File transfer blocked</TooltipContent></Tooltip>
                          )}
                          {d.dlpControls.printBlocked && (
                            <Tooltip><TooltipTrigger><PrinterCheck className="w-3.5 h-3.5 text-amber-500" /></TooltipTrigger>
                            <TooltipContent>Print blocked</TooltipContent></Tooltip>
                          )}
                          {d.dlpControls.watermarkEnabled && (
                            <Tooltip><TooltipTrigger><Droplets className="w-3.5 h-3.5 text-blue-500" /></TooltipTrigger>
                            <TooltipContent>Watermark enabled</TooltipContent></Tooltip>
                          )}
                          {d.dlpControls.urlFilteringEnabled && (
                            <Tooltip><TooltipTrigger><Globe className="w-3.5 h-3.5 text-blue-500" /></TooltipTrigger>
                            <TooltipContent>URL filtering enabled</TooltipContent></Tooltip>
                          )}
                          {!d.dlpControls.clipboardBlocked && !d.dlpControls.fileTransferBlocked && !d.dlpControls.printBlocked && (
                            <span className="text-[10px] text-muted-foreground">None</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium">${d.monthlyCostPerUser}</td>
                      <td className="p-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        ${d.annualSavingsPerUser}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
