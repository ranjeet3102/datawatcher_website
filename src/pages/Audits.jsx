import { useState } from 'react'

const CATEGORIES = ['All', 'Structural', 'Quality', 'Statistical', 'Categorical', 'ML', 'Healthcare', 'Finance', 'Timeseries']

const audits = [
  // Structural
  { name: 'shape_audit', category: 'Structural', severity: 'INFO', threshold: 'Observational', source: '—', desc: 'Reports the row and column counts of the dataset.', weight: 0.5 },
  { name: 'dtype_audit', category: 'Structural', severity: 'INFO', threshold: 'Observational', source: '—', desc: 'Summarizes the inferred data type per column.', weight: 1.0 },
  { name: 'memory_usage_audit', category: 'Structural', severity: 'INFO', threshold: 'Observational', source: '—', desc: 'Measures total in-memory footprint of the DataFrame.', weight: 0.5 },
  { name: 'schema_consistency_audit', category: 'Structural', severity: 'MEDIUM', threshold: 'Any mixed-type column', source: '—', desc: 'Detects columns with mixed types (e.g., strings and numbers together).', weight: 1.5 },

  // Quality
  { name: 'missing_value_audit', category: 'Quality', severity: 'LOW / MEDIUM', threshold: '>3% LOW, >15% MEDIUM', source: 'Google TFDV', desc: 'Flags columns with missing values above industry thresholds.', weight: 1.5 },
  { name: 'duplicate_audit', category: 'Quality', severity: 'LOW / MEDIUM', threshold: '>0.5% LOW, >5% MEDIUM', source: 'AWS Deequ', desc: 'Detects duplicate rows that can bias model training.', weight: 1.5 },
  { name: 'constant_feature_audit', category: 'Quality', severity: 'MEDIUM', threshold: 'Any constant column', source: '—', desc: 'Identifies columns with zero variance — a single repeated value.', weight: 1.0 },
  { name: 'near_constant_audit', category: 'Quality', severity: 'LOW', threshold: '>95% single value', source: 'scikit-learn', desc: 'Finds columns dominated (>95%) by one value, providing near-zero signal.', weight: 1.0 },
  { name: 'invalid_value_audit', category: 'Quality', severity: 'MEDIUM / HIGH', threshold: 'Inf / NaN / extreme values', source: '—', desc: 'Scans for infinite values, unexpected NaN, and statistically extreme values.', weight: 2.0 },

  // Statistical
  { name: 'descriptive_stats_audit', category: 'Statistical', severity: 'INFO', threshold: 'Observational', source: '—', desc: 'Computes mean, std, min, max, quartiles per numeric column. No penalty.', weight: 0.0 },
  { name: 'variance_audit', category: 'Statistical', severity: 'LOW', threshold: 'Variance < 0.001', source: 'scikit-learn VarianceThreshold', desc: 'Flags extremely low-variance numeric columns that add little predictive signal.', weight: 1.0 },
  { name: 'skewness_audit', category: 'Statistical', severity: 'LOW', threshold: '|skew| ≥ 1.0', source: 'Hair et al. (2010)', desc: 'Identifies highly skewed distributions that may need transformation.', weight: 0.5 },
  { name: 'kurtosis_audit', category: 'Statistical', severity: 'LOW', threshold: 'Excess kurtosis > 7', source: 'DeCarlo (1997)', desc: 'Detects heavy-tailed distributions prone to extreme outlier influence.', weight: 0.5 },
  { name: 'outlier_audit', category: 'Statistical', severity: 'LOW / MEDIUM', threshold: '>0.5% rows LOW, >2% MEDIUM', source: 'IBM Research / TFDV', desc: 'Counts outlier rows (IQR method) and classifies severity by percentage.', weight: 0.5 },

  // Categorical
  { name: 'category_frequency_audit', category: 'Categorical', severity: 'INFO', threshold: 'Observational', source: '—', desc: 'Counts value frequencies per categorical column. No penalty.', weight: 0.0 },
  { name: 'rare_category_audit', category: 'Categorical', severity: 'LOW', threshold: 'Category < 0.5% frequency', source: '—', desc: 'Flags categories that appear too rarely to be learnable by a model.', weight: 1.0 },
  { name: 'category_imbalance_audit', category: 'Categorical', severity: 'MEDIUM', threshold: 'Dominant category > 70%', source: '—', desc: 'Detects categorical features heavily dominated by a single category.', weight: 1.0 },

  // ML
  { name: 'cardinality_audit', category: 'ML', severity: 'MEDIUM', threshold: '>30% unique values', source: 'Industry ML best practice', desc: 'Warns about high-cardinality features that are difficult to encode.', weight: 1.5 },
  { name: 'identifier_risk_audit', category: 'ML', severity: 'HIGH', threshold: '>90% unique + keyword match + semantic type', source: 'GDPR / ML risk', desc: 'Detects columns that look like IDs (uuid, ssn, token) — a GDPR and memorization risk.', weight: 2.0 },
  { name: 'target_validation_audit', category: 'ML', severity: 'HIGH / CRITICAL', threshold: 'Target column validity', source: '—', desc: 'Validates that the specified target column exists and is usable.', weight: 3.0 },
  { name: 'class_imbalance_audit', category: 'ML', severity: 'MEDIUM', threshold: 'Majority class > 75%', source: 'Japkowicz & Stephen (2002)', desc: 'Flags severe class imbalance in classification targets.', weight: 1.5 },
  { name: 'leakage_audit', category: 'ML', severity: 'HIGH', threshold: '|Pearson r| > 0.90 with target', source: 'Industry standard', desc: 'Detects features suspiciously correlated with the target — likely data leakage.', weight: 3.0 },

  // Healthcare
  { name: 'age_range_audit', category: 'Healthcare', severity: 'MEDIUM', threshold: 'Age outside 0–120', source: '—', desc: 'Validates clinical age values are within biologically plausible range.', weight: 1.0 },
  { name: 'bmi_range_audit', category: 'Healthcare', severity: 'MEDIUM', threshold: 'BMI outside 10–80', source: '—', desc: 'Validates BMI values are within clinical plausibility range.', weight: 1.0 },
  { name: 'blood_pressure_audit', category: 'Healthcare', severity: 'MEDIUM', threshold: 'Systolic/diastolic validity', source: '—', desc: 'Checks blood pressure columns for clinically impossible values.', weight: 1.0 },
  { name: 'heart_rate_audit', category: 'Healthcare', severity: 'MEDIUM', threshold: 'Heart rate 20–300 BPM', source: '—', desc: 'Validates heart rate readings are within physiological range.', weight: 1.0 },
  { name: 'lab_result_range_audit', category: 'Healthcare', severity: 'MEDIUM', threshold: 'Clinical normal ranges', source: '—', desc: 'Flags lab values that fall outside typical clinical reference ranges.', weight: 1.0 },
  { name: 'missing_diagnosis_audit', category: 'Healthcare', severity: 'HIGH', threshold: 'Any null diagnosis codes', source: '—', desc: 'Detects missing ICD/diagnosis codes — critical for clinical modeling.', weight: 1.5 },
  { name: 'medication_consistency_audit', category: 'Healthcare', severity: 'MEDIUM', threshold: 'Drug/dosage consistency', source: '—', desc: 'Checks for inconsistent drug name or dosage formatting.', weight: 1.0 },

  // Finance
  { name: 'negative_value_audit', category: 'Finance', severity: 'MEDIUM', threshold: 'Unexpected negatives in financial cols', source: '—', desc: 'Flags financial columns (amount, balance, price) with unexpected negative values.', weight: 1.0 },
  { name: 'currency_consistency_audit', category: 'Finance', severity: 'MEDIUM', threshold: 'Mixed currency formats', source: '—', desc: 'Detects inconsistent currency symbols or mixed currency codes.', weight: 1.0 },
  { name: 'interest_rate_audit', category: 'Finance', severity: 'MEDIUM', threshold: 'Rate < 0 or > 100', source: '—', desc: 'Validates interest rate columns for negative or unrealistically high values.', weight: 1.0 },
  { name: 'balance_consistency_audit', category: 'Finance', severity: 'MEDIUM', threshold: 'Debit+credit ≠ balance', source: '—', desc: 'Checks that balance = opening + credits − debits arithmetic holds.', weight: 1.0 },

  // Timeseries
  { name: 'duplicate_timestamp_audit', category: 'Timeseries', severity: 'HIGH', threshold: 'Any duplicate timestamps', source: '—', desc: 'Detects duplicate timestamps in time-indexed datasets.', weight: 1.5 },
]

const SEV_ORDER = { INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }

const sevClass = (s) => {
  const base = s.split('/')[0].trim().toLowerCase()
  return `badge badge-${base}`
}

export default function Audits() {
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = audits.filter(a => {
    const matchCat = cat === 'All' || a.category === cat
    const matchSearch = a.name.includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '60px 0 48px',
      }}>
        <div className="container">
          <div className="section-label">🔬 Audit Catalog</div>
          <h1 className="section-title">
            All <span className="gradient-text">22+ Audits</span>
          </h1>
          <p className="section-subtitle">
            Every audit maps to published industry thresholds. Each produces an{' '}
            <code className="inline-code">AuditResult</code> with findings, severity, and recommendations.
          </p>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, marginTop: 32, flexWrap: 'wrap' }}>
            {[
              ['22+', 'Core audits'],
              ['12', 'Domain audits'],
              ['5', 'Severity levels'],
              ['3', 'Domain plugins'],
            ].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-light)' }}>{v}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ position: 'sticky', top: 63, zIndex: 50, background: 'rgba(10,11,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`tab-btn ${cat === c ? 'active' : ''}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audits…"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '8px 16px',
              color: 'var(--text-primary)',
              fontSize: 14,
              width: 200,
              outline: 'none',
              transition: 'var(--transition)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* Table */}
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 13 }}>
          Showing {filtered.length} audit{filtered.length !== 1 ? 's' : ''}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Audit Name</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Threshold</th>
                <th>Weight</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.name}>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-light)' }}>
                      {a.name}
                    </code>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '3px 10px',
                      borderRadius: 100, background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)', color: 'var(--text-secondary)'
                    }}>{a.category}</span>
                  </td>
                  <td>
                    <span className={sevClass(a.severity)}>{a.severity}</span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 180 }}>{a.threshold}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontWeight: 600 }}>{a.weight}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 260 }}>{a.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
