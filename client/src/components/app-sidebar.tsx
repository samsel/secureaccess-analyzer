import { useLocation, Link } from "wouter";
import { Shield, LayoutDashboard, Grid3X3, Table, DollarSign, FileText, RotateCcw, Lock, ChevronRight } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
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
      <SidebarHeader className="p-0">
        <Link href="/">
          <div className="flex items-center gap-2.5 px-4 py-3 cursor-pointer border-b border-[hsl(var(--sidebar-border))]">
            <Shield className="w-5 h-5 text-[hsl(36,100%,50%)]" />
            <div className="leading-none">
              <span className="text-[13px] font-semibold text-white tracking-tight">SecureAccess</span>
              <span className="text-[11px] text-[hsl(var(--sidebar-foreground))] opacity-60 ml-1">Analyzer</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-medium opacity-50 px-4 py-2">Navigation</SidebarGroupLabel>
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
                      className={`${isDisabled ? "opacity-30 pointer-events-none" : ""} ${isActive ? "border-l-2 border-[hsl(36,100%,50%)]" : "border-l-2 border-transparent"}`}
                    >
                      <Link href={isDisabled ? "#" : item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="w-4 h-4" />
                        <span className="text-[13px]">{item.title}</span>
                        {isDisabled && <Lock className="w-3 h-3 ml-auto opacity-40" />}
                        {!isDisabled && isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
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
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-medium opacity-50 px-4 py-2">Summary</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-4 space-y-2.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="opacity-60">Apps</span>
                  <span className="font-mono font-medium">{result.selectedApps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Scenarios</span>
                  <span className="font-mono font-medium">{result.decisions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Annual savings</span>
                  <span className="font-mono font-medium text-emerald-400">
                    ${(result.totalAnnualSavings).toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-[hsl(var(--sidebar-border))] my-1" />
                <button
                  onClick={reset}
                  data-testid="button-reset"
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] py-1.5 px-2 rounded border border-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-accent))] transition-colors text-[hsl(var(--sidebar-foreground))] opacity-70 hover:opacity-100"
                >
                  <RotateCcw className="w-3 h-3" />
                  New Assessment
                </button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="px-4 py-3 border-t border-[hsl(var(--sidebar-border))]">
        <p className="text-[10px] opacity-40 leading-relaxed">
          All data stays in your browser. Privacy by design.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
