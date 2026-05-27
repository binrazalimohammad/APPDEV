/**
 * Generates docs/dfd-level1-binrazali.pdf — Level 1 DFD for BinRazali / CasaClick.
 * Run: npm run dfd-pdf
 */
const fs = require('fs');
const path = require('path');

let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch {
  PDFDocument = require(path.join(__dirname, '..', 'dfd-mobile-web', 'node_modules', 'pdfkit'));
}

const outDir = path.join(__dirname, '..', 'docs');
const outFile = path.join(outDir, 'dfd-level1-binrazali.pdf');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const doc = new PDFDocument({
  size: 'A4',
  layout: 'landscape',
  margins: { top: 36, bottom: 36, left: 36, right: 36 },
});

const stream = fs.createWriteStream(outFile);
doc.pipe(stream);
stream.on('finish', () => console.log(`Wrote ${outFile}`));

const today = new Date().toISOString().slice(0, 10);

function drawEntity(x, y, w, h, lines) {
  doc.lineWidth(1).rect(x, y, w, h).stroke();
  doc.font('Helvetica-Bold').fontSize(8);
  const text = Array.isArray(lines) ? lines.join('\n') : lines;
  doc.text(text, x + 4, y + (h - 8 * (text.split('\n').length)) / 2, {
    width: w - 8,
    align: 'center',
  });
}

function drawProcess(cx, cy, r, id, lines) {
  doc.lineWidth(1).circle(cx, cy, r).stroke();
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text(id, cx - r, cy - r - 14, { width: r * 2, align: 'center' });
  doc.font('Helvetica').fontSize(7);
  const text = Array.isArray(lines) ? lines.join('\n') : lines;
  doc.text(text, cx - r + 2, cy - 6, { width: r * 2 - 4, align: 'center', lineGap: 1 });
}

function drawStore(x, y, w, h, id, label) {
  const gap = 10;
  doc.lineWidth(1);
  doc.moveTo(x + gap, y).lineTo(x + w, y).stroke();
  doc.moveTo(x + gap, y + h).lineTo(x + w, y + h).stroke();
  doc.moveTo(x + gap, y).lineTo(x + gap, y + h).stroke();
  doc.moveTo(x + w, y).lineTo(x + w, y + h).stroke();
  doc.font('Helvetica-Bold').fontSize(8).text(id, x, y - 11, { width: w, align: 'center' });
  doc.font('Helvetica').fontSize(7).text(label, x + gap + 2, y + 4, { width: w - gap - 4, align: 'center' });
}

function arrow(x1, y1, x2, y2, label) {
  doc.lineWidth(0.6).strokeColor('#222222');
  doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  const L = 7;
  doc
    .moveTo(x2, y2)
    .lineTo(x2 - L * Math.cos(a - 0.45), y2 - L * Math.sin(a - 0.45))
    .moveTo(x2, y2)
    .lineTo(x2 - L * Math.cos(a + 0.45), y2 - L * Math.sin(a + 0.45))
    .stroke();
  if (label) {
    doc.font('Helvetica').fontSize(6).fillColor('#333333');
    doc.text(label, (x1 + x2) / 2 - 30, (y1 + y2) / 2 - 12, { width: 60, align: 'center' });
    doc.fillColor('#000000');
  }
  doc.strokeColor('#000000');
}

function dashedRect(x, y, w, h, label) {
  doc.save();
  doc.dash(4, { space: 3 });
  doc.lineWidth(1).rect(x, y, w, h).stroke();
  doc.restore();
  if (label) {
    doc.font('Helvetica-Bold').fontSize(9).text(label, x + 8, y + 6);
  }
}

// —— Page 1: Title ——
doc.font('Helvetica-Bold').fontSize(22).text('Data Flow Diagram — Level 1', { align: 'center' });
doc.moveDown(0.4);
doc
  .font('Helvetica')
  .fontSize(13)
  .text('BinRazali (CasaClick Mobile) — Property Rental Platform', { align: 'center' });
doc.fontSize(10).fillColor('#444444').text(`Generated ${today}`, { align: 'center' });
doc.fillColor('#000000');
doc.moveDown(1.2);
doc.font('Helvetica').fontSize(11);
doc.text(
  [
    'Scope: React Native mobile app (BinRazali) + Symfony REST API (Railway) + MySQL.',
    'Level 1 decomposes the system into authentication, listings, applications, payments,',
    'and notification/sync processes with five logical data stores.',
    '',
    'See also: docs/DFD_LEVEL1_BINRAZALI.md and docs/API.md',
  ].join('\n'),
  { align: 'left', lineGap: 4 },
);

doc.addPage();

// —— Page 2: Diagram (landscape) ——
const W = doc.page.width;
const H = doc.page.height;
doc.font('Helvetica-Bold').fontSize(14).text('Figure 1 — DFD Level 1', 36, 28);

dashedRect(155, 52, W - 155 - 36, H - 52 - 36, 'CasaClick Backend (Symfony API + MySQL)');

// External entities
drawEntity(36, 70, 95, 42, ['E1', 'Tenant']);
drawEntity(36, 200, 95, 42, ['E2', 'Landlord']);
drawEntity(36, 330, 95, 42, ['E3', 'Google', 'OAuth']);
drawEntity(W - 36 - 95, 70, 95, 42, ['E5', 'Admin /', 'Staff (Web)']);
drawEntity(W - 36 - 95, 280, 95, 48, ['E4', 'Paymongo', 'Gateway']);

// Processes
drawProcess(280, 155, 42, 'P1.0', ['Authenticate &', 'Register']);
drawProcess(430, 155, 42, 'P2.0', ['Listings &', 'Discovery']);
drawProcess(580, 155, 42, 'P3.0', ['Rental', 'Applications']);
drawProcess(430, 300, 42, 'P4.0', ['Payment', 'Processing']);
drawProcess(280, 300, 42, 'P5.0', ['Notifications', '& Sync']);

// Data stores
drawStore(215, 215, 88, 36, 'D1', 'Users');
drawStore(395, 215, 88, 36, 'D2', 'Listings');
drawStore(535, 215, 88, 36, 'D3', 'Applications');
drawStore(395, 365, 88, 36, 'D4', 'Payments');
drawStore(215, 365, 88, 36, 'D5', 'Notifications');

// Flows: actors → processes
arrow(131, 91, 238, 140, 'login / register');
arrow(131, 221, 238, 175, 'landlord actions');
arrow(131, 351, 250, 175, 'idToken');
arrow(W - 131, 94, 622, 140, 'admin CRUD');
arrow(W - 131, 304, 472, 300, 'checkout / webhook');

// Processes ↔ stores
arrow(280, 197, 259, 215, 'user R/W');
arrow(430, 197, 439, 215, 'listing R/W');
arrow(580, 197, 579, 215, 'app R/W');
arrow(430, 342, 439, 365, 'payment R/W');
arrow(280, 342, 259, 365, 'notify R/W');

// Cross-process (simplified)
arrow(322, 155, 388, 155, '');
arrow(472, 155, 538, 155, '');
arrow(430, 197, 430, 258, '');
arrow(322, 300, 388, 300, 'events');

// Outputs to actors
arrow(238, 170, 131, 100, 'JWT / profile');
arrow(472, 140, 131, 110, 'listings JSON');
arrow(538, 170, 131, 230, 'application status');
arrow(472, 285, 131, 250, 'payment status');
arrow(238, 310, 131, 320, 'notifications');

doc.font('Helvetica').fontSize(7).fillColor('#555555');
doc.text(
  'Notation: rectangles = external entities; circles = processes; open-ended boxes = data stores; arrows = labeled data flows.',
  36,
  H - 28,
  { width: W - 72, align: 'center' },
);
doc.fillColor('#000000');

doc.addPage();

// —— Page 3: Tables ——
doc.font('Helvetica-Bold').fontSize(14).text('Process & data store specification');
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(9);

const spec = [
  ['P1.0 Authenticate & Register', 'POST /api/login_check, /api/mobile/register, /api/auth/google → JWT'],
  ['P2.0 Listings & Discovery', 'GET /api/mobile/listings, /listings/{id}, /my-listings, /categories'],
  ['P3.0 Rental Applications', 'POST apply, GET /api/mobile/applications'],
  ['P4.0 Payment Processing', 'GET/POST payments, Paymongo checkout + webhook'],
  ['P5.0 Notifications & Sync', 'GET /notifications, /sync/revision; optional WS (dev)'],
  ['D1 Users', 'MySQL: user accounts, roles, credentials'],
  ['D2 Listings', 'MySQL: properties, categories, media paths'],
  ['D3 Applications', 'MySQL: tenant applications and status'],
  ['D4 Payments', 'MySQL: payment records, gateway refs'],
  ['D5 Notifications', 'MySQL: notification rows per user'],
];

spec.forEach(([name, desc]) => {
  doc.font('Helvetica-Bold').text(name, { continued: false });
  doc.font('Helvetica').text(`  ${desc}`, { lineGap: 2 });
  doc.moveDown(0.25);
});

doc.moveDown(0.5);
doc.font('Helvetica-Bold').fontSize(11).text('Mobile client');
doc.font('Helvetica').fontSize(9).text(
  'BinRazali React Native app (com.binrazali) — UI layer for E1 Tenant and E2 Landlord; calls HTTPS API at PRODUCTION_API_ORIGIN (Railway).',
  { lineGap: 3 },
);

doc.end();
