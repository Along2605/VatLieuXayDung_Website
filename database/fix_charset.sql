-- ============================================================
-- fix_charset.sql — Sửa charset toàn bộ database về utf8mb4
--
-- Chạy nếu dữ liệu tiếng Việt vẫn bị mất dấu sau khi sửa db.js:
--   mysql -u sa -psapassword < fix_charset.sql
--
-- Giải thích:
--   - ALTER DATABASE: đổi charset mặc định cho database
--   - ALTER TABLE ... CONVERT: đổi charset cả bảng VÀ dữ liệu đang có
--   - Không làm mất dữ liệu
-- ============================================================

USE vlxd_db;

-- 1. Đổi charset database
ALTER DATABASE vlxd_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Đổi charset từng bảng và CONVERT dữ liệu đang có
ALTER TABLE products
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

ALTER TABLE categories
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

ALTER TABLE users
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

ALTER TABLE orders
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 3. Kiểm tra kết quả
SELECT
  TABLE_NAME,
  TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'vlxd_db';
