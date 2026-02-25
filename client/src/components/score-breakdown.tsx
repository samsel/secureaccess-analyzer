import { Info, AlertTriangle, ArrowRight } from "lucide-react";
import type { ScoreBreakdown } from "@/lib/policyEngine";

const tierThresholds = [
  { label: "Native ($0/mo)", min: 0, max: 20, color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
  { label: "Secure Browser ($7/mo)", min: 21, max: 45, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
  { label: "Full DaaS ($35/mo)", min: 46, max: 60, color: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
];

export function ScoreBreakdownPanel({ breakdown, compact }: { breakdown: ScoreBreakdown; compact?: boolean }) {
  const barMaxWidth = compact ? 60 : 80;

  return (
    <div className={`space-y-${compact ? "2" : "3"}`}>
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        <Info className="w-3 h-3" /> Score Breakdown
      </div>

      <div className="space-y-1.5">
        {breakdown.factors.map(f => {
          const pct = f.maxWeighted > 0 ? (f.weighted / f.maxWeighted) * 100 : 0;
          return (
            <div key={f.label} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-[11px]">
              <div className="min-w-0">
                <span className="font-medium">{f.label}</span>
                <span className="text-muted-foreground ml-1.5 capitalize">({f.rawValue})</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground w-16 justify-end">
                <span>{f.rawScore}</span>
                <span>×{f.weight}</span>
              </div>
              <div className={`w-[${barMaxWidth}px] h-1.5 bg-muted rounded-full overflow-hidden`} style={{ width: barMaxWidth }}>
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono font-semibold text-[11px] w-6 text-right">{f.weighted}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t text-[11px]">
        <span className="font-medium">Total Risk Score</span>
        <span className="font-mono font-semibold text-[13px]">
          <span className={
            breakdown.total >= 46 ? "text-red-600 dark:text-red-400" :
            breakdown.total >= 21 ? "text-amber-600 dark:text-amber-400" :
            "text-emerald-600 dark:text-emerald-400"
          }>{breakdown.total}</span>
          <span className="text-muted-foreground text-[10px]"> / {breakdown.maxTotal}</span>
        </span>
      </div>

      {!compact && (
        <div className="pt-1.5 border-t">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Tier Thresholds</div>
          <div className="flex items-center gap-0 h-2.5 rounded-full overflow-hidden">
            {tierThresholds.map(t => (
              <div
                key={t.label}
                className={`h-full ${t.color} ${t.min === 0 ? "opacity-40" : t.min === 21 ? "opacity-60" : "opacity-90"}`}
                style={{ width: `${((t.max - t.min + 1) / 61) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
            {tierThresholds.map(t => (
              <span key={t.label} className={breakdown.total >= t.min && breakdown.total <= t.max ? `font-medium ${t.textColor}` : ""}>
                {t.label}
              </span>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[10px]">
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span>Score <span className="font-mono font-semibold">{breakdown.total}</span></span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className={`font-medium ${
              breakdown.total >= 46 ? "text-red-600 dark:text-red-400" :
              breakdown.total >= 21 ? "text-amber-600 dark:text-amber-400" :
              "text-emerald-600 dark:text-emerald-400"
            }`}>
              {breakdown.total >= 46 ? "Full DaaS" : breakdown.total >= 21 ? "Secure Browser" : "Native Access"}
            </span>
          </div>
        </div>
      )}

      {breakdown.overrides.length > 0 && (
        <div className="pt-1.5 border-t">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Policy Overrides</div>
          <div className="space-y-0.5">
            {breakdown.overrides.map(o => (
              <div key={o} className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ScoreFormulaInfo() {
  return (
    <div className="border rounded bg-card">
      <div className="px-4 py-2.5 border-b text-[12px] font-medium flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-muted-foreground" />
        How Risk Scores Are Calculated
      </div>
      <div className="p-4 space-y-3">
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          Each app + user + device combination is scored using a weighted formula. Higher scores indicate greater data exfiltration risk and trigger stronger access controls.
        </p>
        <div className="border rounded overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 px-3 py-1.5 border-b">
            <span>Factor</span>
            <span className="w-28 text-center">Range</span>
            <span className="w-12 text-center">Weight</span>
            <span className="w-16 text-right">Max</span>
          </div>
          {[
            { factor: "Exfiltration Vectors", range: "0-7 active", weight: "×3", max: "21" },
            { factor: "Data Classification", range: "public(1)→restricted(4)", weight: "×4", max: "16" },
            { factor: "User Trust", range: "employee(1)→temp(4)", weight: "×3", max: "12" },
            { factor: "Device Trust", range: "managed(1)→unmanaged(3)", weight: "×3", max: "9" },
            { factor: "Location Risk", range: "office(1)→high-risk(3)", weight: "×2", max: "6" },
          ].map(row => (
            <div key={row.factor} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-3 py-1.5 border-b last:border-0 text-[11px]">
              <span className="font-medium">{row.factor}</span>
              <span className="w-28 text-center text-muted-foreground font-mono text-[10px]">{row.range}</span>
              <span className="w-12 text-center font-mono font-semibold">{row.weight}</span>
              <span className="w-16 text-right font-mono text-muted-foreground">{row.max}</span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-3 py-1.5 bg-muted/20 text-[11px] font-medium">
            <span>Total</span>
            <span className="w-28 text-center font-mono text-[10px] text-muted-foreground">5-64</span>
            <span className="w-12" />
            <span className="w-16 text-right font-mono">64</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tier Assignment</div>
          <div className="flex gap-2">
            {[
              { label: "Native ($0)", range: "< 21", color: "border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300" },
              { label: "Secure Browser ($7)", range: "21-45", color: "border-amber-500/30 bg-amber-500/8 text-amber-700 dark:text-amber-300" },
              { label: "Full DaaS ($35)", range: "≥ 46", color: "border-red-500/30 bg-red-500/8 text-red-700 dark:text-red-300" },
            ].map(t => (
              <div key={t.label} className={`flex-1 border rounded p-2 text-center ${t.color}`}>
                <div className="text-[11px] font-medium">{t.label}</div>
                <div className="text-[10px] font-mono mt-0.5">Score {t.range}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Policy Overrides</div>
          <ul className="text-[11px] text-muted-foreground space-y-0.5 list-disc list-inside">
            <li>Apps requiring local OS always get Full DaaS</li>
            <li>Restricted data classification always gets min Secure Browser</li>
            <li>Unmanaged devices always get min Secure Browser</li>
            <li>HIPAA/PCI-DSS/FedRAMP lowers the Secure Browser threshold to score ≥15</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
