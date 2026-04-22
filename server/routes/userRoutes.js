// ============================================================
// server/routes/userRoutes.js
//
// Sơ đồ:
//   GET   /api/users              → getAll       (danh sách user)
//   GET   /api/users/:id          → getById      (1 user)
//   PATCH /api/users/:id/grant    → grantAdmin   (cấp admin)
//   PATCH /api/users/:id/revoke   → revokeAdmin  (thu hồi admin)
// ============================================================

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/userController');

router.get  ('/',              controller.getAll);
router.get  ('/:id',           controller.getById);
router.patch('/:id/grant',     controller.grantAdmin);
router.patch('/:id/revoke',    controller.revokeAdmin);

module.exports = router;
