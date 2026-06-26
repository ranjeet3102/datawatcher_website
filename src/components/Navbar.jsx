import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

function GithubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const location                  = useLocation()

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { to: '/',     label: 'Home',   end: true },
    { to: '/docs', label: 'Docs',   end: false },
  ]

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <NavLink to="/" className="nav-logo">
            DataWatcher
          </NavLink>

          {/* Desktop links */}
          <ul className="nav-links">
            {navLinks.map(l => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {/* Desktop GitHub + CTA */}
            <a
              href="https://github.com/ranjeet3102/datawatcher"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-github"
            >
              <GithubIcon size={16} />
              GitHub
            </a>
            <NavLink to="https://pypi.org/project/datawatcher-ml/" className="btn btn-primary btn-sm nav-cta">
              Get Started →
            </NavLink>

            {/* Hamburger (mobile only, shown via CSS) */}
            <button
              className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="nav-mobile-divider" />
          <a
            href="https://github.com/ranjeet3102/datawatcher"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon size={14} style={{ marginRight: 6 }} />
            GitHub
          </a>
          <a
            href="https://pypi.org/project/datawatcher-ml/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Get Started →
          </a>
        </div>
      )}
    </>
  )
}
