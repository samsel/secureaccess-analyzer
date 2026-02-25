import { Switch, Route } from "wouter";
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
  "--sidebar-width": "16rem",
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
                <header className="flex items-center gap-2 p-2 border-b shrink-0">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <span className="text-xs text-muted-foreground">SecureAccess Analyzer</span>
                </header>
                <main className="flex-1 overflow-y-auto">
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
