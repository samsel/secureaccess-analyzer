import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Users, ShieldCheck, AppWindow, Settings2, ArrowRight, ArrowLeft,
  Search, CheckCircle2, AlertTriangle, Zap, ChevronRight
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
  const steps = ["Organization", "Applications", "Access Context", "Review"];
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
            i < currentStep ? "bg-primary text-primary-foreground" :
            i === currentStep ? "bg-primary text-primary-foreground" :
            "bg-muted text-muted-foreground"
          }`}>
            {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-xs hidden sm:inline ${i === currentStep ? "font-medium" : "text-muted-foreground"}`}>
            {label}
          </span>
          {i < totalSteps - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
        </div>
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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-name">Organization Name</Label>
          <Input
            id="org-name"
            data-testid="input-org-name"
            placeholder="Enter your organization name"
            value={org.name}
            onChange={(e) => setOrg({ ...org, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <Select value={org.industry} onValueChange={(v) => setOrg({ ...org, industry: v as Industry })}>
            <SelectTrigger data-testid="select-industry">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Total Workforce Size: {org.workforceSize.toLocaleString()}</Label>
          <Slider
            data-testid="slider-workforce"
            value={[org.workforceSize]}
            onValueChange={([v]) => setOrg({ ...org, workforceSize: v })}
            min={10} max={10000} step={10}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10</span><span>10,000</span>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Label>Workforce Composition</Label>
        <div className="grid gap-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Employees</span><span className="font-medium">{org.employeePercent}%</span>
            </div>
            <Slider
              data-testid="slider-employees"
              value={[org.employeePercent]}
              onValueChange={([v]) => {
                const remaining = 100 - v;
                const ratio = org.contractorPercent + org.vendorPercent > 0
                  ? remaining / (org.contractorPercent + org.vendorPercent)
                  : 0;
                setOrg({
                  ...org,
                  employeePercent: v,
                  contractorPercent: Math.round(org.contractorPercent * ratio),
                  vendorPercent: Math.round(org.vendorPercent * ratio),
                });
              }}
              min={0} max={100} step={5}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Contractors</span><span className="font-medium">{org.contractorPercent}%</span>
            </div>
            <Slider
              data-testid="slider-contractors"
              value={[org.contractorPercent]}
              onValueChange={([v]) => {
                const maxVal = 100 - org.employeePercent;
                const clamped = Math.min(v, maxVal);
                setOrg({ ...org, contractorPercent: clamped, vendorPercent: maxVal - clamped });
              }}
              min={0} max={100} step={5}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Vendors/Partners</span><span className="font-medium">{org.vendorPercent}%</span>
            </div>
            <Slider
              data-testid="slider-vendors"
              value={[org.vendorPercent]}
              onValueChange={([v]) => {
                const maxVal = 100 - org.employeePercent;
                const clamped = Math.min(v, maxVal);
                setOrg({ ...org, vendorPercent: clamped, contractorPercent: maxVal - clamped });
              }}
              min={0} max={100} step={5}
            />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Label>Compliance Frameworks</Label>
        <div className="flex flex-wrap gap-2">
          {complianceOptions.map(fw => {
            const isSelected = org.complianceFrameworks.includes(fw);
            return (
              <Badge
                key={fw}
                variant={isSelected ? "default" : "secondary"}
                className="cursor-pointer select-none"
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
                {isSelected && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {fw}
              </Badge>
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

  const riskColor = (app: SaaSApp) => {
    const v = countVectors(app.exfiltrationVectors);
    if (v >= 6) return "text-red-500 dark:text-red-400";
    if (v >= 4) return "text-amber-500 dark:text-amber-400";
    return "text-emerald-500 dark:text-emerald-400";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-app-search"
            className="pl-9"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="secondary">{selected.size} selected</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge
          variant={activeCategory === "all" ? "default" : "secondary"}
          className="cursor-pointer select-none"
          onClick={() => setActiveCategory("all")}
        >
          All ({saasApps.length})
        </Badge>
        {appCategories.filter(cat => categoriesWithCounts[cat] > 0).map(cat => (
          <Badge
            key={cat}
            variant={activeCategory === cat ? "default" : "secondary"}
            className="cursor-pointer select-none"
            onClick={() => setActiveCategory(cat)}
          >
            {cat} ({categoriesWithCounts[cat]})
          </Badge>
        ))}
      </div>
      {activeCategory !== "all" && (
        <Button
          variant="outline" size="sm"
          onClick={() => selectCategory(activeCategory as AppCategory)}
          data-testid="button-select-all-category"
        >
          Toggle all in {activeCategory}
        </Button>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredApps.map(app => {
          const isSelected = selected.has(app.id);
          const vectors = countVectors(app.exfiltrationVectors);
          return (
            <div
              key={app.id}
              data-testid={`app-card-${app.id}`}
              className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
              onClick={() => toggleApp(app.id)}
            >
              <Checkbox checked={isSelected} className="pointer-events-none" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{app.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{app.category}</span>
                  <span className={`text-[10px] font-medium ${riskColor(app)}`}>
                    {vectors}/7 vectors
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {app.dataClassification}
              </Badge>
            </div>
          );
        })}
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
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Device Trust Distribution</Label>
        <div className="grid gap-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Managed</span>
              <span className="font-medium">{scenario.managedPercent}%</span>
            </div>
            <Slider
              data-testid="slider-managed"
              value={[scenario.managedPercent]}
              onValueChange={([v]) => {
                const remaining = 100 - v;
                const ratio = scenario.unmanagedPercent + scenario.byodPercent > 0
                  ? remaining / (scenario.unmanagedPercent + scenario.byodPercent) : 0;
                setScenario({
                  ...scenario,
                  managedPercent: v,
                  unmanagedPercent: Math.round(scenario.unmanagedPercent * ratio),
                  byodPercent: Math.round(scenario.byodPercent * ratio),
                });
              }}
              min={0} max={100} step={5}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Unmanaged</span>
              <span className="font-medium">{scenario.unmanagedPercent}%</span>
            </div>
            <Slider
              data-testid="slider-unmanaged"
              value={[scenario.unmanagedPercent]}
              onValueChange={([v]) => {
                const maxVal = 100 - scenario.managedPercent;
                const clamped = Math.min(v, maxVal);
                setScenario({ ...scenario, unmanagedPercent: clamped, byodPercent: maxVal - clamped });
              }}
              min={0} max={100} step={5}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-blue-500" /> BYOD</span>
              <span className="font-medium">{scenario.byodPercent}%</span>
            </div>
            <Slider
              data-testid="slider-byod"
              value={[scenario.byodPercent]}
              onValueChange={([v]) => {
                const maxVal = 100 - scenario.managedPercent;
                const clamped = Math.min(v, maxVal);
                setScenario({ ...scenario, byodPercent: clamped, unmanagedPercent: maxVal - clamped });
              }}
              min={0} max={100} step={5}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Work Model</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["office", "hybrid", "remote"] as const).map(model => (
            <div
              key={model}
              data-testid={`option-workmodel-${model}`}
              className={`p-3 rounded-md border text-center cursor-pointer transition-colors ${
                scenario.workModel === model
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
              onClick={() => setScenario({ ...scenario, workModel: model })}
            >
              <div className="text-sm font-medium capitalize">{model}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {model === "office" ? "Primarily on-site" : model === "hybrid" ? "Mix of office & remote" : "Primarily remote"}
              </div>
            </div>
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
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SecureAccess Analyzer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Evaluate your SaaS application landscape and get optimized AWS WorkSpaces access tier recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {demoScenarios.map(demo => (
          <Card key={demo.name} className="cursor-pointer hover-elevate" onClick={() => loadDemo(demo)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{demo.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{demo.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary" className="text-[10px]">{demo.appIds.length} apps</Badge>
                <Badge variant="secondary" className="text-[10px]">{demo.org.workforceSize.toLocaleString()} users</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <StepIndicator currentStep={step} totalSteps={4} />
        </CardHeader>
        <CardContent>
          {step === 0 && <OrgStep org={org} setOrg={setOrg} />}
          {step === 1 && <AppSelectionStep selected={selectedAppIds} setSelected={setSelectedAppIds} />}
          {step === 2 && <ScenarioStep scenario={scenario} setScenario={setLocalScenario} />}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">Review Your Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Organization</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>{org.name || "Not set"}</div>
                      <div>{org.industry} | {org.workforceSize.toLocaleString()} users</div>
                      <div>{org.complianceFrameworks.join(", ") || "None"}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AppWindow className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Applications</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>{selectedAppIds.size} apps selected</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedApps.slice(0, 5).map(a => (
                          <Badge key={a.id} variant="secondary" className="text-[10px]">{a.name}</Badge>
                        ))}
                        {selectedApps.length > 5 && <Badge variant="secondary" className="text-[10px]">+{selectedApps.length - 5} more</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Access Context</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Managed: {scenario.managedPercent}% | Unmanaged: {scenario.unmanagedPercent}% | BYOD: {scenario.byodPercent}%</div>
                      <div className="capitalize">Work model: {scenario.workModel}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Analyzing {selectedAppIds.size} applications across {org.workforceSize.toLocaleString()} users...
                  </div>
                  <Progress value={75} className="h-1" />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep(s => s - 1)}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
                data-testid="button-next"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                disabled={!canProceed() || isAnalyzing}
                onClick={handleAnalyze}
                data-testid="button-analyze"
              >
                {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
