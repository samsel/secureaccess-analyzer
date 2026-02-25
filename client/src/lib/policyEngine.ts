import type {
  SaaSApp, AccessTier, PolicyDecision, DLPControls,
  UserTier, DeviceTrust, LocationRisk, ComplianceFramework,
  ExfiltrationVectors, AnalysisResult, OrganizationProfile, AccessScenario
} from "@shared/schema";
import { countVectors } from "./saasApps";

const DATA_CLASSIFICATION_SCORES: Record<string, number> = {
  public: 1, internal: 2, confidential: 3, restricted: 4
};

const USER_TIER_SCORES: Record<UserTier, number> = {
  employee: 1, contractor: 3, vendor: 3, temp: 4
};

const DEVICE_TRUST_SCORES: Record<DeviceTrust, number> = {
  managed: 1, unmanaged: 3, byod: 2
};

const LOCATION_RISK_SCORES: Record<LocationRisk, number> = {
  office: 1, remote: 2, highRiskGeo: 3
};

const TIER_COSTS: Record<AccessTier, number> = {
  native: 0, secure_browser: 7, full_daas: 35
};

const COMPLIANCE_GAPS: Record<string, string[]> = {
  SOC2: ["SOC2-CC6.7", "SOC2-CC6.8"],
  HIPAA: ["HIPAA-164.312(c)", "HIPAA-164.312(d)"],
  "PCI-DSS": ["PCI-DSS-3.4", "PCI-DSS-7.1"],
  FedRAMP: ["FedRAMP-AC-4", "FedRAMP-SC-7"],
  GDPR: ["GDPR-Art32", "GDPR-Art25"],
};

export function calculateRiskScore(
  app: SaaSApp,
  userTier: UserTier,
  deviceTrust: DeviceTrust,
  locationRisk: LocationRisk
): number {
  const vectorCount = countVectors(app.exfiltrationVectors);
  const dataScore = DATA_CLASSIFICATION_SCORES[app.dataClassification] || 2;
  const userScore = USER_TIER_SCORES[userTier];
  const deviceScore = DEVICE_TRUST_SCORES[deviceTrust];
  const locationScore = LOCATION_RISK_SCORES[locationRisk];

  return (vectorCount * 3) + (dataScore * 4) + (userScore * 3) + (deviceScore * 3) + (locationScore * 2);
}

export function determineAccessTier(
  riskScore: number,
  app: SaaSApp,
  deviceTrust: DeviceTrust,
  complianceFrameworks: ComplianceFramework[]
): AccessTier {
  if (app.requiresLocalOS) return "full_daas";

  if (app.dataClassification === "restricted") {
    if (riskScore >= 46) return "full_daas";
    return "secure_browser";
  }
  if (app.dataClassification === "confidential") {
    if (riskScore >= 46) return "full_daas";
    if (deviceTrust !== "managed") return "secure_browser";
  }
  if (deviceTrust === "unmanaged") {
    if (riskScore >= 46) return "full_daas";
    return "secure_browser";
  }
  const hasStrictCompliance = complianceFrameworks.some(fw =>
    ["HIPAA", "PCI-DSS", "FedRAMP"].includes(fw)
  );
  if (hasStrictCompliance) {
    if (riskScore >= 46) return "full_daas";
    if (riskScore >= 15) return "secure_browser";
  }
  if (complianceFrameworks.includes("SOC2") || complianceFrameworks.includes("GDPR")) {
    if (riskScore >= 46) return "full_daas";
    if (riskScore >= 21) return "secure_browser";
  }
  if (riskScore >= 46) return "full_daas";
  if (riskScore >= 21) return "secure_browser";
  return "native";
}

export function getDLPControls(tier: AccessTier, vectors: ExfiltrationVectors): DLPControls {
  if (tier === "native") {
    return { clipboardBlocked: false, fileTransferBlocked: false, printBlocked: false, watermarkEnabled: false, urlFilteringEnabled: false };
  }
  return {
    clipboardBlocked: vectors.clipboardPaste,
    fileTransferBlocked: vectors.fileDownload || vectors.fileUpload,
    printBlocked: vectors.printCapable,
    watermarkEnabled: tier === "secure_browser" || tier === "full_daas",
    urlFilteringEnabled: true,
  };
}

export function generateReason(
  app: SaaSApp, tier: AccessTier, riskScore: number,
  userTier: UserTier, deviceTrust: DeviceTrust
): string {
  const vectorCount = countVectors(app.exfiltrationVectors);
  if (tier === "native") {
    return `Low risk profile (score: ${riskScore}). ${app.name} on managed device with minimal exfiltration vectors. Native access is appropriate.`;
  }
  if (tier === "full_daas") {
    if (app.requiresLocalOS) {
      return `${app.name} requires local OS integration. Full WorkSpaces DaaS provides isolated desktop environment with all necessary controls.`;
    }
    return `High risk (score: ${riskScore}). ${vectorCount} active exfiltration vectors + ${app.dataClassification} data classification + ${deviceTrust} device. Full desktop isolation recommended.`;
  }
  const reasons: string[] = [];
  if (deviceTrust !== "managed") reasons.push(`${deviceTrust} device`);
  if (vectorCount >= 4) reasons.push(`${vectorCount} exfiltration vectors`);
  if (app.dataClassification === "confidential" || app.dataClassification === "restricted") {
    reasons.push(`${app.dataClassification} data`);
  }
  if (userTier !== "employee") reasons.push(`${userTier} access`);
  return `Medium-high risk (score: ${riskScore}). ${reasons.join(" + ")}. Secure Browser enforces clipboard/file/print DLP controls at $7/mo.`;
}

export function evaluatePolicy(
  app: SaaSApp,
  userTier: UserTier,
  deviceTrust: DeviceTrust,
  locationRisk: LocationRisk,
  complianceFrameworks: ComplianceFramework[]
): PolicyDecision {
  const riskScore = calculateRiskScore(app, userTier, deviceTrust, locationRisk);
  const recommendation = determineAccessTier(riskScore, app, deviceTrust, complianceFrameworks);
  const dlpControls = getDLPControls(recommendation, app.exfiltrationVectors);
  const reason = generateReason(app, recommendation, riskScore, userTier, deviceTrust);
  const monthlyCost = TIER_COSTS[recommendation];
  const alternativeCost = TIER_COSTS.full_daas;

  const complianceGapsClosed: string[] = [];
  if (recommendation !== "native") {
    complianceFrameworks.forEach(fw => {
      const gaps = COMPLIANCE_GAPS[fw];
      if (gaps) complianceGapsClosed.push(...gaps);
    });
  }

  return {
    app, userTier, deviceTrust, locationRisk,
    riskScore, recommendation, reason, dlpControls,
    monthlyCostPerUser: monthlyCost,
    alternativeCost,
    annualSavingsPerUser: (alternativeCost - monthlyCost) * 12,
    complianceGapsClosed: [...new Set(complianceGapsClosed)],
  };
}

export function runFullAnalysis(
  org: OrganizationProfile,
  scenario: AccessScenario,
  selectedApps: SaaSApp[]
): AnalysisResult {
  const decisions: PolicyDecision[] = [];
  const userTiers: UserTier[] = [];
  if (org.employeePercent > 0) userTiers.push("employee");
  if (org.contractorPercent > 0) userTiers.push("contractor");
  if (org.vendorPercent > 0) userTiers.push("vendor");
  if (userTiers.length === 0) userTiers.push("employee");

  const deviceTrusts: DeviceTrust[] = [];
  if (scenario.managedPercent > 0) deviceTrusts.push("managed");
  if (scenario.unmanagedPercent > 0) deviceTrusts.push("unmanaged");
  if (scenario.byodPercent > 0) deviceTrusts.push("byod");
  if (deviceTrusts.length === 0) deviceTrusts.push("managed");

  const locationRisk: LocationRisk = scenario.workModel === "office" ? "office" : scenario.workModel === "remote" ? "remote" : "remote";

  for (const app of selectedApps) {
    for (const ut of userTiers) {
      for (const dt of deviceTrusts) {
        const decision = evaluatePolicy(app, ut, dt, locationRisk, org.complianceFrameworks);
        decisions.push(decision);
      }
    }
  }

  const totalUsers = org.workforceSize;
  const userTierDistribution: Record<UserTier, number> = {
    employee: Math.round(totalUsers * org.employeePercent / 100),
    contractor: Math.round(totalUsers * org.contractorPercent / 100),
    vendor: Math.round(totalUsers * org.vendorPercent / 100),
    temp: 0,
  };
  const deviceDistribution: Record<DeviceTrust, number> = {
    managed: Math.round(totalUsers * scenario.managedPercent / 100),
    unmanaged: Math.round(totalUsers * scenario.unmanagedPercent / 100),
    byod: Math.round(totalUsers * scenario.byodPercent / 100),
  };

  let totalAnnualCost = 0;
  let blanketVDICost = 0;
  let nativeCount = 0;
  let secureBrowserCount = 0;
  let fullDaaSCount = 0;
  const allComplianceGaps = new Set<string>();
  let totalExfiltrationVectors = 0;

  for (const d of decisions) {
    const userCount = userTierDistribution[d.userTier] || 0;
    const deviceRatio = (deviceDistribution[d.deviceTrust] || 0) / totalUsers;
    const effectiveUsers = Math.round(userCount * deviceRatio);

    totalAnnualCost += d.monthlyCostPerUser * effectiveUsers * 12;
    blanketVDICost += TIER_COSTS.full_daas * effectiveUsers * 12;

    if (d.recommendation === "native") nativeCount++;
    else if (d.recommendation === "secure_browser") secureBrowserCount++;
    else fullDaaSCount++;

    d.complianceGapsClosed.forEach(g => allComplianceGaps.add(g));
    totalExfiltrationVectors += countVectors(d.app.exfiltrationVectors);
  }

  return {
    organization: org,
    scenario,
    selectedApps,
    decisions,
    totalAnnualCost,
    blanketVDICost,
    totalAnnualSavings: blanketVDICost - totalAnnualCost,
    riskSummary: {
      nativeCount, secureBrowserCount, fullDaaSCount,
      totalExfiltrationVectors,
      complianceGapsClosed: allComplianceGaps.size,
    },
  };
}
