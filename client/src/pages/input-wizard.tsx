import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Users, ShieldCheck, AppWindow, Settings2, ArrowRight, ArrowLeft,
  Search, CheckCircle2, AlertTriangle, Zap, ChevronRight, Play
} from "lucide-react";
import { useAnalysis } from "@/lib/analysisContext";
import { saasApps, appCategories, countVectors } from "@/lib/saasApps";
import type {
  OrganizationProfile, AccessScenario, SaaSApp, Industry,
  ComplianceFramework, AppCategory
} from "@shared/schema";

const industries: Industry[] = ["Healthcare", "Finance", "Government", "Technology", "Education", "Retail", "Other"];
const complianceOptions: ComplianceFramework[] = ["SOC2", "HIPAA", "PCI-DSS", "FedRAMP", "GDPR"];

const demoScenarios = [
  {
    name: "Fintech Startup",
    description: "100-person fintech with high compliance needs",
    org: { name: "Acme Fintech", industry: "Finance" as Industry, workforceSize: 100, employeePercent: 70, contractorPercent: 20, vendorPercent: 10, complianceFrameworks: ["SOC2", "PCI-DSS"] as ComplianceFramework[] },
    scenario: { managedPercent: 60, unmanagedPercent: 30, byodPercent: 10, workModel: "hybrid" as const, highSecurityRoles: ["finance", "engineering"] },
    appIds: ["salesforce", "github", "slack", "google-workspace", "quickbooks", "stripe", "jira", "chatgpt", "okta", "datadog"],
  },
  {
    name: "Healthcare System",
    description: "5,000-person healthcare org with HIPAA requirements",
    org: { name: "Regional Health", industry: "Healthcare" as Industry, workforceSize: 5000, employeePercent: 60, contractorPercent: 25, vendorPercent: 15, complianceFrameworks: ["SOC2", "HIPAA"] as ComplianceFramework[] },
    scenario: { managedPercent: 40, unmanagedPercent: 40, byodPercent: 20, workModel: "hybrid" as const, highSecurityRoles: ["healthcare", "hr", "finance"] },
    appIds: ["epic-systems", "microsoft-365", "workday", "slack", "zoom", "box", "servicenow", "okta", "one-drive", "teams", "bamboohr", "chatgpt"],
  },
  {
    name: "Tech Company",
    description: "500-person tech company, mostly remote",
    org: { name: "CloudScale Inc", industry: "Technology" as Industry, workforceSize: 500, employeePercent: 80, contractorPercent: 15, vendorPercent: 5, complianceFrameworks: ["SOC2"] as ComplianceFramework[] },
    scenario: { managedPercent: 70, unmanagedPercent: 15, byodPercent: 15, workModel: "remote" as const, highSecurityRoles: ["engineering"] },
    appIds: ["github", "slack", "notion", "figma", "jira", "aws-console", "google-workspace", "linear", "datadog", "chatgpt", "github-copilot", "terraform-cloud", "vercel"],
  },
];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = ["Organization", "Applications", "Access Context", "Review & Analyze"];
  return (
    <div className="flex items-center gap-0 border-b -mx-6 -mt-2 px-0">
      {steps.map((label, i) => (
        <button
          key={label}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] border-b-2 transition-colors ${
            i === currentStep
              ? "border-[hsl(36,100%,50%)] text-foreground font-medium"
              : i < currentStep
              ? "border-transparent text-foreground/70"
              : "border-transparent text-muted-foreground"
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
            i < currentStep
              ? "bg-emerald-500/15 text-emerald-600"
              : i === currentStep
              ? "bg-[hsl(36,100%,50%)]/15 text-[hsl(36,100%,50%)]"
              : "bg-muted text-muted-foreground"
          }`}>
            {i < currentStep ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
          </span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

function OrgStep({
  org, setOrg
}: {
  org: OrganizationProfile;
  setOrg: (o: OrganizationProfile) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[12px] font-medium">Organization Name</Label>
          <Input
            id="org-name"
            data-testid="input-org-name"
            placeholder="Enter your organization name"
            value={org.name}
            onChange={(e) => setOrg({ ...org, name: e.target.value })}
            className="h-8 text-[13px]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px] font-medium">Industry</Label>
          <Select value={org.industry} onValueChange={(v) => setOrg({ ...org, industry: v as Industry })}>
            <SelectTrigger data-testid="select-industry" className="h-8 text-[13px]">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium">Total Workforce: <span className="font-mono text-foreground">{org.workforceSize.toLocaleString()}</span></Label>
        <Slider
          data-testid="slider-workforce"
          value={[org.workforceSize]}
          onValueChange={([v]) => setOrg({ ...org, workforceSize: v })}
          min={10} max={10000} step={10}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>10</span><span>10,000</span>
        </div>
      </div>
      <div className="space-y-3">
        <Label className="text-[12px] font-medium">Workforce Composition</Label>
        <div className="grid gap-2.5">
          {[
            { label: "Employees", key: "employeePercent" as const, value: org.employeePercent },
            { label: "Contractors", key: "contractorPercent" as const, value: org.contractorPercent },
            { label: "Vendors", key: "vendorPercent" as const, value: org.vendorPercent },
          ].map(item => (
            <div key={item.key} className="space-y-0.5">
              <div className="flex justify-between text-[12px]">
                <span>{item.label}</span>
                <span className="font-mono font-medium">{item.value}%</span>
              </div>
              <Slider
                data-testid={`slider-${item.key}`}
                value={[item.value]}
                onValueChange={([v]) => {
                  if (item.key === "employeePercent") {
                    const remaining = 100 - v;
                    const ratio = org.contractorPercent + org.vendorPercent > 0
                      ? remaining / (org.contractorPercent + org.vendorPercent) : 0;
                    setOrg({ ...org, employeePercent: v, contractorPercent: Math.round(org.contractorPercent * ratio), vendorPercent: Math.round(org.vendorPercent * ratio) });
                  } else if (item.key === "contractorPercent") {
                    const maxVal = 100 - org.employeePercent;
                    const clamped = Math.min(v, maxVal);
                    setOrg({ ...org, contractorPercent: clamped, vendorPercent: maxVal - clamped });
                  } else {
                    const maxVal = 100 - org.employeePercent;
                    const clamped = Math.min(v, maxVal);
                    setOrg({ ...org, vendorPercent: clamped, contractorPercent: maxVal - clamped });
                  }
                }}
                min={0} max={100} step={5}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[12px] font-medium">Compliance Frameworks</Label>
        <div className="flex flex-wrap gap-1.5">
          {complianceOptions.map(fw => {
            const isSelected = org.complianceFrameworks.includes(fw);
            return (
              <button
                key={fw}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
                  isSelected
                    ? "border-[hsl(36,100%,50%)] bg-[hsl(36,100%,50%)]/10 text-[hsl(36,100%,45%)]"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
                onClick={() => {
                  setOrg({
                    ...org,
                    complianceFrameworks: isSelected
                      ? org.complianceFrameworks.filter(f => f !== fw)
                      : [...org.complianceFrameworks, fw],
                  });
                }}
                data-testid={`badge-compliance-${fw}`}
              >
                {isSelected && <CheckCircle2 className="w-3 h-3" />}
                {fw}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AppSelectionStep({
  selected, setSelected
}: {
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    appCategories.forEach(cat => {
      counts[cat] = saasApps.filter(a => a.category === cat).length;
    });
    return counts;
  }, []);

  const filteredApps = useMemo(() => {
    return saasApps.filter(app => {
      const matchesSearch = !searchTerm || app.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "all" || app.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const toggleApp = (appId: string) => {
    const newSet = new Set(selected);
    if (newSet.has(appId)) newSet.delete(appId);
    else newSet.add(appId);
    setSelected(newSet);
  };

  const selectCategory = (category: AppCategory) => {
    const newSet = new Set(selected);
    const catApps = saasApps.filter(a => a.category === category);
    const allSelected = catApps.every(a => newSet.has(a.id));
    if (allSelected) catApps.forEach(a => newSet.delete(a.id));
    else catApps.forEach(a => newSet.add(a.id));
    setSelected(newSet);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            data-testid="input-app-search"
            className="pl-8 h-8 text-[13px]"
            placeholder="Filter applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-[12px] font-mono text-muted-foreground whitespace-nowrap">{selected.size} selected</span>
      </div>
      <div className="flex flex-wrap gap-1">
        <button
          className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${activeCategory === "all" ? "border-[hsl(36,100%,50%)] bg-[hsl(36,100%,50%)]/10 text-[hsl(36,100%,45%)] font-medium" : "border-border text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveCategory("all")}
        >
          All ({saasApps.length})
        </button>
        {appCategories.filter(cat => categoriesWithCounts[cat] > 0).map(cat => (
          <button
            key={cat}
            className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${activeCategory === cat ? "border-[hsl(36,100%,50%)] bg-[hsl(36,100%,50%)]/10 text-[hsl(36,100%,45%)] font-medium" : "border-border text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat} ({categoriesWithCounts[cat]})
          </button>
        ))}
      </div>
      {activeCategory !== "all" && (
        <button
          className="text-[11px] text-[hsl(36,100%,45%)] hover:underline"
          onClick={() => selectCategory(activeCategory as AppCategory)}
          data-testid="button-select-all-category"
        >
          Toggle all in {activeCategory}
        </button>
      )}
      <div className="border rounded overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] text-[11px] font-medium text-muted-foreground border-b bg-muted/30 px-3 py-1.5">
          <span className="w-6" />
          <span>Application</span>
          <span className="text-center w-20">Vectors</span>
          <span className="text-right w-24">Classification</span>
        </div>
        <div className="max-h-[350px] overflow-y-auto divide-y">
          {filteredApps.map(app => {
            const isSelected = selected.has(app.id);
            const vectors = countVectors(app.exfiltrationVectors);
            return (
              <div
                key={app.id}
                data-testid={`app-card-${app.id}`}
                className={`grid grid-cols-[auto_1fr_auto_auto] items-center px-3 py-2 cursor-pointer transition-colors text-[12px] ${
                  isSelected ? "bg-[hsl(36,100%,50%)]/5" : "hover:bg-muted/30"
                }`}
                onClick={() => toggleApp(app.id)}
              >
                <Checkbox checked={isSelected} className="pointer-events-none w-3.5 h-3.5" />
                <div className="ml-2 min-w-0">
                  <span className="font-medium">{app.name}</span>
                  <span className="text-muted-foreground ml-2 text-[10px]">{app.category}</span>
                </div>
                <span className={`text-center w-20 font-mono text-[11px] ${
                  vectors >= 6 ? "text-red-500" : vectors >= 4 ? "text-amber-500" : "text-emerald-500"
                }`}>
                  {vectors}/7
                </span>
                <span className="text-right w-24 text-[10px] text-muted-foreground">{app.dataClassification}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScenarioStep({
  scenario, setScenario
}: {
  scenario: AccessScenario;
  setScenario: (s: AccessScenario) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label className="text-[12px] font-medium">Device Trust Distribution</Label>
        <div className="grid gap-2.5">
          {[
            { label: "Managed", icon: ShieldCheck, color: "text-emerald-500", key: "managedPercent" as const, value: scenario.managedPercent },
            { label: "Unmanaged", icon: AlertTriangle, color: "text-amber-500", key: "unmanagedPercent" as const, value: scenario.unmanagedPercent },
            { label: "BYOD", icon: Zap, color: "text-blue-500", key: "byodPercent" as const, value: scenario.byodPercent },
          ].map(item => (
            <div key={item.key} className="space-y-0.5">
              <div className="flex justify-between text-[12px]">
                <span className="flex items-center gap-1">
                  <item.icon className={`w-3 h-3 ${item.color}`} /> {item.label}
                </span>
                <span className="font-mono font-medium">{item.value}%</span>
              </div>
              <Slider
                data-testid={`slider-${item.key.replace('Percent', '')}`}
                value={[item.value]}
                onValueChange={([v]) => {
                  if (item.key === "managedPercent") {
                    const remaining = 100 - v;
                    const ratio = scenario.unmanagedPercent + scenario.byodPercent > 0
                      ? remaining / (scenario.unmanagedPercent + scenario.byodPercent) : 0;
                    setScenario({ ...scenario, managedPercent: v, unmanagedPercent: Math.round(scenario.unmanagedPercent * ratio), byodPercent: Math.round(scenario.byodPercent * ratio) });
                  } else if (item.key === "unmanagedPercent") {
                    const maxVal = 100 - scenario.managedPercent;
                    const clamped = Math.min(v, maxVal);
                    setScenario({ ...scenario, unmanagedPercent: clamped, byodPercent: maxVal - clamped });
                  } else {
                    const maxVal = 100 - scenario.managedPercent;
                    const clamped = Math.min(v, maxVal);
                    setScenario({ ...scenario, byodPercent: clamped, unmanagedPercent: maxVal - clamped });
                  }
                }}
                min={0} max={100} step={5}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[12px] font-medium">Work Model</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["office", "hybrid", "remote"] as const).map(model => (
            <button
              key={model}
              data-testid={`option-workmodel-${model}`}
              className={`py-2 px-3 rounded border text-center transition-colors ${
                scenario.workModel === model
                  ? "border-[hsl(36,100%,50%)] bg-[hsl(36,100%,50%)]/10"
                  : "border-border hover:border-foreground/30"
              }`}
              onClick={() => setScenario({ ...scenario, workModel: model })}
            >
              <div className="text-[12px] font-medium capitalize">{model}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {model === "office" ? "On-site" : model === "hybrid" ? "Office & remote" : "Remote-first"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InputWizard() {
  const { analyze, setCurrentStep } = useAnalysis();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [org, setOrg] = useState<OrganizationProfile>({
    name: "", industry: "Technology", workforceSize: 500,
    employeePercent: 70, contractorPercent: 20, vendorPercent: 10,
    complianceFrameworks: ["SOC2"],
  });
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [scenario, setLocalScenario] = useState<AccessScenario>({
    managedPercent: 60, unmanagedPercent: 25, byodPercent: 15,
    workModel: "hybrid", highSecurityRoles: [],
  });

  const loadDemo = (demo: typeof demoScenarios[0]) => {
    setOrg(demo.org);
    setSelectedAppIds(new Set(demo.appIds));
    setLocalScenario(demo.scenario);
    setStep(3);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    const apps = saasApps.filter(a => selectedAppIds.has(a.id));

    setTimeout(() => {
      analyze(org, scenario, apps);
      setCurrentStep(1);
      setIsAnalyzing(false);
      navigate("/heatmap");
    }, 1200);
  };

  const canProceed = () => {
    if (step === 0) return org.name.length > 0;
    if (step === 1) return selectedAppIds.size > 0;
    if (step === 2) return true;
    return org.name.length > 0 && selectedAppIds.size > 0;
  };

  const selectedApps = saasApps.filter(a => selectedAppIds.has(a.id));

  return (
    <div className="p-4 md:p-5 max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Configure Assessment</h1>
        <p className="text-muted-foreground text-[12px] mt-0.5">
          Define your organization profile, select SaaS applications, and configure access context to generate recommendations.
        </p>
      </div>

      <div className="space-y-1">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Quick Start</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {demoScenarios.map(demo => (
            <button
              key={demo.name}
              className="text-left p-3 border rounded bg-card hover:border-[hsl(36,100%,50%)]/50 transition-colors group"
              onClick={() => loadDemo(demo)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium">{demo.name}</span>
                <Play className="w-3 h-3 text-muted-foreground group-hover:text-[hsl(36,100%,50%)] transition-colors" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{demo.description}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground font-mono">
                <span>{demo.appIds.length} apps</span>
                <span className="text-border">|</span>
                <span>{demo.org.workforceSize.toLocaleString()} users</span>
                <span className="text-border">|</span>
                <span>{demo.org.complianceFrameworks.join(", ")}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border rounded bg-card">
        <div className="px-6 pt-4">
          <StepIndicator currentStep={step} totalSteps={4} />
        </div>
        <div className="p-6 pt-5">
          {step === 0 && <OrgStep org={org} setOrg={setOrg} />}
          {step === 1 && <AppSelectionStep selected={selectedAppIds} setSelected={setSelectedAppIds} />}
          {step === 2 && <ScenarioStep scenario={scenario} setScenario={setLocalScenario} />}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-[12px] font-medium">Review Configuration</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border rounded p-3">
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" /> Organization
                  </div>
                  <div className="space-y-0.5 text-[12px]">
                    <div className="font-medium">{org.name || "Not set"}</div>
                    <div className="text-muted-foreground">{org.industry} | {org.workforceSize.toLocaleString()} users</div>
                    <div className="text-muted-foreground">{org.complianceFrameworks.join(", ") || "No frameworks"}</div>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    <AppWindow className="w-3.5 h-3.5" /> Applications
                  </div>
                  <div className="text-[12px]">
                    <div className="font-medium">{selectedAppIds.size} selected</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedApps.slice(0, 4).map(a => (
                        <span key={a.id} className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{a.name}</span>
                      ))}
                      {selectedApps.length > 4 && <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">+{selectedApps.length - 4}</span>}
                    </div>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    <Settings2 className="w-3.5 h-3.5" /> Access Context
                  </div>
                  <div className="space-y-0.5 text-[12px] text-muted-foreground">
                    <div>Managed {scenario.managedPercent}% | Unmanaged {scenario.unmanagedPercent}% | BYOD {scenario.byodPercent}%</div>
                    <div className="capitalize">Model: {scenario.workModel}</div>
                  </div>
                </div>
              </div>
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[12px]">
                    <div className="w-3.5 h-3.5 border-2 border-[hsl(36,100%,50%)] border-t-transparent rounded-full animate-spin" />
                    Analyzing {selectedAppIds.size} applications across {org.workforceSize.toLocaleString()} users...
                  </div>
                  <Progress value={75} className="h-1" />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-5 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={step === 0}
              onClick={() => setStep(s => s - 1)}
              data-testid="button-back"
              className="text-[12px] h-8"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Previous
            </Button>
            {step < 3 ? (
              <Button
                size="sm"
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
                data-testid="button-next"
                className="text-[12px] h-8"
              >
                Next <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!canProceed() || isAnalyzing}
                onClick={handleAnalyze}
                data-testid="button-analyze"
                className="text-[12px] h-8"
              >
                {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
