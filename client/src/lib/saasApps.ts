import type { SaaSApp } from "@shared/schema";

export const saasApps: SaaSApp[] = [
  {
    id: "google-workspace", name: "Google Workspace", category: "Productivity",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "internal", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: true,
    notes: "Full suite with Drive, Docs, Sheets. All exfiltration vectors active."
  },
  {
    id: "microsoft-365", name: "Microsoft 365", category: "Productivity",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "internal", commonCompliance: ["SOC2", "HIPAA", "GDPR"], typicalUsers: ["all"], requiresLocalOS: true, browserOnly: false,
    notes: "Desktop apps require local OS integration. Web versions available."
  },
  {
    id: "notion", name: "Notion", category: "Productivity",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["engineering", "management"], requiresLocalOS: false, browserOnly: true,
    notes: "Workspace export available. API access for integrations."
  },
  {
    id: "slack", name: "Slack", category: "Communication",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2", "HIPAA"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: false,
    notes: "File sharing and clipboard are primary exfiltration vectors."
  },
  {
    id: "salesforce", name: "Salesforce", category: "CRM",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA", "PCI-DSS"], typicalUsers: ["sales", "support", "management"], requiresLocalOS: false, browserOnly: true,
    notes: "Major exfiltration target. Supports bulk record export, report downloads, and API extraction."
  },
  {
    id: "hubspot", name: "HubSpot", category: "CRM",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "confidential", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["sales", "marketing"], requiresLocalOS: false, browserOnly: true,
    notes: "Contact and deal data exportable. API access available."
  },
  {
    id: "github", name: "GitHub", category: "Engineering",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2"], typicalUsers: ["engineering"], requiresLocalOS: false, browserOnly: false,
    notes: "Source code is highest-value IP. Bulk clone and API extraction available."
  },
  {
    id: "jira", name: "Jira", category: "Engineering",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["engineering", "management"], requiresLocalOS: false, browserOnly: true,
    notes: "Project data and issue tracking. CSV export available."
  },
  {
    id: "confluence", name: "Confluence", category: "Engineering",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["engineering", "management"], requiresLocalOS: false, browserOnly: true,
    notes: "Wiki content with space export capability."
  },
  {
    id: "aws-console", name: "AWS Console", category: "Engineering",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "HIPAA", "PCI-DSS", "FedRAMP"], typicalUsers: ["engineering", "devops"], requiresLocalOS: false, browserOnly: true,
    notes: "Ultimate sensitive app. Full infrastructure access."
  },
  {
    id: "quickbooks", name: "QuickBooks", category: "Finance",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "PCI-DSS"], typicalUsers: ["finance"], requiresLocalOS: false, browserOnly: true,
    notes: "Financial data with report export and print capabilities."
  },
  {
    id: "netsuite", name: "NetSuite", category: "Finance",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "PCI-DSS"], typicalUsers: ["finance", "management"], requiresLocalOS: false, browserOnly: true,
    notes: "Enterprise ERP. All exfiltration vectors active. Critical financial data."
  },
  {
    id: "expensify", name: "Expensify", category: "Finance",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: false, bulkDataExport: false },
    dataClassification: "confidential", commonCompliance: ["SOC2"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: true,
    notes: "Expense reports and receipt images. Download capability."
  },
  {
    id: "workday", name: "Workday", category: "HR",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "HIPAA", "GDPR"], typicalUsers: ["hr", "management"], requiresLocalOS: false, browserOnly: true,
    notes: "Contains PII, compensation, and benefits data. Report export available."
  },
  {
    id: "bamboohr", name: "BambooHR", category: "HR",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "restricted", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["hr"], requiresLocalOS: false, browserOnly: true,
    notes: "Employee PII and HR records. Report downloads available."
  },
  {
    id: "adp", name: "ADP", category: "HR",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "HIPAA"], typicalUsers: ["hr", "finance"], requiresLocalOS: false, browserOnly: true,
    notes: "Payroll and tax data. Highly sensitive."
  },
  {
    id: "chatgpt", name: "ChatGPT", category: "AI Tools",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "confidential", commonCompliance: ["SOC2"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: true,
    notes: "Unique risk: users paste company data INTO the AI. Data ingress is the primary concern."
  },
  {
    id: "claude-ai", name: "Claude", category: "AI Tools",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "confidential", commonCompliance: ["SOC2"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: true,
    notes: "Similar to ChatGPT. Data ingress risk via clipboard paste and file upload."
  },
  {
    id: "github-copilot", name: "GitHub Copilot", category: "AI Tools",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: false, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: false, bulkDataExport: false },
    dataClassification: "restricted", commonCompliance: ["SOC2"], typicalUsers: ["engineering"], requiresLocalOS: true, browserOnly: false,
    notes: "Proprietary code context sent to external service. Requires IDE integration."
  },
  {
    id: "midjourney", name: "Midjourney", category: "AI Tools",
    exfiltrationVectors: { clipboardPaste: false, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: false, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: [], typicalUsers: ["design", "marketing"], requiresLocalOS: false, browserOnly: true,
    notes: "Image generation. Lower risk for text data. Upload of company images possible."
  },
  {
    id: "okta", name: "Okta", category: "Security",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "FedRAMP"], typicalUsers: ["it", "security"], requiresLocalOS: false, browserOnly: true,
    notes: "Identity provider. User directory and access logs are highly sensitive."
  },
  {
    id: "crowdstrike", name: "CrowdStrike", category: "Security",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "FedRAMP"], typicalUsers: ["security"], requiresLocalOS: false, browserOnly: false,
    notes: "Endpoint security data. Threat intelligence and incident response."
  },
  {
    id: "splunk", name: "Splunk", category: "Security",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "HIPAA", "PCI-DSS"], typicalUsers: ["security", "engineering"], requiresLocalOS: false, browserOnly: true,
    notes: "SIEM platform. Contains security logs and incident data."
  },
  {
    id: "figma", name: "Figma", category: "Design",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["design", "engineering"], requiresLocalOS: false, browserOnly: true,
    notes: "Design files with export capability. Product IP in design files."
  },
  {
    id: "canva", name: "Canva", category: "Design",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: false, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: [], typicalUsers: ["marketing", "design"], requiresLocalOS: false, browserOnly: true,
    notes: "Design tool with file download and sharing."
  },
  {
    id: "adobe-cc", name: "Adobe Creative Cloud", category: "Design",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: false, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["design"], requiresLocalOS: true, browserOnly: false,
    notes: "Desktop applications require local OS. GPU acceleration beneficial."
  },
  {
    id: "zoom", name: "Zoom", category: "Communication",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: false, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2", "HIPAA"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: false,
    notes: "Video conferencing with recording and chat file sharing."
  },
  {
    id: "teams", name: "Microsoft Teams", category: "Communication",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2", "HIPAA", "GDPR"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: false,
    notes: "Integrated with M365. File sharing and chat export available."
  },
  {
    id: "dropbox", name: "Dropbox", category: "Storage",
    exfiltrationVectors: { clipboardPaste: false, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: false,
    notes: "Cloud storage. Bulk download and sync are primary exfiltration vectors."
  },
  {
    id: "box", name: "Box", category: "Storage",
    exfiltrationVectors: { clipboardPaste: false, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA", "FedRAMP"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: true,
    notes: "Enterprise file storage with governance controls. Bulk download available."
  },
  {
    id: "google-drive", name: "Google Drive", category: "Storage",
    exfiltrationVectors: { clipboardPaste: false, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: true,
    notes: "Cloud storage integrated with Google Workspace. Full download and sharing."
  },
  {
    id: "tableau", name: "Tableau", category: "Analytics",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2"], typicalUsers: ["analytics", "management"], requiresLocalOS: true, browserOnly: false,
    notes: "Data visualization. Desktop client needs local OS. Export to PDF/CSV."
  },
  {
    id: "power-bi", name: "Power BI", category: "Analytics",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA"], typicalUsers: ["analytics", "management"], requiresLocalOS: true, browserOnly: false,
    notes: "Microsoft BI tool. Desktop version requires local OS. Data export available."
  },
  {
    id: "looker", name: "Looker", category: "Analytics",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2"], typicalUsers: ["analytics", "management"], requiresLocalOS: false, browserOnly: true,
    notes: "Google Cloud BI. Dashboard export and scheduled reports."
  },
  {
    id: "stripe", name: "Stripe Dashboard", category: "Finance",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "PCI-DSS"], typicalUsers: ["finance", "engineering"], requiresLocalOS: false, browserOnly: true,
    notes: "Payment data. PCI-DSS scope. API keys and transaction data."
  },
  {
    id: "zendesk", name: "Zendesk", category: "CRM",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA"], typicalUsers: ["support"], requiresLocalOS: false, browserOnly: true,
    notes: "Customer support data. Ticket export and API access."
  },
  {
    id: "intercom", name: "Intercom", category: "CRM",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["support", "sales"], requiresLocalOS: false, browserOnly: true,
    notes: "Customer messaging platform. Conversation data export."
  },
  {
    id: "datadog", name: "Datadog", category: "DevOps",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA", "PCI-DSS"], typicalUsers: ["engineering", "devops"], requiresLocalOS: false, browserOnly: true,
    notes: "Infrastructure monitoring. Contains system architecture details."
  },
  {
    id: "pagerduty", name: "PagerDuty", category: "DevOps",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["engineering", "devops"], requiresLocalOS: false, browserOnly: true,
    notes: "Incident management. On-call schedules and incident data."
  },
  {
    id: "terraform-cloud", name: "Terraform Cloud", category: "DevOps",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "restricted", commonCompliance: ["SOC2"], typicalUsers: ["engineering", "devops"], requiresLocalOS: false, browserOnly: true,
    notes: "Infrastructure-as-code. Contains cloud credentials and architecture."
  },
  {
    id: "linear", name: "Linear", category: "Engineering",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["engineering", "management"], requiresLocalOS: false, browserOnly: true,
    notes: "Project management for engineering teams. Issue export available."
  },
  {
    id: "gitlab", name: "GitLab", category: "Engineering",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2"], typicalUsers: ["engineering"], requiresLocalOS: false, browserOnly: false,
    notes: "Source code and CI/CD pipelines. Full project export available."
  },
  {
    id: "docusign", name: "DocuSign", category: "Legal",
    exfiltrationVectors: { clipboardPaste: false, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA"], typicalUsers: ["legal", "hr", "sales"], requiresLocalOS: false, browserOnly: true,
    notes: "Contract and agreement documents. Download and bulk export."
  },
  {
    id: "one-drive", name: "OneDrive", category: "Storage",
    exfiltrationVectors: { clipboardPaste: false, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA", "GDPR"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: false,
    notes: "Microsoft cloud storage. Sync and bulk download available."
  },
  {
    id: "asana", name: "Asana", category: "Productivity",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["management", "all"], requiresLocalOS: false, browserOnly: true,
    notes: "Project management. Task and project export available."
  },
  {
    id: "monday", name: "Monday.com", category: "Productivity",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2", "HIPAA"], typicalUsers: ["management", "all"], requiresLocalOS: false, browserOnly: true,
    notes: "Work management platform. Board export and API access."
  },
  {
    id: "snowflake", name: "Snowflake", category: "Analytics",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "HIPAA", "PCI-DSS"], typicalUsers: ["engineering", "analytics"], requiresLocalOS: false, browserOnly: true,
    notes: "Data warehouse. Contains critical business data. Full SQL export."
  },
  {
    id: "gusto", name: "Gusto", category: "HR",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "restricted", commonCompliance: ["SOC2"], typicalUsers: ["hr", "finance"], requiresLocalOS: false, browserOnly: true,
    notes: "Payroll platform. SSN and compensation data."
  },
  {
    id: "mailchimp", name: "Mailchimp", category: "Marketing",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["marketing"], requiresLocalOS: false, browserOnly: true,
    notes: "Email marketing. Contact list export and campaign data."
  },
  {
    id: "marketo", name: "Marketo", category: "Marketing",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["marketing"], requiresLocalOS: false, browserOnly: true,
    notes: "Marketing automation. Lead database export available."
  },
  {
    id: "twilio", name: "Twilio Console", category: "Engineering",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA"], typicalUsers: ["engineering"], requiresLocalOS: false, browserOnly: true,
    notes: "Communication APIs. Contains API keys and call/message logs."
  },
  {
    id: "whatsapp-web", name: "WhatsApp Web", category: "Communication",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: false, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: [], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: true,
    notes: "Messaging app. File sharing and clipboard copy. Shadow IT risk."
  },
  {
    id: "trello", name: "Trello", category: "Productivity",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["management", "all"], requiresLocalOS: false, browserOnly: true,
    notes: "Board-based project management. JSON export available."
  },
  {
    id: "airtable", name: "Airtable", category: "Productivity",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: true,
    notes: "Spreadsheet-database hybrid. CSV export and API access."
  },
  {
    id: "1password", name: "1Password", category: "Security",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2"], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: false,
    notes: "Password manager. Vault export is critical exfiltration risk."
  },
  {
    id: "servicenow", name: "ServiceNow", category: "DevOps",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "HIPAA", "FedRAMP"], typicalUsers: ["it", "support"], requiresLocalOS: false, browserOnly: true,
    notes: "ITSM platform. Incident and CMDB data export."
  },
  {
    id: "sap", name: "SAP S/4HANA", category: "Finance",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["SOC2", "PCI-DSS", "GDPR"], typicalUsers: ["finance", "management"], requiresLocalOS: true, browserOnly: false,
    notes: "Enterprise ERP. All exfiltration vectors. Requires GUI client."
  },
  {
    id: "freshdesk", name: "Freshdesk", category: "CRM",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "confidential", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["support"], requiresLocalOS: false, browserOnly: true,
    notes: "Customer support. Ticket data and contact information."
  },
  {
    id: "grammarly", name: "Grammarly", category: "AI Tools",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: false, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: false, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: [], typicalUsers: ["all"], requiresLocalOS: false, browserOnly: true,
    notes: "Writing assistant. Text content sent to external servers for analysis."
  },
  {
    id: "epic-systems", name: "Epic Systems", category: "Healthcare",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["HIPAA", "SOC2"], typicalUsers: ["healthcare", "management"], requiresLocalOS: true, browserOnly: false,
    notes: "Electronic Health Records. ePHI data. HIPAA-critical."
  },
  {
    id: "cerner", name: "Cerner (Oracle Health)", category: "Healthcare",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "restricted", commonCompliance: ["HIPAA", "SOC2"], typicalUsers: ["healthcare"], requiresLocalOS: true, browserOnly: false,
    notes: "Clinical EHR platform. Contains patient records and ePHI."
  },
  {
    id: "vercel", name: "Vercel", category: "DevOps",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: false, screenCapturable: true, apiExport: true, bulkDataExport: false },
    dataClassification: "internal", commonCompliance: ["SOC2"], typicalUsers: ["engineering"], requiresLocalOS: false, browserOnly: true,
    notes: "Deployment platform. Environment variables and deployment logs."
  },
  {
    id: "shopify", name: "Shopify Admin", category: "Retail",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: true, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "PCI-DSS"], typicalUsers: ["management", "marketing"], requiresLocalOS: false, browserOnly: true,
    notes: "E-commerce admin. Customer data, orders, and payment info."
  },
  {
    id: "amplitude", name: "Amplitude", category: "Analytics",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["analytics", "engineering"], requiresLocalOS: false, browserOnly: true,
    notes: "Product analytics. User behavior data and cohort export."
  },
  {
    id: "mixpanel", name: "Mixpanel", category: "Analytics",
    exfiltrationVectors: { clipboardPaste: true, fileDownload: true, fileUpload: false, printCapable: true, screenCapturable: true, apiExport: true, bulkDataExport: true },
    dataClassification: "confidential", commonCompliance: ["SOC2", "GDPR"], typicalUsers: ["analytics", "engineering"], requiresLocalOS: false, browserOnly: true,
    notes: "Product analytics platform. Event data export via API."
  },
];

export const appCategories: AppCategory[] = [
  "Productivity", "CRM", "Engineering", "Finance", "HR", "Security",
  "Design", "Communication", "Storage", "Analytics", "AI Tools",
  "Marketing", "Legal", "Healthcare", "DevOps"
];

export function getAppsByCategory(category: AppCategory): SaaSApp[] {
  return saasApps.filter(app => app.category === category);
}

export function countVectors(vectors: ExfiltrationVectors): number {
  return Object.values(vectors).filter(Boolean).length;
}
