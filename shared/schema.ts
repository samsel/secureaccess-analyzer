import { z } from "zod";

export interface ExfiltrationVectors {
  clipboardPaste: boolean;
  fileDownload: boolean;
  fileUpload: boolean;
  printCapable: boolean;
  screenCapturable: boolean;
  apiExport: boolean;
  bulkDataExport: boolean;
}

export type DataClassification = "public" | "internal" | "confidential" | "restricted";
export type AppCategory = "Productivity" | "CRM" | "Engineering" | "Finance" | "HR" | "Security" | "Design" | "Communication" | "Storage" | "Analytics" | "AI Tools" | "Marketing" | "Legal" | "Healthcare" | "DevOps";

export interface SaaSApp {
  id: string;
  name: string;
  category: AppCategory;
  exfiltrationVectors: ExfiltrationVectors;
  dataClassification: DataClassification;
  commonCompliance: string[];
  typicalUsers: string[];
  requiresLocalOS: boolean;
  browserOnly: boolean;
  notes: string;
}

export type UserTier = "employee" | "contractor" | "vendor" | "temp";
export type DeviceTrust = "managed" | "unmanaged" | "byod";
export type LocationRisk = "office" | "remote" | "highRiskGeo";
export type Industry = "Healthcare" | "Finance" | "Government" | "Technology" | "Education" | "Retail" | "Other";
export type ComplianceFramework = "SOC2" | "HIPAA" | "PCI-DSS" | "FedRAMP" | "GDPR";
export type AccessTier = "native" | "secure_browser" | "full_daas";

export interface OrganizationProfile {
  name: string;
  industry: Industry;
  workforceSize: number;
  employeePercent: number;
  contractorPercent: number;
  vendorPercent: number;
  complianceFrameworks: ComplianceFramework[];
}

export interface AccessScenario {
  managedPercent: number;
  unmanagedPercent: number;
  byodPercent: number;
  workModel: "office" | "hybrid" | "remote";
  highSecurityRoles: string[];
}

export interface DLPControls {
  clipboardBlocked: boolean;
  fileTransferBlocked: boolean;
  printBlocked: boolean;
  watermarkEnabled: boolean;
  urlFilteringEnabled: boolean;
}

export interface PolicyDecision {
  app: SaaSApp;
  userTier: UserTier;
  deviceTrust: DeviceTrust;
  locationRisk: LocationRisk;
  riskScore: number;
  recommendation: AccessTier;
  reason: string;
  dlpControls: DLPControls;
  monthlyCostPerUser: number;
  alternativeCost: number;
  annualSavingsPerUser: number;
  complianceGapsClosed: string[];
}

export interface AnalysisResult {
  organization: OrganizationProfile;
  scenario: AccessScenario;
  selectedApps: SaaSApp[];
  decisions: PolicyDecision[];
  totalAnnualCost: number;
  blanketVDICost: number;
  totalAnnualSavings: number;
  riskSummary: {
    nativeCount: number;
    secureBrowserCount: number;
    fullDaaSCount: number;
    totalExfiltrationVectors: number;
    complianceGapsClosed: number;
  };
}

export const organizationSchema = z.object({
  name: z.string().min(1),
  industry: z.enum(["Healthcare", "Finance", "Government", "Technology", "Education", "Retail", "Other"]),
  workforceSize: z.number().min(10).max(100000),
  employeePercent: z.number().min(0).max(100),
  contractorPercent: z.number().min(0).max(100),
  vendorPercent: z.number().min(0).max(100),
  complianceFrameworks: z.array(z.enum(["SOC2", "HIPAA", "PCI-DSS", "FedRAMP", "GDPR"])),
});
