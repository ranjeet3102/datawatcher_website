import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'

const examples = [
  {
    id: 'titanic',
    title: 'Titanic Survival Dataset',
    domain: 'No domain',
    tag: 'Classification',
    desc: 'Classic Kaggle dataset. Demonstrates missing value, class imbalance, and cardinality audits.',
    code: `import datawatcher

results = datawatcher.audit_csv(
    "titanic_train.csv",
    target="Survived"
)

ml = results["ml_readiness"]
print(f"Score: {ml['score']}/100 — {ml['grade']}")
# Score: 79/100 — GOOD

risk = results["risk_summary"]
print("Top risks:", risk["top_risks"])
# Top risks: ['missing_value_audit', 'class_imbalance_audit']

# Check individual audits
for r in results["audit_results"]:
    if not r.passed:
        print(f"  ❌ {r.audit_name}: {r.severity}")
        print(f"     {r.findings}")
`,
  },
  {
    id: 'healthcare',
    title: 'Patient Readmission',
    domain: 'healthcare',
    tag: 'Healthcare',
    desc: 'Clinical dataset with domain plugin activated for medical-specific checks.',
    code: `import datawatcher

results = datawatcher.audit_csv(
    "patients.csv",
    target="readmitted",
    domain="healthcare"
)

# Domain-specific results
domain_audits = [
    r for r in results["audit_results"]
    if r.category == "healthcare"
]

for r in domain_audits:
    status = "✅" if r.passed else "❌"
    print(f"{status} {r.audit_name}: {r.severity}")

# Example output:
# ✅ age_range_audit: INFO
# ✅ bmi_range_audit: INFO
# ❌ missing_diagnosis_audit: HIGH
# ✅ blood_pressure_audit: INFO
# ✅ heart_rate_audit: INFO
`,
  },
  {
    id: 'finance',
    title: 'Loan Default Prediction',
    domain: 'finance',
    tag: 'Finance',
    desc: 'Finance dataset with leakage detection, negative value, and currency checks.',
    code: `import datawatcher

results = datawatcher.audit_csv(
    "loans.csv",
    target="default",
    domain="finance"
)

# Check for data leakage
leakage = next(
    r for r in results["audit_results"]
    if r.audit_name == "leakage_audit"
)

if not leakage.passed:
    print("⚠️  Leakage detected!")
    print("Suspicious features:", leakage.findings)

# Export full HTML report
import datawatcher
from datawatcher.reports.reporting.html_reporter import export_html_report
from datawatcher.scoring.readiness_scorer import calculate_ml_readiness_score
from datawatcher.scoring.risk_summary import generate_risk_summary

readiness = calculate_ml_readiness_score(results["audit_results"])
risk = generate_risk_summary(results["audit_results"])
export_html_report(results["audit_results"], readiness, risk, "loans_report.html")
`,
  },
  {
    id: 'dataframe',
    title: 'In-Memory DataFrame',
    domain: 'No domain',
    tag: 'Python API',
    desc: 'Audit a DataFrame built in code — no CSV file needed.',
    code: `import pandas as pd
import numpy as np
import datawatcher

# Build a dataset programmatically
df = pd.DataFrame({
    "user_id":    range(1000),
    "age":        np.random.randint(18, 80, 1000),
    "income":     np.random.normal(55000, 15000, 1000),
    "churn":      np.random.choice([0, 1], 1000, p=[0.85, 0.15]),
    "city":       np.random.choice(["NYC", "LA", "CHI"], 1000),
})

# Introduce some issues
df.loc[:50, "income"] = np.nan   # missing values
df.loc[900:, "income"] = 1e10   # invalid extremes

results = datawatcher.audit_dataframe(df, target="churn")

print(results["semantic_types"])
# {'user_id': 'identifier', 'age': 'numeric', ...}

print(results["ml_readiness"])
# {'score': 71, 'grade': 'FAIR', ...}
`,
  },
  {
    id: 'custom',
    title: 'Custom Audit Extension',
    domain: 'No domain',
    tag: 'Advanced',
    desc: 'Build and plug in your own audit logic with BaseAudit.',
    code: `from datawatcher import (
    BaseAudit, AuditResult, AuditRegistry, AuditEngine
)
from datawatcher.loaders.factory import load_dataset
import pandas as pd


class EmailFormatAudit(BaseAudit):
    """Check that email columns contain valid-looking email addresses."""

    audit_name = "email_format_audit"
    category = "custom"

    def run(self, dataset, context=None):
        df = dataset.df
        email_cols = [c for c in df.columns if "email" in c.lower()]
        invalid = {}

        for col in email_cols:
            mask = df[col].dropna().str.contains(
                r"^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", regex=True
            )
            bad = (~mask).sum()
            if bad > 0:
                invalid[col] = int(bad)

        passed = len(invalid) == 0
        return AuditResult(
            audit_name=self.audit_name,
            category=self.category,
            passed=passed,
            severity="MEDIUM" if invalid else "INFO",
            findings={"invalid_email_counts": invalid},
            recommendations=(
                ["Fix malformed email addresses before training."]
                if invalid else []
            ),
        )


# Plug in alongside core audits
registry = AuditRegistry()
registry.register(EmailFormatAudit())

dataset = load_dataset("users.csv")
engine = AuditEngine(registry)
results = engine.run(dataset, context={"target": "subscribed"})
`,
  },
]

const tagColors = {
  'Classification': { bg: 'rgba(99,102,241,0.12)', color: 'var(--accent-light)' },
  'Healthcare':     { bg: 'rgba(244,63,94,0.12)',  color: 'var(--rose)' },
  'Finance':        { bg: 'rgba(245,158,11,0.12)', color: 'var(--amber)' },
  'Python API':     { bg: 'rgba(20,184,166,0.12)', color: 'var(--teal)' },
  'Advanced':       { bg: 'rgba(251,191,36,0.12)', color: 'var(--sev-medium)' },
}

export default function Examples() {
  const [selected, setSelected] = useState(examples[0].id)

  const ex = examples.find(e => e.id === selected)

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '60px 0 48px',
      }}>
        <div className="container">
          <div className="section-label">💡 Examples</div>
          <h1 className="section-title">
            Real-world <span className="gradient-text">examples</span>
          </h1>
          <p className="section-subtitle">
            Copy-paste ready examples for common use cases — from quick audits to
            custom audit extensions.
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, padding: '48px 24px', alignItems: 'start' }}>
        {/* Example list */}
        <div style={{ position: 'sticky', top: 90 }}>
          {examples.map(e => {
            const tc = tagColors[e.tag] || {}
            return (
              <div
                key={e.id}
                onClick={() => setSelected(e.id)}
                style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  marginBottom: 8,
                  background: selected === e.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                  border: `1px solid ${selected === e.id ? 'var(--border-accent)' : 'transparent'}`,
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                    background: tc.bg, color: tc.color, flexShrink: 0, marginLeft: 8
                  }}>{e.tag}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.desc}</div>
              </div>
            )
          })}
        </div>

        {/* Code view */}
        {ex && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>{ex.title}</h2>
                {ex.domain !== 'No domain' && (
                  <code className="inline-code">domain="{ex.domain}"</code>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{ex.desc}</p>
            </div>
            <CodeBlock code={ex.code} label="example.py" />
          </div>
        )}
      </div>
    </div>
  )
}
