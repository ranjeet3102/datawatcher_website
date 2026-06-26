import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'
import { Helmet } from 'react-helmet-async'

/* ─── Code snippets ─────────────────────────────────────────── */

const INSTALL_CODE = `pip install datawatcher-ml

# With PDF report export support
pip install "datawatcher-ml[pdf]"`

const QUICKSTART_CODE = `import datawatcher

# Audit a CSV file
results = datawatcher.audit_csv("train.csv", target="survived")

print(results["ml_readiness"])
# {'score': 84, 'grade': 'GOOD', 'total_penalty': 16.0, 'severity_breakdown': {...}}

print(results["risk_summary"])
# {'risk_level': 'LOW', 'top_risks': ['missing_value_audit'], ...}

# Iterate individual audit results
for audit in results["audit_results"]:
    print(f"{audit.audit_name}: {audit.severity} — passed={audit.passed}")`

const DATAFRAME_CODE = `import pandas as pd
import datawatcher

df = pd.read_csv("transactions.csv")

results = datawatcher.audit_dataframe(
    df,
    target="churn",
    domain="finance"   # activates finance-specific audits
)

print(results["metadata"])
# {'rows': 10000, 'columns': 25, 'memory_usage_mb': 4.2}

print(results["semantic_types"])
# {'customer_id': 'identifier', 'age': 'numeric', 'gender': 'categorical', ...}`

const CLI_CODE = `# Basic audit
datawatcher audit run data.csv

# With a target column
datawatcher audit run data.csv --target label

# With a domain plugin
datawatcher audit run data.csv --target label --domain healthcare

# Export reports (choose any combination)
datawatcher audit run data.csv --target label --export-html
datawatcher audit run data.csv --target label --export-pdf
datawatcher audit run data.csv --target label --export-json
datawatcher audit run data.csv --target label --export-html --export-pdf --export-json`

const RETURN_CODE = `{
    "audit_results": [AuditResult, ...],   # list of all audit objects

    "ml_readiness": {
        "score": 84,                       # 0–100
        "grade": "GOOD",                   # EXCELLENT | GOOD | FAIR | POOR
        "total_penalty": 16.0,
        "severity_breakdown": {
            "missing_value_audit": {
                "severity": "MEDIUM",
                "base_penalty": 7,
                "audit_weight": 1.5,
                "weighted_penalty": 10.5
            },
            ...
        }
    },

    "risk_summary": {
        "risk_level": "LOW",               # LOW | MEDIUM | HIGH
        "top_risks": ["missing_value_audit"],
        "high_risk_audits": [],
        "medium_risk_audits": ["missing_value_audit"]
    },

    "metadata": {
        "rows": 10000,
        "columns": 25,
        "memory_usage_mb": 4.2
    },

    "semantic_types": {
        "customer_id": "identifier",
        "age":         "numeric",
        "gender":      "categorical",
        "created_at":  "datetime"
    }
}`

const CUSTOM_CODE = `from datawatcher import BaseAudit, AuditResult, AuditRegistry, AuditEngine
from datawatcher.loaders.factory import load_dataset

class MyCustomAudit(BaseAudit):
    audit_name = "my_custom_audit"
    category = "custom"

    def run(self, dataset, context=None):
        df = dataset.df
        # ... your logic ...
        return AuditResult(
            audit_name=self.audit_name,
            category=self.category,
            passed=True,
            severity="INFO",
            findings={"message": "All good"},
            recommendations=[]
        )

# Register and run
registry = AuditRegistry()
registry.register(MyCustomAudit())

dataset = load_dataset("data.csv")
engine  = AuditEngine(registry)
results = engine.run(dataset, context={"target": "label"})`

const DOMAIN_CODE = `import datawatcher

# Healthcare — adds 7 clinical audits
results = datawatcher.audit_csv(
    "patients.csv",
    target="readmitted",
    domain="healthcare"
)

# Finance — adds 4 financial audits
results = datawatcher.audit_csv(
    "loans.csv",
    target="default",
    domain="finance"
)

# Timeseries — adds duplicate timestamp detection
results = datawatcher.audit_csv(
    "sensor_data.csv",
    domain="timeseries"
)`

/* ─── All 22+ core audits ───────────────────────────────────── */

const CORE_AUDITS = [
  // Structural
  { name: 'shape_audit',              cat: 'Structural',  sev: 'INFO',   w: '0.5',  desc: 'Reports row and column counts.' },
  { name: 'dtype_audit',              cat: 'Structural',  sev: 'INFO',   w: '1.0',  desc: 'Summarises inferred dtype per column.' },
  { name: 'memory_usage_audit',       cat: 'Structural',  sev: 'INFO',   w: '0.5',  desc: 'Reports total in-memory footprint (MB).' },
  { name: 'schema_consistency_audit', cat: 'Structural',  sev: 'MEDIUM', w: '1.5',  desc: 'Detects columns with mixed types (strings + numbers).' },
  // Quality
  { name: 'missing_value_audit',      cat: 'Quality',     sev: 'LOW/MEDIUM', w: '1.5', desc: '>3% → LOW, >15% → MEDIUM. Threshold: Google TFDV.' },
  { name: 'duplicate_audit',          cat: 'Quality',     sev: 'LOW/MEDIUM', w: '1.5', desc: '>0.5% → LOW, >5% → MEDIUM. Threshold: AWS Deequ.' },
  { name: 'constant_feature_audit',   cat: 'Quality',     sev: 'MEDIUM', w: '1.0',  desc: 'Flags columns with a single unique value (zero variance).' },
  { name: 'near_constant_audit',      cat: 'Quality',     sev: 'LOW',    w: '1.0',  desc: '>95% dominated by one value — near-zero signal.' },
  { name: 'invalid_value_audit',      cat: 'Quality',     sev: 'MEDIUM/HIGH', w: '2.0', desc: 'Detects Inf, unexpected NaN, and statistically extreme values.' },
  // Statistical
  { name: 'descriptive_stats_audit',  cat: 'Statistical', sev: 'INFO',   w: '0.0',  desc: 'Mean, std, min, max, quartiles per numeric column. Observational only.' },
  { name: 'variance_audit',           cat: 'Statistical', sev: 'LOW',    w: '1.0',  desc: 'Flags numeric columns with variance < 0.001 (scikit-learn threshold).' },
  { name: 'skewness_audit',           cat: 'Statistical', sev: 'LOW',    w: '0.5',  desc: '|skew| ≥ 1.0 — may need log/Box-Cox transform (Hair et al., 2010).' },
  { name: 'kurtosis_audit',           cat: 'Statistical', sev: 'LOW',    w: '0.5',  desc: 'Excess kurtosis > 7 — heavy-tailed distribution (DeCarlo, 1997).' },
  { name: 'outlier_audit',            cat: 'Statistical', sev: 'LOW/MEDIUM', w: '0.5', desc: '>0.5% outlier rows → LOW, >2% → MEDIUM (IQR method, TFDV).' },
  // Categorical
  { name: 'category_frequency_audit', cat: 'Categorical', sev: 'INFO',   w: '0.0',  desc: 'Counts value frequencies per categorical column. Observational.' },
  { name: 'rare_category_audit',      cat: 'Categorical', sev: 'LOW',    w: '1.0',  desc: 'Category < 0.5% frequency — hard to learn, encode carefully.' },
  { name: 'category_imbalance_audit', cat: 'Categorical', sev: 'MEDIUM', w: '1.0',  desc: 'Dominant category > 70% of column values.' },
  // ML
  { name: 'cardinality_audit',        cat: 'ML',          sev: 'MEDIUM', w: '1.5',  desc: '>30% unique values — high-cardinality encoding risk.' },
  { name: 'identifier_risk_audit',    cat: 'ML',          sev: 'HIGH',   w: '2.0',  desc: '>90% unique + keyword match + semantic type "identifier". GDPR risk.' },
  { name: 'target_validation_audit',  cat: 'ML',          sev: 'HIGH/CRITICAL', w: '3.0', desc: 'Validates the target column exists and is usable for training.' },
  { name: 'class_imbalance_audit',    cat: 'ML',          sev: 'MEDIUM', w: '1.5',  desc: 'Majority class > 75% of target (Japkowicz & Stephen, 2002).' },
  { name: 'leakage_audit',            cat: 'ML',          sev: 'HIGH',   w: '3.0',  desc: '|Pearson r| > 0.90 with target — likely data leakage.' },
]

const DOMAIN_AUDITS = {
  healthcare: [
    { name: 'age_range_audit',               desc: 'Age values outside 0–120.' },
    { name: 'bmi_range_audit',               desc: 'BMI values outside 10–80.' },
    { name: 'blood_pressure_audit',          desc: 'Clinically impossible systolic/diastolic values.' },
    { name: 'heart_rate_audit',              desc: 'Heart rate outside 20–300 BPM.' },
    { name: 'lab_result_range_audit',        desc: 'Lab values outside clinical reference ranges.' },
    { name: 'missing_diagnosis_audit',       desc: 'Null ICD/diagnosis codes — HIGH severity.' },
    { name: 'medication_consistency_audit',  desc: 'Inconsistent drug name or dosage formatting.' },
  ],
  finance: [
    { name: 'negative_value_audit',          desc: 'Unexpected negatives in amount/balance/price columns.' },
    { name: 'currency_consistency_audit',    desc: 'Mixed currency symbols or codes in one column.' },
    { name: 'interest_rate_audit',           desc: 'Rate < 0 or > 100 (invalid).' },
    { name: 'balance_consistency_audit',     desc: 'balance ≠ opening + credits − debits.' },
  ],
  timeseries: [
    { name: 'duplicate_timestamp_audit',     desc: 'Duplicate timestamps in time-indexed dataset.' },
  ],
}

const SEV_COLORS = {
  INFO:     { cls: 'badge-info',     label: 'INFO' },
  LOW:      { cls: 'badge-low',      label: 'LOW' },
  'LOW/MEDIUM': { cls: 'badge-medium', label: 'LOW/MED' },
  MEDIUM:   { cls: 'badge-medium',   label: 'MED' },
  'MEDIUM/HIGH': { cls: 'badge-high', label: 'MED/HIGH' },
  HIGH:     { cls: 'badge-high',     label: 'HIGH' },
  'HIGH/CRITICAL': { cls: 'badge-critical', label: 'HIGH/CRIT' },
  CRITICAL: { cls: 'badge-critical', label: 'CRIT' },
}

/* ─── Sidebar config ─────────────────────────────────────────── */

const SIDEBAR = [
  { id: 'installation',    label: '📦 Installation' },
  { id: 'quickstart',      label: '⚡ Quick Start' },
  { id: 'cli',             label: '💻 CLI Usage' },
  { id: 'how-it-works',    label: '⚙️ How It Works' },
  { id: 'available-audits',label: '🔬 Available Audits' },
  { id: 'severity-levels', label: '🚦 Severity Levels' },
  { id: 'scoring-formula', label: '📈 Scoring Formula' },
  { id: 'domain-plugins',  label: '🏥 Domain Plugins' },
]

/* ─── Section renderers ──────────────────────────────────────── */

function SectionTitle({ children }) {
  return <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>{children}</h1>
}

function Para({ children, style }) {
  return <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20, ...style }}>{children}</p>
}

function H2({ children }) {
  return <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12, color: 'var(--text-primary)' }}>{children}</h2>
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />
}

function InfoBox({ children }) {
  return (
    <div style={{
      background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius)', padding: '14px 18px', fontSize: 14,
      color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20,
    }}>{children}</div>
  )
}

/* ─── Section content map ────────────────────────────────────── */

function SectionInstallation() {
  return (
    <>
      <SectionTitle>Installation</SectionTitle>
      <Divider />
      <Para>Requires Python 3.9+. Install from PyPI with pip:</Para>
      <CodeBlock code={INSTALL_CODE} label="bash" />
      <InfoBox>
        <strong>Core dependencies:</strong> <code className="inline-code">pandas≥1.5</code>,{' '}
        <code className="inline-code">typer≥0.9</code>, <code className="inline-code">rich≥13</code>.
        The <code className="inline-code">[pdf]</code> extra adds <code className="inline-code">reportlab≥4</code> for PDF export.
      </InfoBox>
    </>
  )
}

function SectionQuickstart() {
  return (
    <>
      <SectionTitle>Quick Start</SectionTitle>
      <Divider />
      <Para>Audit a CSV file with a single call:</Para>
      <CodeBlock code={QUICKSTART_CODE} label="quickstart.py" />
    </>
  )
}

function SectionCLI() {
  return (
    <>
      <SectionTitle>CLI Usage</SectionTitle>
      <Divider />
      <Para>
        After installation the <code className="inline-code">datawatcher</code> command is available globally.
        The main subcommand is <code className="inline-code">audit run</code>.
      </Para>
      <CodeBlock code={CLI_CODE} label="bash" />
      <H2>Available flags</H2>
      <div className="table-wrap" style={{ marginTop: 8 }}>
        <table>
          <thead>
            <tr><th>Flag</th><th>Description</th></tr>
          </thead>
          <tbody>
            {[
              ['--target TEXT',       'Name of the target / label column for ML audits'],
              ['--domain TEXT',       'Domain plugin to activate: finance | healthcare | timeseries'],
              ['--export-json',       'Save an audit_report.json in the current directory'],
              ['--export-html',       'Save an audit_report.html in the current directory'],
              ['--export-pdf',        'Save an audit_report.pdf (requires the [pdf] extra)'],
            ].map(([f, d]) => (
              <tr key={f}>
                <td><code className="inline-code">{f}</code></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}



function SectionHowItWorks() {
  const steps = [
    {
      n: '1', title: 'Load & Normalize',
      desc: 'The CSV is loaded with pandas. Column names are stripped and lowercased. Dtypes are cast to optimal types (numeric, datetime, bool) via the dtype normalizer.'
    },
    {
      n: '2', title: 'Semantic Type Detection',
      desc: 'Each column is classified into one of: identifier, text, datetime, boolean, numeric, categorical, or unknown — based on column name patterns and pandas dtype.'
    },
    {
      n: '3', title: 'Build the Audit Registry',
      desc: 'All applicable audit classes are instantiated and registered into an AuditRegistry. If a domain is specified, the domain plugin adds its extra audits.'
    },
    {
      n: '4', title: 'AuditEngine Runs All Audits',
      desc: 'AuditEngine iterates the registry and calls audit.run(dataset, context) for each. Exceptions are caught and converted to error results so one failing audit never blocks others.'
    },
    {
      n: '5', title: 'Penalty & Score Calculation',
      desc: 'For each result: penalty = severity_weight × audit_weight. Total penalty is summed, then Score = max(0, 100 − total_penalty).'
    },
    {
      n: '6', title: 'Risk Summary Generation',
      desc: 'Audits with MEDIUM, HIGH, or CRITICAL severity are filtered, sorted by severity, and returned as the risk_summary with a top-level risk_level (LOW / MEDIUM / HIGH).'
    },
  ]
  return (
    <>
      <SectionTitle>How It Works</SectionTitle>
      <Divider />
      <Para>DataWatcher follows a six-step pipeline every time you call audit_csv() or audit_dataframe():</Para>
      <div className="step-list">
        {steps.map(s => (
          <div key={s.n} className="step-item">
            <div className="step-num">{s.n}</div>
            <div className="step-body">
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function SectionAvailableAudits() {
  const cats = ['Structural', 'Quality', 'Statistical', 'Categorical', 'ML']
  const catColors = {
    Structural:  'var(--sev-info)',
    Quality:     'var(--sev-low)',
    Statistical: 'var(--sev-medium)',
    Categorical: 'var(--sev-high)',
    ML:          'var(--sev-critical)',
  }

  return (
    <>
      <SectionTitle>Available Audits</SectionTitle>
      <Divider />
      <Para>DataWatcher runs <strong style={{ color: 'var(--text-primary)' }}>22 core audits</strong> across
        5 categories. Every audit produces an <code className="inline-code">AuditResult</code> with
        findings, severity, and recommendations.
      </Para>

      {cats.map(cat => {
        const audits = CORE_AUDITS.filter(a => a.cat === cat)
        const color = catColors[cat]
        return (
          <div key={cat} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{cat} Audits</h2>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 100,
                background: `${color}18`, color, border: `1px solid ${color}40`,
              }}>{audits.length} audits</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Audit Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map(a => (
                    <tr key={a.name}>
                      <td>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-light)' }}>
                          {a.name}
                        </code>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </>
  )
}

function SectionSeverity() {
  return (
    <>
      <SectionTitle>Severity Levels</SectionTitle>
      <Divider />
      <Para>
        Every <code className="inline-code">AuditResult</code> has a <code className="inline-code">severity</code> field
        that determines how much it penalises the ML Readiness Score.
      </Para>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Level</th><th>Base Weight</th><th>Meaning</th><th>Example Audits</th></tr>
          </thead>
          <tbody>
            {[
              ['INFO',     '0',  'badge-info',     'Informational — no score penalty.', 'shape_audit, descriptive_stats_audit'],
              ['LOW',      '3',  'badge-low',       'Minor issue worth noting.',          'skewness_audit, near_constant_audit'],
              ['MEDIUM',   '7',  'badge-medium',   'Moderate risk to model quality.',    'missing_value_audit, duplicate_audit'],
              ['HIGH',     '15', 'badge-high',     'Significant training risk.',          'leakage_audit, identifier_risk_audit'],
              ['CRITICAL', '25', 'badge-critical', 'Must fix before training.',           'target_validation_audit (missing target)'],
            ].map(([sev, w, cls, meaning, ex]) => (
              <tr key={sev}>
                <td><span className={`badge ${cls}`}>{sev}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-light)', fontWeight: 700 }}>{w}</td>
                <td style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{meaning}</td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 24 }}>
        <InfoBox>
          Severity is determined inside each audit's <code className="inline-code">run()</code> method based on
          configurable thresholds. The values above are the <em>base weights</em> used in the penalty formula.
        </InfoBox>
      </div>
    </>
  )
}

function SectionScoring() {
  return (
    <>
      <SectionTitle>Scoring Formula</SectionTitle>
      <Divider />
      <Para>The ML Readiness Score is a 0–100 number computed as:</Para>

      {/* Formula display */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)', padding: '28px 32px',
        fontFamily: 'var(--font-mono)', fontSize: 18,
        color: 'var(--text-primary)', marginBottom: 28, textAlign: 'center',
        letterSpacing: '-0.01em',
      }}>
        Score = max(0, 100 − Σ(severity_weight × audit_weight))
      </div>

      <Para>
        Each audit contributes a <strong style={{ color: 'var(--text-primary)' }}>weighted penalty</strong> only when it fails
        (i.e. <code className="inline-code">passed=False</code>).
        High-impact audits carry a larger <code className="inline-code">audit_weight</code>.
      </Para>

      <H2>Audit Weights</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Audit</th><th>Weight</th><th>Rationale</th></tr>
          </thead>
          <tbody>
            {[
              ['leakage_audit',            '3.0', 'Data leakage directly invalidates model results'],
              ['target_validation_audit',  '3.0', 'Invalid target makes training impossible'],
              ['invalid_value_audit',      '2.0', 'Inf / NaN breaks most ML algorithms'],
              ['identifier_risk_audit',    '2.0', 'GDPR risk + model memorisation risk'],
              ['missing_value_audit',      '1.5', 'Major quality concern (TFDV threshold)'],
              ['duplicate_audit',          '1.5', 'Duplicate rows bias training distribution'],
              ['class_imbalance_audit',    '1.5', 'Strong effect on metric selection'],
              ['cardinality_audit',        '1.5', 'High-cardinality cols are hard to encode'],
              ['schema_consistency_audit', '1.5', 'Mixed types corrupt training data'],
              ['constant_feature_audit',   '1.0', 'Zero-variance columns add no signal'],
              ['near_constant_audit',      '1.0', 'Near-zero variance — minimal signal'],
              ['rare_category_audit',      '1.0', 'Rare categories cause encoding instability'],
              ['category_imbalance_audit', '1.0', 'Imbalanced features mislead some models'],
              ['variance_audit',           '1.0', 'Low-variance features contribute little'],
              ['dtype_audit',              '1.0', 'Wrong dtypes affect feature engineering'],
              ['skewness_audit',           '0.5', 'Skewed features may need transformation'],
              ['kurtosis_audit',           '0.5', 'Heavy tails amplify outlier effects'],
              ['outlier_audit',            '0.5', 'Outliers distort linear models'],
              ['shape_audit',              '0.5', 'Dataset size awareness'],
              ['memory_usage_audit',       '0.5', 'Memory awareness'],
              ['descriptive_stats_audit',  '0.0', 'Observational only — no penalty'],
              ['category_frequency_audit', '0.0', 'Observational only — no penalty'],
            ].map(([a, w, r]) => (
              <tr key={a}>
                <td><code className="inline-code" style={{ fontSize: 12 }}>{a}</code></td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontWeight: 700 }}>{w}</td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Grade Thresholds</H2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { range: '≥ 90', grade: 'EXCELLENT', color: 'var(--sev-low)',      desc: 'Production ready' },
          { range: '≥ 75', grade: 'GOOD',      color: 'var(--teal)',         desc: 'Minor issues' },
          { range: '≥ 60', grade: 'FAIR',      color: 'var(--sev-medium)',   desc: 'Moderate cleanup' },
          { range: '< 60', grade: 'POOR',      color: 'var(--sev-critical)', desc: 'Significant issues' },
        ].map(g => (
          <div key={g.grade} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 8 }}>{g.range}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: g.color, marginBottom: 6 }}>{g.grade}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.desc}</div>
          </div>
        ))}
      </div>

      <H2>Example Calculation</H2>
      <InfoBox>
        If <code className="inline-code">missing_value_audit</code> returns MEDIUM (weight 7) and its audit_weight is 1.5 →
        penalty = 7 × 1.5 = <strong>10.5</strong>. With no other failures the score = 100 − 10.5 = <strong>89.5 → GOOD</strong>.
      </InfoBox>
    </>
  )
}

function SectionDomainPlugins() {
  const domainColors = { healthcare: 'var(--rose)', finance: 'var(--amber)', timeseries: 'var(--sev-info)' }
  const domainDescs = {
    healthcare: 'Adds 7 clinical audits that validate medical ranges and consistency. Activate with domain="healthcare".',
    finance:    'Adds 4 financial audits for currency, balance, and rate validity. Activate with domain="finance".',
    timeseries: 'Adds 1 audit for duplicate timestamp detection. Activate with domain="timeseries".',
  }

  return (
    <>
      <SectionTitle>Domain Plugins</SectionTitle>
      <Divider />
      <Para>
        Domain plugins layer <strong style={{ color: 'var(--text-primary)' }}>industry-specific audits</strong> on top of the
        22 core audits. Pass the <code className="inline-code">domain</code> parameter to activate a plugin.
      </Para>


      {Object.entries(DOMAIN_AUDITS).map(([domain, audits]) => (
        <div key={domain} style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: domainColors[domain], boxShadow: `0 0 8px ${domainColors[domain]}`
            }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>
              {domain} Plugin
            </h2>
            <code className="inline-code" style={{ fontSize: 12 }}>domain="{domain}"</code>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 14 }}>{domainDescs[domain]}</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Audit Name</th><th>Description</th></tr></thead>
              <tbody>
                {audits.map(a => (
                  <tr key={a.name}>
                    <td><code className="inline-code" style={{ fontSize: 12 }}>{a.name}</code></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  )
}


const SECTIONS = {
  installation:     <SectionInstallation />,
  quickstart:       <SectionQuickstart />,
  cli:              <SectionCLI />,
  'how-it-works':   <SectionHowItWorks />,
  'available-audits': <SectionAvailableAudits />,
  'severity-levels':  <SectionSeverity />,
  'scoring-formula':  <SectionScoring />,
  'domain-plugins':   <SectionDomainPlugins />,
}

/* ─── Main page ──────────────────────────────────────────────── */

export default function Docs() {
  const [active, setActive] = useState('installation')

  return (
    <div className="docs-layout">
      <Helmet>
        <title>DataWatcher Documentation — API Reference, CLI & Audit Catalog</title>
        <meta name="description" content="Full documentation for the DataWatcher Python library. Learn how to install, use the Python API and CLI, explore all 22+ audit types, severity levels, scoring formula, and domain plugins for healthcare, finance, and timeseries." />
        <meta name="keywords" content="datawatcher docs, datawatcher API, datawatcher CLI, dataset auditing documentation, ML readiness score docs, Python data quality library" />
        <link rel="canonical" href="https://datawatcher-ml.vercel.app/docs" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://datawatcher-ml.vercel.app/docs" />
        <meta property="og:title" content="DataWatcher Documentation — API Reference, CLI & Audit Catalog" />
        <meta property="og:description" content="Full documentation for DataWatcher: installation, Python API, CLI usage, 22+ audit types, scoring formula, and domain plugins (healthcare, finance, timeseries)." />
        <meta property="og:image" content="https://datawatcher-ml.vercel.app/og-image.png" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DataWatcher Documentation — API Reference, CLI & Audit Catalog" />
        <meta name="twitter:description" content="Full documentation for DataWatcher: installation, Python API, CLI usage, 22+ audit types, scoring formula, and domain plugins." />
      </Helmet>
      {/* ── Sidebar ── */}
      <aside className="docs-sidebar">
        <div style={{ padding: '0 24px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
            Documentation
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>datawatcher-ml v1.0.2</div>
        </div>
        {SIDEBAR.map(s => (
          <div
            key={s.id}
            className={`sidebar-link ${active === s.id ? 'active' : ''}`}
            onClick={() => setActive(s.id)}
          >
            {s.label}
          </div>
        ))}
      </aside>

      {/* ── Content ── */}
      <main className="docs-content">
        <div style={{ maxWidth: 800 }} key={active}>
          {SECTIONS[active]}

          {/* Prev / Next nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            {(() => {
              const idx = SIDEBAR.findIndex(s => s.id === active)
              const prev = SIDEBAR[idx - 1]
              const next = SIDEBAR[idx + 1]
              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => setActive(prev.id)}
                      className="btn btn-outline btn-sm"
                    >
                      ← {prev.label}
                    </button>
                  ) : <span />}
                  {next ? (
                    <button
                      onClick={() => setActive(next.id)}
                      className="btn btn-outline btn-sm"
                    >
                      {next.label} →
                    </button>
                  ) : <span />}
                </>
              )
            })()}
          </div>
        </div>
      </main>
    </div>
  )
}
