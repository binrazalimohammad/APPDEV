/**
 * Builds a standalone PDF of the Level 1 Data Flow Diagram — embeds the reference PNG
 * (educational management & grading) plus a short captions page with ASCII fallback.
 *
 * Run: npm run dfd-pdf   (from dfd-mobile-web)
 * Output: docs/dfd-level1-diagram.pdf
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outDir = path.join(__dirname, '..', 'docs');
const pngPath = path.join(outDir, 'educational-dfd-level1-reference.png');
const outFile = path.join(outDir, 'dfd-level1-diagram.pdf');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const doc = new PDFDocument({
  size: 'A4',
  layout: 'portrait',
  margins: { top: 42, bottom: 42, left: 42, right: 42 },
});

doc.pipe(fs.createWriteStream(outFile));
doc.on('finish', () => {
  console.log(`Wrote ${outFile}`);
});

const today = new Date().toISOString().slice(0, 10);

// Cover
doc.font('Helvetica-Bold').fontSize(20).text('Data Flow Diagram — Level 1', {
  align: 'center',
});
doc.moveDown(0.35);
doc
  .font('Helvetica')
  .fontSize(12)
  .text('Educational Management & Grading System\n(Reference diagram)', {
    align: 'center',
  });
doc.fontSize(10).fillColor('#555555').text(`Generated ${today}`, { align: 'center' });
doc.fillColor('#000000');
doc.moveDown(1);

// Embedded diagram (scales to page)
if (!fs.existsSync(pngPath)) {
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Diagram image missing', { align: 'left' });
  doc.font('Helvetica').fontSize(11).text(
    `Expected file:\n${pngPath}\n\nCopy your printed DFD photo into docs/educational-dfd-level1-reference.png then run npm run dfd-pdf again.`,
    { align: 'left', lineGap: 4 },
  );
} else {
  const usableW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const maxH = doc.page.height - doc.y - doc.page.margins.bottom;
  doc.image(pngPath, doc.page.margins.left, doc.y, {
    fit: [usableW, Math.max(maxH, 200)],
    align: 'center',
  });
}

doc.addPage();

doc.font('Helvetica-Bold').fontSize(14).text('DFD caption (structure summary)');
doc.moveDown(0.4);
doc.font('Helvetica').fontSize(10);
doc.text(
  [
    'External entities: Instructor, Student, Administrator.',
    'Processes: P3 Login through P19 Roles Management.',
    'Data stores: D1 Users … D16 Courses.',
    'Outputs include class records, grade views (term/semester), lists, and admin reports.',
    '',
    'For full bubble list and flows, open docs/DFD_LEVEL1_REFERENCE_GRADING_SYSTEM.md',
  ].join('\n'),
  { lineGap: 3 },
);

doc.fontSize(9).fillColor('#333333').text('\nASCII outline:\n');
doc.font('Courier').fillColor('#000000');
doc.text(
  [
    '[ Instructor | Student | Administrator ]',
    '        |               |               |',
    '        +-------+-------+-------+--------+',
    '                |',
    '                v',
    '           [ P3 - P19 ]',
    '                |',
    '                v',
    '           [ D1 - D16 ]',
    '                |',
    '                v',
    '           [ Views / Reports ]',
  ].join('\n'),
  { lineGap: 2 },
);

doc.end();
