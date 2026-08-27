/**
 * Document and PDF generation helper.
 */

export const docs = {
  pdf: async (config) => {
    const { title, theme = {}, pages = [] } = config;
    const primary = theme.primary || '#203354';
    const accent = theme.accent || '#b86a42';

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title || 'Book'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap');
    @page { size: letter; margin: 1.5in 1in; }
    body {
      font-family: 'Newsreader', Georgia, serif;
      color: #1c2434;
      line-height: 1.7;
      font-size: 14pt;
      margin: 0;
      padding: 24px;
      background: #faf8f5;
    }
    .page-break { page-break-after: always; break-after: page; }
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      min-height: 75vh;
      border-bottom: 2px solid ${accent};
      padding-bottom: 40px;
      margin-bottom: 40px;
    }
    h1, h2, h3 { font-family: 'Fraunces', serif; color: ${primary}; font-weight: 600; }
    h1.title { font-size: 32pt; margin-bottom: 8pt; line-height: 1.1; }
    p.subtitle { font-size: 16pt; color: ${accent}; font-style: italic; margin-bottom: 24pt; }
    .meta-item { font-size: 11pt; color: #64748b; margin: 4pt 0; }
    .chapter { margin-bottom: 36pt; }
    .chapter-title { font-size: 18pt; color: ${primary}; margin-bottom: 12pt; }
    .chapter-body { font-size: 13pt; line-height: 1.8; white-space: pre-wrap; color: #334155; }
    hr.divider { border: 0; height: 1px; background: #e2e8f0; margin: 30pt 0; }
    @media print {
      body { background: white; }
    }
  </style>
</head>
<body>
`;

    for (const page of pages) {
      if (page.sections) {
        for (const sec of page.sections) {
          if (sec.type === 'cover') {
            html += `<div class="cover">
              <h1 class="title">${sec.title || title}</h1>
              ${sec.subtitle ? `<p class="subtitle">${sec.subtitle}</p>` : ''}
              <div style="margin-top: 32pt;">
                ${(sec.meta || [])
                  .map((m) => `<p class="meta-item"><strong>${m.label}:</strong> ${m.value}</p>`)
                  .join('')}
              </div>
            </div>`;
          } else if (sec.type === 'pageBreak') {
            html += `<div class="page-break"></div>`;
          } else if (sec.type === 'heading') {
            const Tag = sec.level === 1 ? 'h1' : sec.level === 2 ? 'h2' : 'h3';
            html += `<${Tag} class="chapter-title">${sec.text}</${Tag}>`;
          } else if (sec.type === 'paragraph') {
            html += `<div class="chapter-body">${sec.text}</div>`;
          } else if (sec.type === 'divider') {
            html += `<hr class="divider" />`;
          } else if (sec.type === 'toc') {
            html += `<h2>${sec.title || 'Table of Contents'}</h2>`;
          }
        }
      }
    }

    html += `</body></html>`;
    return new Blob([html], { type: 'text/html' });
  },
};
