/**
 * DFD Level 1 — Data store access: `records` (business submissions) and `activity_logs`.
 * Records are written after Process 1; read/transformed in Process 2; surfaced in Process 3.
 */
const { getPool } = require('../config/db');

async function insertActivityLog({ userId, recordId, action, details }) {
  await getPool().query(
    `INSERT INTO activity_logs (user_id, record_id, action, details) VALUES (:userId, :recordId, :action, :details)`,
    {
      userId,
      recordId: recordId ?? null,
      action,
      details: details != null ? String(details) : null,
    },
  );
}

async function createRecord({ userId, title, category, description, priority, status }) {
  const [result] = await getPool().query(
    `INSERT INTO records (user_id, title, category, description, priority, status)
     VALUES (:userId, :title, :category, :description, :priority, :status)`,
    {
      userId,
      title: title.trim(),
      category: category.trim(),
      description: description != null ? description.trim() : null,
      priority,
      status,
    },
  );
  const id = result.insertId;
  await insertActivityLog({
    userId,
    recordId: id,
    action: 'RECORD_CREATE',
    details: JSON.stringify({ title }),
  });
  return findRecordById(id);
}

async function findRecordById(id) {
  const [rows] = await getPool().query(
    `SELECT r.id, r.user_id AS userId, r.title, r.category, r.description, r.priority, r.status,
            r.created_at AS createdAt, r.updated_at AS updatedAt,
            u.email AS ownerEmail, u.full_name AS ownerName
     FROM records r
     JOIN users u ON u.id = r.user_id
     WHERE r.id = :id LIMIT 1`,
    { id },
  );
  return rows[0] || null;
}

async function listRecordsForActor({ actorId, role }) {
  if (role === 'admin') {
    const [rows] = await getPool().query(
      `SELECT r.id, r.user_id AS userId, r.title, r.category, r.description, r.priority, r.status,
              r.created_at AS createdAt, r.updated_at AS updatedAt,
              u.email AS ownerEmail, u.full_name AS ownerName
       FROM records r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC`,
    );
    return rows;
  }
  const [rows] = await getPool().query(
    `SELECT r.id, r.user_id AS userId, r.title, r.category, r.description, r.priority, r.status,
            r.created_at AS createdAt, r.updated_at AS updatedAt,
            u.email AS ownerEmail, u.full_name AS ownerName
     FROM records r
     JOIN users u ON u.id = r.user_id
     WHERE r.user_id = :actorId
     ORDER BY r.created_at DESC`,
    { actorId },
  );
  return rows;
}

async function updateRecord({ id, actorId, role, patch }) {
  const existing = await findRecordById(id);
  if (!existing) return null;
  if (role !== 'admin' && Number(existing.userId) !== Number(actorId)) {
    const err = new Error('FORBIDDEN');
    throw err;
  }

  const fields = [];
  const params = { id };
  if (patch.title != null) {
    fields.push('title = :title');
    params.title = patch.title.trim();
  }
  if (patch.category != null) {
    fields.push('category = :category');
    params.category = patch.category.trim();
  }
  if (patch.description !== undefined) {
    fields.push('description = :description');
    params.description = patch.description == null ? null : patch.description.trim();
  }
  if (patch.priority != null) {
    fields.push('priority = :priority');
    params.priority = patch.priority;
  }
  if (patch.status != null) {
    fields.push('status = :status');
    params.status = patch.status;
  }
  if (!fields.length) return existing;

  await getPool().query(`UPDATE records SET ${fields.join(', ')} WHERE id = :id`, params);
  await insertActivityLog({
    userId: actorId,
    recordId: id,
    action: 'RECORD_UPDATE',
    details: JSON.stringify(patch),
  });
  return findRecordById(id);
}

async function deleteRecord({ id, actorId, role }) {
  const existing = await findRecordById(id);
  if (!existing) return false;
  if (role !== 'admin' && Number(existing.userId) !== Number(actorId)) {
    const err = new Error('FORBIDDEN');
    throw err;
  }
  await insertActivityLog({
    userId: actorId,
    recordId: id,
    action: 'RECORD_DELETE',
    details: JSON.stringify({ title: existing.title }),
  });
  const [res] = await getPool().query(`DELETE FROM records WHERE id = :id`, { id });
  return res.affectedRows > 0;
}

async function listLogs({ actorId, role, limit = 100 }) {
  const lim = Math.min(Math.max(Number(limit) || 100, 1), 500);
  if (role === 'admin') {
    const [rows] = await getPool().query(
      `SELECT l.id, l.user_id AS userId, l.record_id AS recordId, l.action, l.details,
              l.created_at AS createdAt,
              u.email AS actorEmail
       FROM activity_logs l
       JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC
       LIMIT ${lim}`,
    );
    return rows;
  }
  const [rows] = await getPool().query(
    `SELECT l.id, l.user_id AS userId, l.record_id AS recordId, l.action, l.details,
            l.created_at AS createdAt,
            u.email AS actorEmail
     FROM activity_logs l
     JOIN users u ON u.id = l.user_id
     WHERE l.user_id = :actorId
     ORDER BY l.created_at DESC
     LIMIT ${lim}`,
    { actorId },
  );
  return rows;
}

module.exports = {
  createRecord,
  findRecordById,
  listRecordsForActor,
  updateRecord,
  deleteRecord,
  listLogs,
};
