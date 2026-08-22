'use strict';
const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

if (!html.includes('G-FGJG583DTL')) {
  const tag = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FGJG583DTL"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-FGJG583DTL');
</script>`;
  if (!html.includes('<head>')) throw new Error('[marketplace-analytics] head marker missing');
  html = html.replace('<head>', `<head>\n${tag}`);
}

fs.writeFileSync(file, html, 'utf8');
console.log('[marketplace-analytics] Google Analytics preserved without changing homepage presentation');
