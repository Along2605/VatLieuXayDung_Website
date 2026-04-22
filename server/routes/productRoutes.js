// ============================================================
// server/routes/productRoutes.js
//
// Định nghĩa các endpoint cho sản phẩm.
// Mỗi route = HTTP method + đường dẫn + controller function
//
// Sơ đồ:
//   GET    /api/products        → getAll   (lấy tất cả, có filter)
//   GET    /api/products/:id    → getById  (lấy 1 sản phẩm)
//   POST   /api/products        → create   (thêm mới)
//   PUT    /api/products/:id    → update   (cập nhật)
//   DELETE /api/products/:id    → remove   (xóa)
// ============================================================

const express    = require('express');
const router     = express.Router(); // tạo router con (gắn vào app trong app.js)
const controller = require('../controllers/productController');

router.get   ('/',    controller.getAll);   // GET    /api/products
router.get   ('/:id', controller.getById);  // GET    /api/products/5
router.post  ('/',    controller.create);   // POST   /api/products
router.put   ('/:id', controller.update);   // PUT    /api/products/5
router.delete('/:id', controller.remove);   // DELETE /api/products/5

module.exports = router;
