/**
 * DFD Level 1 — Auto-generated end-user documentation artifact (Module 6 offline output).
 * Builds /docs/user-guide.pdf using PDFKit (no external browser).
 *
 * Run from repo: npm install (in dfd-mobile-web) && npm run guide
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const today = new Date().toISOString().slice(0, 10);

const outDir = path.join(__dirname, '..', 'docs');
const outFile = path.join(outDir, 'user-guide.pdf');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const doc = new PDFDocument({ size: 'A4', margins: { top: 56, bottom: 56, left: 48, right: 48 } });
doc.pipe(fs.createWriteStream(outFile));

doc.on('finish', () => {
  console.log(`Wrote ${outFile}`);
});

function heading(text, level = 1) {
  doc.moveDown(level === 1 ? 1 : 0.6);
  doc
    .font('Helvetica-Bold')
    .fontSize(level === 1 ? 18 : level === 2 ? 14 : 12)
    .text(text, { align: 'left' });
  doc.font('Helvetica').fontSize(11);
  doc.moveDown(0.35);
}

function paragraph(lines) {
  const t = Array.isArray(lines) ? lines.join('\n') : String(lines);
  doc.text(t, { align: 'left', lineGap: 3 });
}

// 1. Cover
heading('DFD Field Report System', 1);
doc.fontSize(12).text('Mobile-Compatible Web Application', { align: 'left' });
doc.moveDown();
doc.font('Helvetica').fontSize(11).text(`Version 1.0\nDate: ${today}`);
doc.addPage();

// 2. TOC
heading('Table of Contents', 1);
paragraph([
  '1. System Overview',
  '2. Hardware Requirements',
  '3. Software Requirements',
  '4. Installation / Access Guide',
  '5. User Roles',
  '6. Step-by-Step Usage Guide',
  '7. DFD Level 1 — Educational grading reference + prototype mapping',
  '8. Troubleshooting',
  '9. Contact / Support',
]);
doc.addPage();

heading('1. System Overview', 1);
paragraph([
  'The DFD Field Report system guides a mobile user through a clear Level 1 data flow: the actor ',
  'submits validated input, data is stored relationally, server processes retrieve records with ',
  'role-based rules, and a structured JSON dashboard is rendered in the browser with optional PDF ',
  'export.',
]);
doc.addPage();

heading('2. Hardware Requirements', 1);
paragraph([
  '• Mobile device: Android 8.0+ or iOS 13+',
  '• Minimum RAM: 2 GB',
  '• Internet: 3G / 4G / Wi‑Fi',
  '• Minimum resolution: 360×640',
  '• Free storage: at least 50 MB for browser cache and downloads',
]);
doc.addPage();

heading('3. Software Requirements', 1);
paragraph([
  '• Modern mobile browser: Safari (iOS), Chrome (Android)',
  '• Backend: Node.js 18+ with Express (REST + JWT)',
  '• Database: MySQL 8+',
  '• Client: React (Vite build) with Tailwind CSS',
]);

heading('4. Installation / Access Guide', 1);
paragraph([
  '1) Install Node.js and MySQL on a workstation or server.',
  '2) Import database/schema.sql.',
  '3) Configure server/.env from server/.env.example (DB + JWT secret).',
  '4) Run npm install && npm run seed inside /server, then npm run dev.',
  '5) Run npm install && npm run dev inside /client.',
  '6) From your phone, browse to http://<computer-ip>:5173 on the same LAN (or HTTPS host in production).',
]);
doc.addPage();

heading('5. User Roles', 1);
paragraph([
  'Admin: can see all field reports and all activity logs tied to the datastore.',
  'Regular user: can create and manage their own reports; sees only their audit log entries.',
]);

heading('6. Step-by-Step Usage Guide', 1);
paragraph([
  'Step 1 — Open the app URL in your mobile browser.',
  'Step 2 — Register or sign in with email + password (JWT session).',
  'Step 3 — On Home, fill the field report form (title, category, description, priority, status).',
  '   [Screenshot placeholder: input form on iPhone SE viewport]',
  'Step 4 — Tap Submit; the server validates and stores the record, writing an activity_logs row.',
  'Step 5 — Open Results to view cards + table sorting (business rules).',
  'Step 6 — Tap Export PDF to generate a handset-friendly report.',
]);
doc.addPage();

heading('7. DFD Level 1 — Educational grading reference', 1);
paragraph([
  'Structured from the printed coursework figure (Educational Management & Grading):',
  'Instructor, Student, and Administrator as external entities;',
  'processes P3–P19; data stores D1–D16; outputs on the diagram right side.',
  'Full scan: docs/educational-dfd-level1-reference.png',
]);
doc.moveDown(0.2);

heading('7.A Processes P3–P19', 2);
doc.fontSize(9);
paragraph([
  'P3 Login · P4 Add Teaching Load · P5 Teaching Load Details · P6 Grading Composition ·',
  'P7 Base Grade · P8 View Class Record · P9 Add Activity · P10 Record Score ·',
  'P11 Calculate Grade · P12 Record Attendance · P13 Enter Class Record ·',
  'P14 User Account Mgmt · P15 System Logs · P16 Teaching Load Mgmt ·',
  'P17 Subjects Mgmt · P18 Course Mgmt · P19 Roles Mgmt',
]);
doc.fontSize(11);

heading('7.B Data stores D1–D16', 2);
doc.fontSize(9);
paragraph([
  'D1 Users · D2 Roles · D3 Teachers · D4 Semester · D5 Students · D6 Subjects ·',
  'D7 Teaching Loads · D8 TL Details · D9 Grade Category · D10 Grading Composition ·',
  'D11 Grade Base · D12 Grading · D13 Term · D14 Grading Detail ·',
  'D15 Enrollments · D16 Courses',
]);
doc.fontSize(11);

heading('7.C Key inputs (actors → processes)', 2);
doc.fontSize(9);
paragraph([
  'Instructor: credentials→P3; weights→P6; base grade→P7; activity→P9; student score→P10.',
  'Student: scan ID→P12; class QR→P13.',
  'Administrator: users→P14; teaching load→P16; subjects→P17; courses→P18; roles→P19.',
]);
doc.fontSize(11);

heading('7.D Outputs (views / reports)', 2);
doc.fontSize(9);
paragraph([
  'View User Details · View Teaching Loads / Details · View Class Record · Recorded Score ·',
  'Student grade per Term & Semester · Enrolled Subject · Student/Teacher Lists · Report ·',
  'Teaching Load List · Subjects List · Course List',
]);
doc.fontSize(11);

doc.addPage();

heading('7.E Reference flow — ASCII overview', 2);
doc.fontSize(8.5);
paragraph(
  [
    '   +-------------+  +-------------+  +-----------------+',
    '   | Instructor |  |  Student    |  | Administrator    |',
    '   +-----+------+  +------+------+  +---------+-------+',
    '         |                |                    |',
    '         +----------------+--------------------+',
    '                          v',
    '                 +------------------------+',
    '                 | P3–P19 Processes       |',
    '                 | (login, grading pipeline,|',
    '                 | attendance, admin ops)   |',
    '                 +-----------+------------+',
    '                             |',
    '                             v',
    '                 +-----------+------------+',
    '                 | Data stores D1–D16      |',
    '                 +-----------+------------+',
    '                             |',
    '                             v',
    '                 +-----------+------------+',
    '                 | Outputs: grades, lists |',
    '                 | reports, class views   |',
    '                 +------------------------+',
    '',
    'Central logic: P11 Calculate Grade uses D9–D14 with recorded scores (P10)',
    'and composition/base (P6/P7). Administration uses P14–P19 to maintain D1–D8,D16.',
  ].join('\n'),
);
doc.fontSize(11);

heading('7.F Simplified running prototype (this codebase)', 2);
doc.fontSize(9);
paragraph(
  [
    '[ Mobile actor ] -> [ P1 Validate REST ] -> [ MySQL: users, records, activity_logs ]',
    '                        |                          ^',
    '                        v                          |',
    '                 [ P2 Retrieve + rules ] -----------|',
    '                        |',
    '                        v',
    '                 [ P3 Dashboard JSON + PDF export ]',
  ].join('\n'),
);
doc.fontSize(11);

heading('8. Troubleshooting', 1);
paragraph([
  '• Cannot login: verify API health (/api/health) and MySQL credentials in server/.env.',
  '• CORS failures: CLIENT_URL must match the origin you type in the mobile browser.',
  '• Empty dashboard after submit: refresh; ensure token still valid (JWT expiry).',
  '• Blank PDF export: populate data on Results screen first.',
]);

heading('9. Contact / Support', 1);
paragraph(['Support Email: support@dfd-field-report.local', 'Knowledge base: README.md inside /dfd-mobile-web']);

doc.end();
