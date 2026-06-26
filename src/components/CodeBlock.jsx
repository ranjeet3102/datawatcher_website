import { useState } from 'react'

function Check({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function Copy({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  )
}

export default function CodeBlock({ code, label = 'python', children }) {
  const [copied, setCopied] = useState(false)

  const content = code || (typeof children === 'string' ? children : '')

  const copy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Segment-based highlighter — no placeholders, no cross-contamination
  const highlight = (src) => {
    const esc = (t) =>
      t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const highlightCode = (t) => {
      t = esc(t)
      // keywords
      t = t.replace(
        /\b(import|from|def|class|return|if|else|elif|for|in|not|and|or|True|False|None|with|as|try|except)\b/g,
        '<span class="tok-kw">$1</span>'
      )
      // function calls
      t = t.replace(/\b([a-z_]\w*)\s*(?=\()/g, '<span class="tok-fn">$1</span>')
      // numbers
      t = t.replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>')
      // CamelCase class names
      t = t.replace(/\b([A-Z][A-Za-z0-9]+)\b/g, '<span class="tok-cls">$1</span>')
      return t
    }

    // Split source into: double-quoted strings, single-quoted strings, comments, plain code
    const re = /"([^"\n]*)"|'([^'\n]*)'|(#[^\n]*)/g
    const parts = []
    let last = 0
    let m
    while ((m = re.exec(src)) !== null) {
      if (m.index > last) parts.push({ type: 'code',    text: src.slice(last, m.index) })
      if (m[0][0] === '#')  parts.push({ type: 'comment', text: m[0] })
      else                  parts.push({ type: 'str',     text: m[0] })
      last = m.index + m[0].length
    }
    if (last < src.length) parts.push({ type: 'code', text: src.slice(last) })

    return parts.map(p => {
      if (p.type === 'code')    return highlightCode(p.text)
      if (p.type === 'str')     return `<span class="tok-str">${esc(p.text)}</span>`
      /* comment */             return `<span class="tok-comment">${esc(p.text)}</span>`
    }).join('')
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <div className="code-dots">
          <div className="code-dot" />
          <div className="code-dot" />
          <div className="code-dot" />
        </div>
        <span className="code-label">{label}</span>
        <button
          onClick={copy}
          style={{
            background: 'none',
            border: 'none',
            color: copied ? 'var(--teal)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            transition: 'var(--transition)',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre dangerouslySetInnerHTML={{ __html: highlight(content) }} />
      <style>{`
        .tok-kw      { color: #c792ea; font-weight: 600; }
        .tok-fn      { color: #82aaff; }
        .tok-str     { color: #c3e88d; }
        .tok-comment { color: #546e7a; font-style: italic; }
        .tok-num     { color: #f78c6c; }
        .tok-cls     { color: #ffcb6b; }
      `}</style>
    </div>
  )
}
