import { NavLink } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

function ArrowRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}


const features = [
  {
    icon: '🛡️', cls: 'icon-purple',
    title: '22+ Automated Audits',
    desc: 'Structural, quality, statistical, categorical, and ML-specific checks run in one call.',
  },
  {
    icon: '📊', cls: 'icon-teal',
    title: 'ML Readiness Score',
    desc: 'A 0–100 score with grade (EXCELLENT → POOR) computed from weighted severity penalties.',
  },
  {
    icon: '⚡', cls: 'icon-amber',
    title: 'Zero Config Required',
    desc: 'One function call audits your entire dataset. No config files, no schema definitions.',
  },
  {
    icon: '🏥', cls: 'icon-rose',
    title: 'Domain Plugins',
    desc: 'Activate healthcare, finance, or timeseries plugins for domain-specific audits.',
  },
  {
    icon: '📄', cls: 'icon-blue',
    title: 'Report Export',
    desc: 'Export audit reports as JSON, HTML, or PDF for sharing with stakeholders.',
  },
]

const stats = [
  { value: '22+', label: 'Audit Checks' },
  { value: '3',   label: 'Domain Plugins' },
  { value: '0',   label: 'Config Files Needed' },
  { value: '100', label: 'Max Readiness Score' },
]

const auditCategories = [
  { name: 'Structural', count: 4, color: 'var(--sev-info)',     bg: 'rgba(96,165,250,0.1)',  checks: ['shape', 'dtypes', 'memory', 'schema consistency'] },
  { name: 'Quality',    count: 5, color: 'var(--sev-low)',      bg: 'rgba(52,211,153,0.1)',  checks: ['missing values', 'duplicates', 'constant features', 'near-constant', 'invalid values'] },
  { name: 'Statistical',count: 5, color: 'var(--sev-medium)',   bg: 'rgba(251,191,36,0.1)',  checks: ['descriptive stats', 'variance', 'skewness', 'kurtosis', 'outliers'] },
  { name: 'Categorical',count: 3, color: 'var(--sev-high)',     bg: 'rgba(249,115,22,0.1)',  checks: ['category frequency', 'rare categories', 'category imbalance'] },
  { name: 'ML',         count: 5, color: 'var(--sev-critical)', bg: 'rgba(239,68,68,0.1)',   checks: ['cardinality', 'identifier risk', 'target validation', 'class imbalance', 'leakage'] },
]

export default function Home() {
  return (
    <div>
      <Helmet>
        <title>DataWatcher — Python Dataset Auditing &amp; ML Readiness Library</title>
        <meta name="description" content="DataWatcher runs 22+ automated audits on your Python dataset, computes an ML Readiness Score (0–100), detects data leakage, missing values, and class imbalance. Install in seconds: pip install datawatcher-ml" />
        <meta name="keywords" content="datawatcher, dataset auditing, ML readiness score, Python data quality, machine learning data validation, missing values detection, data leakage detection, PyPI" />
        <link rel="canonical" href="https://datawatcher-ml.vercel.app/" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://datawatcher-ml.vercel.app/" />
        <meta property="og:title" content="DataWatcher — Python Dataset Auditing &amp; ML Readiness" />
        <meta property="og:description" content="Run 22+ automated audits on your dataset, compute an ML Readiness Score (0–100), and get a prioritized fix list — in a single Python call. pip install datawatcher-ml" />
        <meta property="og:image" content="https://datawatcher-ml.vercel.app/og-image.png" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DataWatcher — Python Dataset Auditing &amp; ML Readiness" />
        <meta name="twitter:description" content="Run 22+ automated audits on your dataset, compute an ML Readiness Score (0–100), and get a prioritized fix list — in a single Python call. pip install datawatcher-ml" />
        <meta name="twitter:image" content="https://datawatcher-ml.vercel.app/og-image.png" />
      </Helmet>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-grid-bg" />

        {/* glow blobs */}
        <div className="glow-blob animate-pulse-blob" style={{
          width: 500, height: 500,
          background: 'var(--accent)',
          top: '5%', left: '-10%',
        }} />
        <div className="glow-blob animate-pulse-blob" style={{
          width: 400, height: 400,
          background: 'var(--teal)',
          top: '30%', right: '-8%',
          animationDelay: '2s',
        }} />

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-dot">✨</div>
              <span className="hero-badge-text">v1.0.2 — Now on PyPI</span>
            </div>

            <h1 className="hero-title">
              Know your data before<br />
              <span className="gradient-text">training your model</span>
            </h1>

            <p className="hero-sub">
              DataWatcher runs <strong style={{ color: 'var(--text-primary)' }}>22+ automated audits</strong> on
              your dataset, computes an <strong style={{ color: 'var(--text-primary)' }}>ML Readiness Score</strong>,
              and gives you a prioritized list of issues to fix — in a single Python call.
            </p>

            <div className="hero-actions">
              <NavLink to="https://pypi.org/project/datawatcher-ml/" className="btn btn-primary">
                Get Started <ArrowRight size={16} />
              </NavLink>
              <NavLink to="/docs" className="btn btn-outline">
                View Documentation
              </NavLink>
            </div>

            <div className="hero-pip">
              <span className="hero-pip-dollar">$</span>
              <span className="hero-pip-cmd">pip install datawatcher-ml</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid-4">
            {stats.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ── Features ─────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label" style={{ margin: '0 auto 20px' }}>🚀 Features</div>
            <h2 className="section-title">Everything you need for<br /><span className="gradient-text">data quality</span></h2>
          </div>
          <div className="grid-3">
            {features.map(f => (
              <div key={f.title} className="card">
                <div className={`feature-icon ${f.cls}`}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Audit categories ──────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="home-audit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 64, alignItems: 'start' }}>
            <div>
              <div className="section-label">🔬 Audit Catalog</div>
              <h2 className="section-title">22+ audits across<br /><span className="gradient-text">5 categories</span></h2>
              <p className="section-subtitle" style={{ marginBottom: 32 }}>
                Every audit maps to published industry thresholds from sources like
                Google TFDV, AWS Deequ, and peer-reviewed statistics literature.
              </p>
              <NavLink to="/docs" className="btn btn-outline">
                View in Docs →
              </NavLink>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {auditCategories.map(cat => (
                <div key={cat.name} className="card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: cat.color, boxShadow: `0 0 8px ${cat.color}`
                      }} />
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{cat.name}</span>
                    </div>
                    <span style={{
                      background: cat.bg, color: cat.color,
                      border: `1px solid ${cat.color}40`,
                      padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600
                    }}>
                      {cat.count} audits
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {cat.checks.map(c => (
                      <span key={c} style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        padding: '3px 10px', borderRadius: 100,
                        fontSize: 12, color: 'var(--text-secondary)'
                      }}>{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── Score explanation ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ margin: '0 auto 20px' }}>📈 ML Readiness</div>
            <h2 className="section-title">A single score that tells<br /><span className="gradient-text">the whole story</span></h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              DataWatcher computes <code className="inline-code">Score = 100 − Σ(severity_weight × audit_weight)</code> across all audits.
            </p>
          </div>
          <div className="grid-4 score-grades-grid" style={{ textAlign: 'center' }}>
            {[
              { range: '≥ 90', grade: 'EXCELLENT', color: 'var(--sev-low)',      desc: 'Dataset is production-ready' },
              { range: '≥ 75', grade: 'GOOD',      color: 'var(--teal)',         desc: 'Minor issues to address' },
              { range: '≥ 60', grade: 'FAIR',      color: 'var(--sev-medium)',   desc: 'Moderate cleanup needed' },
              { range: '< 60', grade: 'POOR',      color: 'var(--sev-critical)', desc: 'Significant issues found' },
            ].map(g => (
              <div key={g.grade} className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
                  marginBottom: 10, fontFamily: 'var(--font-mono)'
                }}>{g.range}</div>
                <div style={{
                  fontSize: 22, fontWeight: 800, color: g.color,
                  marginBottom: 10, letterSpacing: '-0.02em'
                }}>{g.grade}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{g.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div className="glow-blob" style={{
              width: 400, height: 400,
              background: 'var(--accent)',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.08,
            }} />
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 800, marginBottom: 16, position: 'relative' }}>
              Ready to audit your<br /><span className="gradient-text">dataset?</span>
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 36 }}>
            Get started in seconds — no config files, no setup overhead.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <NavLink to="/docs" className="btn btn-primary">
              Read the Docs <ArrowRight size={16} />
            </NavLink>
            <a
              href="https://pypi.org/project/datawatcher-ml/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              📦 View on PyPI
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
