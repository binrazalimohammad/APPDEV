/**
 * Generates PDF deliverables for rubric:
 * - docs/user-guide-mobile.pdf
 * - docs/technical-documentation.pdf
 * - docs/presentation.pdf
 *
 * Source is Markdown-ish files under docs/*.md (rendered as wrapped text).
 */
const fs = require('fs');
const path = require('path');

let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch {
  PDFDocument = require(path.join(__dirname, '..', 'dfd-mobile-web', 'node_modules', 'pdfkit'));
}

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'docs');

function readText(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function normalize(text) {
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function writePdf({ title, subtitle, body, outFile }) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'portrait',
    margins: { top: 48, bottom: 48, left: 48, right: 48 },
  });

  const stream = fs.createWriteStream(outFile);
  doc.pipe(stream);

  const today = new Date().toISOString().slice(0, 10);

  doc.font('Helvetica-Bold').fontSize(18).text(title, { align: 'left' });
  if (subtitle) {
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(11).fillColor('#444444').text(subtitle, { align: 'left' });
    doc.fillColor('#000000');
  }
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(9).fillColor('#666666').text(`Generated ${today}`, {
    align: 'left',
  });
  doc.fillColor('#000000');
  doc.moveDown(1);

  const lines = normalize(body).split('\n');
  doc.font('Helvetica').fontSize(10);
  for (const line of lines) {
    const heading = /^#{1,6}\s+/.test(line);
    if (heading) {
      doc.moveDown(0.4);
      doc.font('Helvetica-Bold').fontSize(12).text(line.replace(/^#{1,6}\s+/, ''));
      doc.font('Helvetica').fontSize(10);
      continue;
    }
    if (line.trim().length === 0) {
      doc.moveDown(0.4);
      continue;
    }
    doc.text(line, { width: doc.page.width - 96, lineGap: 2 });
  }

  doc.end();

  return new Promise(resolve => {
    stream.on('finish', () => resolve());
  });
}

async function main() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  await writePdf({
    title: 'User Guide (Mobile)',
    subtitle: 'BinRazali / CasaClick',
    body: readText('docs/USER_GUIDE_MOBILE.md'),
    outFile: path.join(outDir, 'user-guide-mobile.pdf'),
  });

  await writePdf({
    title: 'Technical Documentation',
    subtitle: 'BinRazali / CasaClick',
    body: [
      readText('docs/TECHNICAL_DOCUMENTATION.md'),
      '\n\n',
      '---\n',
      normalize(readText('docs/SYSTEM_REQUIREMENTS_SOFTWARE.md')),
      '\n\n',
      normalize(readText('docs/SYSTEM_REQUIREMENTS_HARDWARE.md')),
      '\n\n',
      normalize(readText('docs/SECURITY_NOTES.md')),
      '\n\n',
      normalize(readText('docs/PERFORMANCE_NOTES.md')),
    ].join(''),
    outFile: path.join(outDir, 'technical-documentation.pdf'),
  });

  await writePdf({
    title: 'Presentation Slides (PDF Export)',
    subtitle: 'BinRazali / CasaClick',
    body: readText('docs/PRESENTATION_SLIDES.md'),
    outFile: path.join(outDir, 'presentation.pdf'),
  });

  console.log('Wrote docs/user-guide-mobile.pdf');
  console.log('Wrote docs/technical-documentation.pdf');
  console.log('Wrote docs/presentation.pdf');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

