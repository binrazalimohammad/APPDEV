/**
 * DFD Level 1 — Data store: `activity_logs` entity (normalized audit table).
 *
 * Inserts are executed from `models/Record.js` (`insertActivityLog`) whenever a
 * record is created, updated, or deleted so Process 2 can replay activity history.
 * Keeping the physical SQL in one module avoids circular dependencies while still
 * documenting the third required relational table in the schema.
 */
module.exports = {
  tableName: 'activity_logs',
};
