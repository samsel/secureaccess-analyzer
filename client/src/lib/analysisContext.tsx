import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type {
  OrganizationProfile, AccessScenario, SaaSApp, AnalysisResult
} from "@shared/schema";
import { runFullAnalysis } from "./policyEngine";

interface AnalysisState {
  organization: OrganizationProfile | null;
  scenario: AccessScenario | null;
  selectedApps: SaaSApp[];
  result: AnalysisResult | null;
  currentStep: number;
  analyze: (org: OrganizationProfile, scenario: AccessScenario, apps: SaaSApp[]) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const AnalysisContext = createContext<AnalysisState | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [scenario, setScenario] = useState<AccessScenario | null>(null);
  const [selectedApps, setSelectedApps] = useState<SaaSApp[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const analyze = useCallback((org: OrganizationProfile, sc: AccessScenario, apps: SaaSApp[]) => {
    setOrganization(org);
    setScenario(sc);
    setSelectedApps(apps);
    const analysisResult = runFullAnalysis(org, sc, apps);
    setResult(analysisResult);
  }, []);

  const reset = useCallback(() => {
    setOrganization(null);
    setScenario(null);
    setSelectedApps([]);
    setResult(null);
    setCurrentStep(0);
  }, []);

  return (
    <AnalysisContext.Provider
      value={{
        organization, scenario, selectedApps, result, currentStep,
        analyze, setCurrentStep, reset,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error("useAnalysis must be used within AnalysisProvider");
  return context;
}
