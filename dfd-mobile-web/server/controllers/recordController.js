/**
 * DFD Level 1 — Process 1 (input) + data store persistence for records.
 * Server-side validation → sanitized insert/update/delete + logging.
 */
const { validationResult } = require('express-validator');
const Record = require('../models/Record');

async function listRecords(req, res) {
  try {
    const records = await Record.listRecordsForActor({
      actorId: req.user.id,
      role: req.user.role,
    });
    return res.json({ success: true, data: records });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || 'Server error' });
  }
}

async function createRecord(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(er => ({ field: er.path, message: er.msg })),
    });
  }
  const { title, category, description, priority, status } = req.body;
  try {
    const row = await Record.createRecord({
      userId: req.user.id,
      title,
      category,
      description: description ?? null,
      priority: priority || 'medium',
      status: status || 'submitted',
    });
    return res.status(201).json({ success: true, data: row });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || 'Server error' });
  }
}

async function getRecord(req, res) {
  const id = Number(req.params.id);
  const row = await Record.findRecordById(id);
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  if (req.user.role !== 'admin' && Number(row.userId) !== Number(req.user.id)) {
    return res.status(403).json({ success: false, error: 'Not allowed to view this record' });
  }
  return res.json({ success: true, data: row });
}

async function patchRecord(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const allowed = ['title', 'category', 'description', 'priority', 'status'];
  const hasField = allowed.some(k => Object.prototype.hasOwnProperty.call(req.body, k));
  if (!hasField) {
    return res.status(400).json({ success: false, error: 'No updatable fields provided' });
  }
  try {
    const row = await Record.updateRecord({
      id: Number(req.params.id),
      actorId: req.user.id,
      role: req.user.role,
      patch: req.body,
    });
    if (!row) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: row });
  } catch (e) {
    if (e.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, error: 'Not allowed' });
    }
    return res.status(500).json({ success: false, error: e.message || 'Server error' });
  }
}

async function removeRecord(req, res) {
  try {
    const ok = await Record.deleteRecord({
      id: Number(req.params.id),
      actorId: req.user.id,
      role: req.user.role,
    });
    if (!ok) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: { deleted: true } });
  } catch (e) {
    if (e.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, error: 'Not allowed' });
    }
    return res.status(500).json({ success: false, error: e.message || 'Server error' });
  }
}

async function listLogs(req, res) {
  const limit = req.query.limit;
  try {
    const logs = await Record.listLogs({
      actorId: req.user.id,
      role: req.user.role,
      limit,
    });
    return res.json({ success: true, data: logs });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || 'Server error' });
  }
}

module.exports = {
  listRecords,
  createRecord,
  getRecord,
  patchRecord,
  removeRecord,
  listLogs,
};
