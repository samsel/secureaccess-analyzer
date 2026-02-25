import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AnalysisProvider } from "@/lib/analysisContext";
import InputWizard from "@/pages/input-wizard";
import RiskHeatmap from "@/pages/risk-heatmap";
import PolicyTable from "@/pages/policy-table";
import FinancialDashboard from "@/pages/financial-dashboard";
import Blueprint from "@/pages/blueprint";
import NotFound from "@/pages/not-found";
import { ChevronRight } from "lucide-react";

const breadcrumbMap: Record<string, string[]> = {
  "/": ["Assessment"],
  "/heatmap": ["Analysis", "Risk Heatmap"],
  "/policies": ["Analysis", "Policy Table"],
  "/financial": ["Analysis", "Financial Impact"],
  "/blueprint": ["Analysis", "Blueprint Export"],
};

function Breadcrumb() {
  const [location] = useLocation();
  const crumbs = breadcrumbMap[location] || ["Assessment"];
  return (
    <div className="flex items-center gap-1 text-[12px]">
      <span className="text-muted-foreground">SecureAccess</span>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className={i === crumbs.length - 1 ? "font-medium" : "text-muted-foreground"}>{crumb}</span>
        </span>
      ))}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={InputWizard} />
      <Route path="/heatmap" component={RiskHeatmap} />
      <Route path="/policies" component={PolicyTable} />
      <Route path="/financial" component={FinancialDashboard} />
      <Route path="/blueprint" component={Blueprint} />
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "15rem",
  "--sidebar-width-icon": "3rem",
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnalysisProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <header className="flex items-center gap-3 px-3 py-2 border-b bg-card shrink-0">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="w-px h-4 bg-border" />
                  <Breadcrumb />
                </header>
                <main className="flex-1 overflow-y-auto bg-background">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
        </AnalysisProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
