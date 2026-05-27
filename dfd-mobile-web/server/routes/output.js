/**
 * DFD Level 1 — HTTP routes for Process 2–3 (dashboard output generation).
 */
const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const outputController = require('../controllers/outputController');

const router = Router();

router.use(authRequired);
router.get('/dashboard', outputController.dashboard);

module.exports = router;
