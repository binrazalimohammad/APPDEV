/**
 * DFD Level 1 — HTTP routes bound to Process 1 (record input) and data store CRUD.
 */
const { Router } = require('express');
const { body, param } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const { validationHandler } = require('../middleware/validate');
const recordController = require('../controllers/recordController');

const router = Router();

router.use(authRequired);

router.get('/records', recordController.listRecords);

router.post(
  '/records',
  [
    body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title 3–200 chars'),
    body('category').trim().isLength({ min: 2, max: 100 }).withMessage('Category required'),
    body('description').optional().isLength({ max: 5000 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['draft', 'submitted', 'reviewed']),
  ],
  validationHandler,
  recordController.createRecord,
);

router.get('/records/:id', param('id').isInt(), validationHandler, recordController.getRecord);

router.patch(
  '/records/:id',
  [
    param('id').isInt(),
    body('title').optional().trim().isLength({ min: 3, max: 200 }),
    body('category').optional().trim().isLength({ min: 2, max: 100 }),
    body('description').optional({ nullable: true }).isLength({ max: 5000 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['draft', 'submitted', 'reviewed']),
  ],
  validationHandler,
  recordController.patchRecord,
);

router.delete('/records/:id', param('id').isInt(), validationHandler, recordController.removeRecord);

router.get('/logs', recordController.listLogs);

module.exports = router;
