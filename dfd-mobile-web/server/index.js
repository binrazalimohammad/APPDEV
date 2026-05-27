/**
 * DFD Level 1 — Express application entry: wires Actor (HTTP) ↔ Processes ↔ Database.
 * Modules:
 *  - /api/auth/* → Process 1 (credential validation)
 *  - /api/data/*  → Process 1 + data store (records CRUD, logs)
 *  - /api/output/* → Process 2–3 (aggregated dashboard JSON)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const outputRoutes = require('./routes/output');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DFD Mobile Web API', version: '1.0.0' });
});

/** Public download for the generated handbook (runs alongside DB; no auth). */
app.get('/docs/user-guide.pdf', (req, res) => {
  const filePath = path.join(__dirname, '..', 'docs', 'user-guide.pdf');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'PDF not generated yet. From dfd-mobile-web run: npm run guide',
    });
  }
  res.download(filePath, 'DFD-Field-Report-User-Guide-v1.pdf');
});

/** Standalone Level 1 DFD diagram PDF (embeds reference PNG). Run: npm run dfd-pdf */
app.get('/docs/dfd-level1-diagram.pdf', (req, res) => {
  const filePath = path.join(__dirname, '..', 'docs', 'dfd-level1-diagram.pdf');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'DFD PDF not generated yet. From dfd-mobile-web run: npm run dfd-pdf',
    });
  }
  res.download(filePath, 'dfd-level1-diagram.pdf');
});

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/output', outputRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
