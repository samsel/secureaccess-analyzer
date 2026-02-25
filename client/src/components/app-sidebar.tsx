import { useLocation, Link } from "wouter";
import { Shield, LayoutDashboard, Grid3X3, Table, DollarSign, FileText, RotateCcw } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/lib/analysisContext";

const navItems = [
  { title: "Assessment", url: "/", icon: LayoutDashboard, requiresResult: false },
  { title: "Risk Heatmap", url: "/heatmap", icon: Grid3X3, requiresResult: true },
  { title: "Policy Table", url: "/policies", icon: Table, requiresResult: true },
  { title: "Financial Impact", url: "/financial", icon: DollarSign, requiresResult: true },
  { title: "Blueprint Export", url: "/blueprint", icon: FileText, requiresResult: true },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { result, reset } = useAnalysis();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">SecureAccess</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Analyzer</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                const isDisabled = item.requiresResult && !result;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isDisabled ? "opacity-40 pointer-events-none" : ""}
                    >
                      <Link href={isDisabled ? "#" : item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {isDisabled && <Badge variant="secondary" className="ml-auto text-[9px]">Locked</Badge>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {result && (
          <SidebarGroup>
            <SidebarGroupLabel>Analysis Summary</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 space-y-2 text-xs">
                <div className="flex justify-between gap-1">
                  <span className="text-muted-foreground">Apps analyzed</span>
                  <span className="font-medium">{result.selectedApps.length}</span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="text-muted-foreground">Decisions</span>
                  <span className="font-medium">{result.decisions.length}</span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="text-muted-foreground">Annual savings</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    ${(result.totalAnnualSavings).toLocaleString()}
                  </span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-3">
        {result && (
          <Button variant="outline" size="sm" className="w-full" onClick={reset} data-testid="button-reset">
            <RotateCcw className="w-3 h-3 mr-2" />
            New Assessment
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          All data stays in your browser.
          <br />Privacy by design.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
