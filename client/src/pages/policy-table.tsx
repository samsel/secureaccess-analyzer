import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowRight, Search, ArrowUpDown, ClipboardX, FileX, PrinterCheck,
  Droplets, Globe, ChevronDown, ChevronUp
} from "lucide-react";
import { useAnalysis } from "@/lib/analysisContext";
import type { AccessTier, PolicyDecision } from "@shared/schema";

const tierConfig: Record<AccessTier, { label: string; bg: string }> = {
  native: { label: "Native", bg: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  secure_browser: { label: "Secure Browser", bg: "bg-amber-500/12 text-amber-700 dark:text-amber-300" },
  full_daas: { label: "Full DaaS", bg: "bg-red-500/12 text-red-700 dark:text-red-300" },
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
    <span className="inline-flex ml-0.5">
      {sortField === field ? (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-20" />}
    </span>
  );

  const rowKey = (d: PolicyDecision) => `${d.app.id}-${d.userTier}-${d.deviceTrust}`;

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Access Policy Table</h1>
          <p className="text-muted-foreground text-[12px] mt-0.5">
            Detailed policy decisions with reasoning for every app and user context.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/financial")} data-testid="button-view-financial" className="text-[12px] h-8">
          Financial Impact <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            data-testid="input-policy-search"
            className="pl-8 w-48 h-8 text-[12px]"
            placeholder="Filter apps..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-36 h-8 text-[12px]" data-testid="select-policy-tier">
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
          <SelectTrigger className="w-32 h-8 text-[12px]" data-testid="select-policy-user">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {userTiers.map(ut => <SelectItem key={ut} value={ut} className="capitalize">{ut}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDevice} onValueChange={setFilterDevice}>
          <SelectTrigger className="w-32 h-8 text-[12px]" data-testid="select-policy-device">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            {deviceTrusts.map(dt => <SelectItem key={dt} value={dt} className="capitalize">{dt}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-[11px] font-mono text-muted-foreground">{filtered.length}/{decisions.length} policies</span>
      </div>

      <div className="border rounded bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider" onClick={() => toggleSort("app")}>
                  Application <SortIcon field="app" />
                </th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">User</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Device</th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider" onClick={() => toggleSort("riskScore")}>
                  Risk <SortIcon field="riskScore" />
                </th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider" onClick={() => toggleSort("tier")}>
                  Tier <SortIcon field="tier" />
                </th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">DLP</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider" onClick={() => toggleSort("cost")}>
                  $/mo <SortIcon field="cost" />
                </th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider" onClick={() => toggleSort("savings")}>
                  Save/yr <SortIcon field="savings" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const key = rowKey(d);
                const isExpanded = expandedRow === key;
                const tc = tierConfig[d.recommendation];
                return (
                  <tr
                    key={key}
                    className={`border-b last:border-0 cursor-pointer transition-colors ${isExpanded ? "bg-[hsl(36,100%,50%)]/5" : i % 2 === 1 ? "bg-muted/15" : ""}`}
                    onClick={() => setExpandedRow(isExpanded ? null : key)}
                    data-testid={`row-policy-${key}`}
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium">{d.app.name}</div>
                      <div className="text-[10px] text-muted-foreground">{d.app.category}</div>
                      {isExpanded && (
                        <div className="mt-2 p-2 rounded border bg-muted/20 text-[11px] space-y-1">
                          <div className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Reasoning</div>
                          <p className="text-muted-foreground leading-relaxed">{d.reason}</p>
                          {d.complianceGapsClosed.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Compliance:</span>
                              {d.complianceGapsClosed.map(g => <span key={g} className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{g}</span>)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize text-[12px]">{d.userTier}</td>
                    <td className="px-3 py-2 capitalize text-[12px]">{d.deviceTrust}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-mono font-semibold ${
                        d.riskScore >= 46 ? "bg-red-500/12 text-red-600 dark:text-red-400" :
                        d.riskScore >= 21 ? "bg-amber-500/12 text-amber-600 dark:text-amber-400" :
                        "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {d.riskScore}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${tc.bg}`}>{tc.label}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        {d.dlpControls.clipboardBlocked && (
                          <Tooltip><TooltipTrigger><ClipboardX className="w-3 h-3 text-amber-500" /></TooltipTrigger>
                          <TooltipContent>Clipboard blocked</TooltipContent></Tooltip>
                        )}
                        {d.dlpControls.fileTransferBlocked && (
                          <Tooltip><TooltipTrigger><FileX className="w-3 h-3 text-amber-500" /></TooltipTrigger>
                          <TooltipContent>File transfer blocked</TooltipContent></Tooltip>
                        )}
                        {d.dlpControls.printBlocked && (
                          <Tooltip><TooltipTrigger><PrinterCheck className="w-3 h-3 text-amber-500" /></TooltipTrigger>
                          <TooltipContent>Print blocked</TooltipContent></Tooltip>
                        )}
                        {d.dlpControls.watermarkEnabled && (
                          <Tooltip><TooltipTrigger><Droplets className="w-3 h-3 text-blue-500" /></TooltipTrigger>
                          <TooltipContent>Watermark enabled</TooltipContent></Tooltip>
                        )}
                        {d.dlpControls.urlFilteringEnabled && (
                          <Tooltip><TooltipTrigger><Globe className="w-3 h-3 text-blue-500" /></TooltipTrigger>
                          <TooltipContent>URL filtering</TooltipContent></Tooltip>
                        )}
                        {!d.dlpControls.clipboardBlocked && !d.dlpControls.fileTransferBlocked && !d.dlpControls.printBlocked && (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-medium">${d.monthlyCostPerUser}</td>
                    <td className="px-3 py-2 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      ${d.annualSavingsPerUser}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
