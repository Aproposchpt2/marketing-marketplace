'use strict';

const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'apply-marketplace-production-suite.cjs');
const runtimePath = path.join(__dirname, '.apply-marketplace-production-suite-runtime.cjs');
let source = fs.readFileSync(sourcePath, 'utf8');

const before = `const prefix = html.slice(0, heroEnd + '</section>'.length);\nhtml = prefix + '\\n' + suite + '\\n' + html.slice(footerStart);`;
const after = `const finalHeroStart = html.indexOf('<section class="hero"');\nif (finalHeroStart < 0) throw new Error('[marketplace-suite] final hero not found after style injection');\nconst finalHeroEnd = html.indexOf('</section>', finalHeroStart);\nif (finalHeroEnd < 0) throw new Error('[marketplace-suite] final hero closing tag not found after style injection');\nconst finalFooterStart = html.indexOf('<footer class="cca-footer">', finalHeroEnd);\nif (finalFooterStart < 0) throw new Error('[marketplace-suite] final footer not found after style injection');\nconst prefix = html.slice(0, finalHeroEnd + '</section>'.length);\nhtml = prefix + '\\n' + suite + '\\n' + html.slice(finalFooterStart);`;

if (!source.includes(before)) {
  throw new Error('[marketplace-suite-runner] expected homepage boundary block not found');
}
source = source.replace(before, after);
fs.writeFileSync(runtimePath, source, 'utf8');
try {
  require(runtimePath);
} finally {
  if (fs.existsSync(runtimePath)) fs.unlinkSync(runtimePath);
}
