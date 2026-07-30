/**
 * OREL Markdown Parser
 * Used for both news posts and documentation.
 * Documentation gets anchor IDs on headings for sidebar navigation.
 *
 * Syntax:
 *   # H1   ## H2   ### H3
 *   **bold**  *italic*
 *   ```\ncode block\n```
 *   >> inline code
 *   >>> terminal command
 *   - list item
 *   > blockquote
 *   blank line = paragraph break
 */

export interface DocHeading {
  id: string
  text: string
  level: 1 | 2 | 3
}

export interface ParseResult {
  html: string
  headings: DocHeading[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\wа-яёА-ЯЁ\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function parseInline(s: string): string {
  // >>> terminal (must be before >>)
  s = s.replace(/>>>(.+)/g, (_, cmd) =>
    `<span class="orm-terminal"><span class="orm-terminal-prompt">$</span>${escapeHtml(cmd.trim())}</span>`,
  )
  // >> inline code
  s = s.replace(/>>([^\s].*?)(?=\s|$)/g, (_, code) =>
    `<code class="orm-code">${escapeHtml(code.trim())}</code>`,
  )
  // **bold**
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // *italic*
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>')
  return s
}

export function parseOrelMarkdown(raw: string, withAnchors = false): ParseResult {
  const lines = raw.split('\n')
  const out: string[] = []
  const headings: DocHeading[] = []

  let i = 0
  let inList = false
  let inCode = false
  let codeLines: string[] = []

  const closeList = () => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  const makeHeading = (level: 1 | 2 | 3, text: string) => {
    const tag = `h${level}`
    const cls = `orm-h${level}`
    if (withAnchors) {
      const id = slugify(text)
      headings.push({ id, text, level })
      return `<${tag} id="${id}" class="${cls}">${parseInline(text)}</${tag}>`
    }
    return `<${tag} class="${cls}">${parseInline(text)}</${tag}>`
  }

  while (i < lines.length) {
    const line = lines[i]

    // ── Code block ─────────────────────────────────────────────────────────
    if (line.trimStart().startsWith('```')) {
      if (inCode) {
        out.push(`<pre class="orm-pre"><code>${codeLines.map(escapeHtml).join('\n')}</code></pre>`)
        codeLines = []
        inCode = false
      } else {
        closeList()
        inCode = true
      }
      i++
      continue
    }
    if (inCode) {
      codeLines.push(line)
      i++
      continue
    }

    // ── Headings ────────────────────────────────────────────────────────────
    const h3 = line.match(/^### (.+)/)
    if (h3) { closeList(); out.push(makeHeading(3, h3[1])); i++; continue }
    const h2 = line.match(/^## (.+)/)
    if (h2) { closeList(); out.push(makeHeading(2, h2[1])); i++; continue }
    const h1 = line.match(/^# (.+)/)
    if (h1) { closeList(); out.push(makeHeading(1, h1[1])); i++; continue }

    // ── Blockquote ──────────────────────────────────────────────────────────
    const bq = line.match(/^> (.+)/)
    if (bq) {
      closeList()
      out.push(`<blockquote class="orm-blockquote">${parseInline(bq[1])}</blockquote>`)
      i++
      continue
    }

    // ── List item ───────────────────────────────────────────────────────────
    const li = line.match(/^- (.+)/)
    if (li) {
      if (!inList) { out.push('<ul class="orm-list">'); inList = true }
      out.push(`<li>${parseInline(li[1])}</li>`)
      i++
      continue
    }

    // ── Empty line ──────────────────────────────────────────────────────────
    if (line.trim() === '') {
      closeList()
      out.push('<div class="orm-spacer"></div>')
      i++
      continue
    }

    // ── Paragraph ───────────────────────────────────────────────────────────
    closeList()
    out.push(`<p class="orm-p">${parseInline(line)}</p>`)
    i++
  }

  closeList()
  if (inCode && codeLines.length) {
    out.push(`<pre class="orm-pre"><code>${codeLines.map(escapeHtml).join('\n')}</code></pre>`)
  }

  return { html: out.join('\n'), headings }
}