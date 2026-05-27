/**
 * DFD Level 1 — Process 2 (retrieval + business rules) and Process 3 (output generation).
 * Aggregates from the data store into a display-ready / export-friendly structure.
 */
const Record = require('../models/Record');

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

function buildDashboardPayload(records) {
  const total = records.length;
  const byStatus = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const byPriority = records.reduce((acc, r) => {
    acc[r.priority] = (acc[r.priority] || 0) + 1;
    return acc;
  }, {});

  const needsAttention = records.filter(
    r => r.status === 'submitted' && (r.priority === 'high' || r.priority === 'medium'),
  ).length;

  const cards = [
    { id: 'total', label: 'Total records', value: String(total), hint: 'In your current view' },
    {
      id: 'attention',
      label: 'Needs review',
      value: String(needsAttention),
      hint: 'Submitted + medium/high priority',
    },
    {
      id: 'reviewed',
      label: 'Reviewed',
      value: String(byStatus.reviewed || 0),
      hint: 'Closed loop items',
    },
  ];

  const table = records.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category,
    priority: r.priority,
    priorityScore: PRIORITY_WEIGHT[r.priority] || 0,
    status: r.status,
    owner: r.ownerName || r.ownerEmail,
    updatedAt: r.updatedAt,
    createdAt: r.createdAt,
  }));

  table.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: { total, byStatus, byPriority },
    cards,
    table,
  };
}

async function dashboard(req, res) {
  try {
    const records = await Record.listRecordsForActor({
      actorId: req.user.id,
      role: req.user.role,
    });
    const payload = buildDashboardPayload(records);
    return res.json({ success: true, data: payload });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || 'Server error' });
  }
}

module.exports = { dashboard, buildDashboardPayload };
