import { NavLink } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* <div className="logo-icon" style={{ width: 28, height: 28, fontSize: 15 }}>🔍</div> */}
          <span style={{ fontWeight: 700, fontSize: 16 }}>DataWatcher</span>
          <span className="footer-text" style={{ marginLeft: 12 }}>
            MIT © 2025 Ranjeet
          </span>
        </div>

        <div className="footer-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/docs">Docs</NavLink>
          <a href="https://pypi.org/project/datawatcher-ml/" target="_blank" rel="noopener noreferrer">PyPI</a>
          <a href="https://github.com/ranjeet3102/datawatcher" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://portfolio-kohl-one-zu4zhv4rkb.vercel.app/" target="_blank" rel="noopener noreferrer">Portfolio</a>
        </div>
      </div>
    </footer>
  )
}
