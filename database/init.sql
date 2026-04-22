-- ============================================================
-- database/init.sql
-- Schema và dữ liệu cho dự án VLXD Đức Phiến
-- Chạy file này 1 lần để khởi tạo database:
--   mysql -u sa -psapassword < database/init.sql
-- ============================================================
-- Tạo database nếu chưa có, rồi chọn nó
CREATE DATABASE IF NOT EXISTS vlxd_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vlxd_db;

-- ============================================================
-- Bảng: categories (danh mục sản phẩm)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id      VARCHAR(50)  PRIMARY KEY,          -- VD: "xi-mang", "thep"
  label   VARCHAR(100) NOT NULL,             -- Tên hiển thị: "Xi Măng"
  icon    VARCHAR(50)  NOT NULL DEFAULT 'box' -- Bootstrap icon name
);

-- ============================================================
-- Bảng: products (sản phẩm)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  price       INT          NOT NULL,            -- Giá tính bằng VNĐ (không dùng DECIMAL vì không có xu)
  unit        VARCHAR(50)  NOT NULL,            -- túi, cây, m2...
  category    VARCHAR(50)   NULL,            -- khớp với categories.id
  img         VARCHAR(255) DEFAULT NULL,
  brand       VARCHAR(100) DEFAULT NULL,
  rating      DECIMAL(2,1) DEFAULT 4.5,
  reviews     INT          DEFAULT 0,
  sale        TINYINT(1)   DEFAULT 0,           -- 0 = false, 1 = true
  old_price   INT          DEFAULT NULL,        -- Giá gốc khi đang sale
  stock       INT          DEFAULT 0,
  description TEXT         DEFAULT NULL,        -- Mô tả (đặt tên 'description' tránh trùng từ khóa)
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  -- Ràng buộc: category phải tồn tại trong bảng categories
  FOREIGN KEY (category) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================
-- Bảng: users (tài khoản người dùng)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  full_name  VARCHAR(150) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,    -- UNIQUE: không cho trùng email
  phone      VARCHAR(20)  DEFAULT NULL,
  password   VARCHAR(255) NOT NULL,           -- Nên hash bằng bcrypt trong thực tế
  role       ENUM('customer','admin') DEFAULT 'customer',
  is_root    TINYINT(1)   DEFAULT 0,          -- 1 = root admin, không thể bị thu hồi
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INSERT: Dữ liệu categories
-- ============================================================
INSERT INTO categories (id, label, icon) VALUES
  ('all', 'Tất cả', 'grid'),
  ('xi-mang', 'Xi Măng', 'box'),
  ('thep', 'Thép & Sắt', 'tools'),
  ('gach', 'Gạch & Ngói', 'bricks'),
  ('son', 'Sơn', 'palette'),
  ('ve-sinh', 'Thiết bị vệ sinh', 'droplet'),
  ('ong-nuoc', 'Ống nước', 'pipe'),
  ('cat-da', 'Cát & Đá', 'bucket'),
  ('phu-kien', 'Phụ kiện', 'nut'),
  ('dien', 'Thiết bị điện', 'lightning-charge'),
  ('dung-cu', 'Dụng cụ', 'hammer'),
  ('noi-that', 'Nội thất', 'lamp');

-- ============================================================
-- INSERT: Dữ liệu products (212 sản phẩm)
-- ============================================================
INSERT INTO products (name, price, unit, category, img, brand, rating, reviews, sale, old_price, stock, description) VALUES
  ('Xi Măng Hà Tiên PCB40 – 50kg', 95000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Hà Tiên', 4.8, 482, 1, 110000, 200, 'Xi măng Hà Tiên PCB40 chất lượng cao, phù hợp xây dựng dân dụng và công nghiệp.'),
  ('Xi Măng INSEE PCB40 – 50kg', 98000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'INSEE', 4.6, 213, 0, NULL, 150, 'Xi măng INSEE nhập khẩu, độ bền cao, chống thấm tốt.'),
  ('Xi Măng Nghi Sơn PCB40 – 50kg', 92000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Nghi Sơn', 4.7, 356, 1, 105000, 180, 'Xi măng Nghi Sơn PCB40, độ mịn cao, phù hợp trộn bê tông.'),
  ('Xi Măng SCG PCB40 – 50kg', 105000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'SCG', 4.9, 289, 0, NULL, 120, 'Xi măng SCG cao cấp, ít tỏa nhiệt.'),
  ('Xi Măng Hà Tiên Xây Tô PCB30 – 50kg', 85000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Hà Tiên', 4.5, 421, 0, NULL, 250, 'Xi măng Hà Tiên chuyên dùng xây tô.'),
  ('Xi Măng Cẩm Phả PCB40 – 50kg', 88000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Cẩm Phả', 4.6, 167, 1, 98000, 140, 'Xi măng Cẩm Phả PCB40 chất lượng ổn định.'),
  ('Xi Măng Long Sơn PCB40 – 50kg', 90000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Long Sơn', 4.4, 98, 0, NULL, 95, 'Xi măng Long Sơn PCB40.'),
  ('Xi Măng Bỉm Sơn PCB40 – 50kg', 87000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Bỉm Sơn', 4.5, 134, 0, NULL, 160, 'Xi măng Bỉm Sơn PCB40.'),
  ('Thép Cuộn Hòa Phát CB240 Φ6 – 100kg', 2350000, 'cuộn', 'thep', 'thep-cuon-hoa-phat.png', 'Hòa Phát', 4.7, 318, 0, NULL, 50, 'Thép cuộn Hòa Phát CB240 Φ6.'),
  ('Thép Cây Việt Mỹ D10 – 11.7m', 185000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Việt Mỹ', 4.5, 142, 1, 210000, 300, 'Thép cây Việt Mỹ D10 chuẩn ASTM.'),
  ('Thép Cây Hòa Phát D12 CB300 – 11.7m', 245000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Hòa Phát', 4.8, 267, 0, NULL, 180, 'Thép cây Hòa Phát D12 CB300.'),
  ('Thép Cuộn Việt Mỹ CB240 Φ8 – 200kg', 4200000, 'cuộn', 'thep', 'thep-cuon-hoa-phat.png', 'Việt Mỹ', 4.6, 189, 1, 4600000, 35, 'Thép cuộn Việt Mỹ Φ8.'),
  ('Thép Cây Việt Nhật D16 CB400 – 11.7m', 480000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Việt Nhật', 4.7, 112, 0, NULL, 90, 'Thép cây Việt Nhật D16.'),
  ('Thép Cây Hòa Phát D8 CB240 – 11.7m', 125000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Hòa Phát', 4.5, 203, 0, NULL, 220, 'Thép cây Hòa Phát D8.'),
  ('Gạch Ốp Lát Prime 60x60 – Thùng', 320000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Prime', 4.9, 756, 0, NULL, 80, 'Gạch ốp lát Prime 60x60cm.'),
  ('Gạch Đỏ Đồng Tâm 6x9 – 100 viên', 55000, '100v', 'gach', 'gach-op-lat-prime.png', 'Đồng Tâm', 4.4, 94, 0, NULL, 500, 'Gạch đỏ Đồng Tâm 6x9cm.'),
  ('Gạch Ốp Lát Viglacera 60x60 Porcelain', 450000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Viglacera', 4.8, 512, 1, 520000, 65, 'Gạch lát Viglacera 60x60.'),
  ('Gạch Ốp Tường Đồng Tâm 30x60', 280000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Đồng Tâm', 4.6, 378, 0, NULL, 110, 'Gạch ốp tường Đồng Tâm 30x60.'),
  ('Gạch Lát Nền Prime 80x80', 550000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Prime', 4.7, 245, 0, NULL, 55, 'Gạch lát nền Prime 80x80.'),
  ('Gạch Xây Tuynel 2 Lỗ 8x8x19', 1800, 'viên', 'gach', 'gach-op-lat-prime.png', 'Đồng Tâm', 4.3, 67, 1, 2200, 1200, 'Gạch xây tuynel 2 lỗ.'),
  ('Sơn Nội Thất Jotun Majestic 5L', 680000, 'lon', 'son', 'son-jotun-majestic.png', 'Jotun', 4.8, 897, 1, 850000, 120, 'Sơn nội thất Jotun Majestic cao cấp.'),
  ('Sơn Ngoại Thất Dulux WeatherShield 5L', 790000, 'lon', 'son', 'son-jotun-majestic.png', 'Dulux', 4.7, 634, 0, NULL, 90, 'Sơn ngoại thất Dulux WeatherShield.'),
  ('Sơn Nội Thất Jotun Jotaplast 5L', 550000, 'lon', 'son', 'son-jotun-majestic.png', 'Jotun', 4.6, 312, 0, NULL, 140, 'Sơn nội thất Jotun Jotaplast.'),
  ('Sơn Ngoại Thất Jotun Jotashield 5L', 850000, 'lon', 'son', 'son-jotun-majestic.png', 'Jotun', 4.9, 456, 1, 980000, 75, 'Sơn ngoại thất Jotun Jotashield.'),
  ('Sơn Nội Thất Dulux Ambiance 5L', 720000, 'lon', 'son', 'son-jotun-majestic.png', 'Dulux', 4.7, 289, 0, NULL, 100, 'Sơn nội thất Dulux Ambiance.'),
  ('Sơn Ngoại Thất Kova 5L', 650000, 'lon', 'son', 'son-jotun-majestic.png', 'Kova', 4.5, 178, 0, NULL, 85, 'Sơn ngoại thất Kova.'),
  ('Bồn Cầu 1 Khối TOTO CS320DRW', 4200000, 'cái', 've-sinh', 'bon-cau-toto.png', 'TOTO', 4.6, 134, 0, NULL, 25, 'Bồn cầu một khối TOTO hiện đại.'),
  ('Lavabo Âm Bàn American Standard', 1250000, 'cái', 've-sinh', 'bon-cau-toto.png', 'Am. Std', 4.5, 88, 1, 1500000, 40, 'Lavabo âm bàn American Standard.'),
  ('Bồn Cầu 2 Khối Inax C-514VAN', 3200000, 'cái', 've-sinh', 'bon-cau-toto.png', 'Inax', 4.7, 201, 0, NULL, 30, 'Bồn cầu 2 khối Inax Aqua Ceramic.'),
  ('Lavabo Treo Tường TOTO', 980000, 'cái', 've-sinh', 'bon-cau-toto.png', 'TOTO', 4.6, 156, 1, 1200000, 50, 'Lavabo treo tường TOTO.'),
  ('Bồn Tắm TOTO 1.5m', 8500000, 'cái', 've-sinh', 'bon-cau-toto.png', 'TOTO', 4.8, 67, 0, NULL, 15, 'Bồn tắm TOTO composite.'),
  ('Vòi Lavabo Nóng Lạnh American Standard', 1450000, 'cái', 've-sinh', 'bon-cau-toto.png', 'Am. Std', 4.4, 92, 0, NULL, 60, 'Vòi lavabo nóng lạnh American Standard.'),
  ('Ống Nước PPR Tiền Phong Φ21 – 4m', 35000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Tiền Phong', 4.7, 520, 0, NULL, 1000, 'Ống PPR Tiền Phong Φ21 chịu nhiệt.'),
  ('Ống Nước PVC Bình Minh Φ60 – 4m', 65000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Bình Minh', 4.6, 310, 0, NULL, 600, 'Ống PVC Bình Minh Φ60.'),
  ('Ống PPR Tiền Phong Φ25 – 4m', 48000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Tiền Phong', 4.7, 289, 0, NULL, 800, 'Ống PPR Tiền Phong Φ25.'),
  ('Ống PVC Bình Minh Φ90 – 4m', 95000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Bình Minh', 4.5, 176, 1, 110000, 450, 'Ống PVC Bình Minh Φ90.'),
  ('Ống PPR Bình Minh Φ32 – 4m', 65000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Bình Minh', 4.6, 134, 0, NULL, 700, 'Ống PPR Bình Minh Φ32.'),
  ('Ống HDPE Tiền Phong Φ63', 120000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Tiền Phong', 4.8, 98, 0, NULL, 300, 'Ống HDPE Tiền Phong.'),
  ('Xi Măng Hoàng Thạch PCB40 – 50kg', 89500, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Hoàng Thạch', 4.6, 245, 0, NULL, 170, 'Xi măng Hoàng Thạch PCB40, chất lượng ổn định, phù hợp xây dựng dân dụng miền Bắc.'),
  ('Xi Măng Thăng Long PCB40 – 50kg', 87500, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Thăng Long', 4.5, 189, 1, 98000, 145, 'Xi măng Thăng Long PCB40, độ bền cao.'),
  ('Xi Măng Chinfon PCB40 – 50kg', 92500, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Chinfon', 4.7, 312, 0, NULL, 130, 'Xi măng Chinfon PCB40 nhập khẩu chất lượng cao.'),
  ('Xi Măng Bút Sơn PCB40 – 50kg', 91000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Bút Sơn', 4.6, 278, 0, NULL, 155, 'Xi măng Bút Sơn PCB40, độ mịn cao.'),
  ('Xi Măng Vicem Hoàng Mai PCB40 – 50kg', 88500, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Vicem', 4.5, 201, 1, 99000, 160, 'Xi măng Vicem Hoàng Mai PCB40.'),
  ('Thép Cây Pomina D10 – 11.7m', 198000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Pomina', 4.6, 178, 0, NULL, 250, 'Thép cây Pomina D10, chịu lực tốt.'),
  ('Thép Cuộn Hòa Phát CB240 Φ10 – 150kg', 3180000, 'cuộn', 'thep', 'thep-cuon-hoa-phat.png', 'Hòa Phát', 4.8, 265, 1, 3480000, 45, 'Thép cuộn Hòa Phát Φ10 dùng gia cố nền móng.'),
  ('Thép Cây Việt Ý D14 – 11.7m', 338000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Việt Ý', 4.5, 134, 0, NULL, 140, 'Thép cây Việt Ý D14 mác CB300.'),
  ('Thép Cây Pomina D12 – 11.7m', 245000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Pomina', 4.7, 156, 1, 275000, 180, 'Thép cây Pomina D12 chất lượng cao.'),
  ('Gạch Ốp Lát Taicera 60x60cm – Thùng', 385000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Taicera', 4.7, 423, 0, NULL, 75, 'Gạch lát nền Taicera 60x60, chống trơn.'),
  ('Gạch Không Nung AAC – 100 viên', 68000, '100v', 'gach', 'gach-op-lat-prime.png', 'Viglacera', 4.4, 98, 1, 79000, 650, 'Gạch bê tông khí chưng áp AAC, nhẹ và cách nhiệt.'),
  ('Gạch Ốp Tường Prime 30x60cm', 298000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Prime', 4.8, 567, 0, NULL, 95, 'Gạch ốp tường Prime họa tiết hiện đại.'),
  ('Gạch Lát Nền Đồng Tâm 60x60', 410000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Đồng Tâm', 4.9, 689, 1, 480000, 68, 'Gạch lát nền Đồng Tâm cao cấp.'),
  ('Sơn Nội Thất Mykolor 5L', 595000, 'lon', 'son', 'son-jotun-majestic.png', 'Mykolor', 4.6, 289, 0, NULL, 110, 'Sơn nội thất Mykolor che phủ tốt.'),
  ('Sơn Ngoại Thất Jotun Jotashield 5L', 865000, 'lon', 'son', 'son-jotun-majestic.png', 'Jotun', 4.9, 456, 1, 995000, 80, 'Sơn ngoại thất Jotun Jotashield chống phai màu.'),
  ('Sơn Nội Thất Kova 5L', 570000, 'lon', 'son', 'son-jotun-majestic.png', 'Kova', 4.5, 234, 0, NULL, 95, 'Sơn nội thất Kova giá tốt.'),
  ('Bồn Cầu Inax 1 Khối CW-1000', 2880000, 'cái', 've-sinh', 'bon-cau-toto.png', 'Inax', 4.7, 198, 0, NULL, 35, 'Bồn cầu Inax 1 khối Aqua Ceramic.'),
  ('Lavabo Treo Tường Inax', 860000, 'cái', 've-sinh', 'bon-cau-toto.png', 'Inax', 4.5, 112, 1, 1050000, 55, 'Lavabo treo tường Inax sứ cao cấp.'),
  ('Bồn Cầu COTTO 1 Khối', 2650000, 'cái', 've-sinh', 'bon-cau-toto.png', 'COTTO', 4.6, 145, 0, NULL, 40, 'Bồn cầu COTTO 1 khối hiện đại.'),
  ('Ống Nước PPR Bình Minh Φ20 – 4m', 32500, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Bình Minh', 4.7, 378, 0, NULL, 950, 'Ống PPR Bình Minh Φ20 chịu nhiệt.'),
  ('Ống PVC Tiền Phong Φ110 – 4m', 148000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Tiền Phong', 4.6, 245, 0, NULL, 380, 'Ống PVC thoát nước Φ110.'),
  ('Xi Măng Fico PCB40 – 50kg', 91500, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Fico', 4.5, 156, 0, NULL, 155, 'Xi măng Fico PCB40.'),
  ('Thép Cây Hòa Phát D16 CB400 – 11.7m', 468000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Hòa Phát', 4.7, 203, 0, NULL, 120, 'Thép cây Hòa Phát D16 mác CB400.'),
  ('Gạch Lát Nền Viglacera 80x80cm', 625000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Viglacera', 4.8, 334, 0, NULL, 60, 'Gạch lát nền Viglacera kích thước lớn.'),
  ('Sơn Nội Thất Dulux EasyCare 5L', 635000, 'lon', 'son', 'son-jotun-majestic.png', 'Dulux', 4.6, 412, 1, 755000, 105, 'Sơn nội thất Dulux EasyCare kháng khuẩn.'),
  ('Bồn Cầu TOTO 2 Khối', 3680000, 'cái', 've-sinh', 'bon-cau-toto.png', 'TOTO', 4.8, 167, 0, NULL, 28, 'Bồn cầu TOTO 2 khối thiết kế hiện đại.'),
  ('Ống PPR Tiền Phong Φ32 – 4m', 68500, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Tiền Phong', 4.7, 289, 0, NULL, 720, 'Ống PPR Tiền Phong Φ32.'),
  ('Xi Măng Công Thanh PCB40 – 50kg', 90500, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Công Thanh', 4.4, 98, 1, 102000, 135, 'Xi măng Công Thanh PCB40.'),
  ('Thép Cây Việt Nhật D18 – 11.7m', 520000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Việt Nhật', 4.8, 187, 0, NULL, 95, 'Thép cây Việt Nhật D18 cao cấp.'),
  ('Gạch Ốp Tường Catalan 30x60', 310000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Catalan', 4.7, 312, 0, NULL, 85, 'Gạch ốp tường Catalan họa tiết đẹp.'),
  ('Sơn Ngoại Thất Dulux Weathershield 5L', 795000, 'lon', 'son', 'son-jotun-majestic.png', 'Dulux', 4.7, 521, 1, 920000, 88, 'Sơn ngoại thất Dulux Weathershield.'),
  ('Lavabo Âm Bàn Inax', 1320000, 'cái', 've-sinh', 'bon-cau-toto.png', 'Inax', 4.6, 134, 0, NULL, 48, 'Lavabo âm bàn Inax sứ cao cấp.'),
  ('Ống PVC Bình Minh Φ75 – 4m', 78000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Bình Minh', 4.6, 267, 0, NULL, 520, 'Ống PVC Bình Minh Φ75 thoát nước.'),
  ('Xi Măng SCG PCB40 – 50kg', 106000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'SCG', 4.9, 289, 0, NULL, 115, 'Xi măng SCG cao cấp ít tỏa nhiệt.'),
  ('Thép Cuộn Pomina Φ8 – 200kg', 4280000, 'cuộn', 'thep', 'thep-cuon-hoa-phat.png', 'Pomina', 4.6, 167, 1, 4650000, 38, 'Thép cuộn Pomina Φ8.'),
  ('Gạch Xây Tuynel 4 Lỗ', 2200, 'viên', 'gach', 'gach-op-lat-prime.png', 'Đồng Tâm', 4.3, 89, 0, NULL, 1500, 'Gạch xây tuynel 4 lỗ nhẹ bền.'),
  ('Sơn Nội Thất Jotun Lady 5L', 720000, 'lon', 'son', 'son-jotun-majestic.png', 'Jotun', 4.8, 378, 0, NULL, 92, 'Sơn nội thất Jotun Lady cao cấp.'),
  ('Vòi Sen Tắm Nóng Lạnh TOTO', 1870000, 'bộ', 've-sinh', 'bon-cau-toto.png', 'TOTO', 4.7, 142, 1, 2250000, 42, 'Vòi sen tắm nóng lạnh TOTO.'),
  ('Ống PPR Tiền Phong Φ25 – 4m', 48500, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Tiền Phong', 4.7, 312, 0, NULL, 810, 'Ống PPR Tiền Phong Φ25 chịu nhiệt.'),
  ('Xi Măng Vicem Bỉm Sơn PCB40 – 50kg', 88200, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Bỉm Sơn', 4.5, 176, 0, NULL, 165, 'Xi măng Vicem Bỉm Sơn PCB40.'),
  ('Thép Cây Việt Mỹ D20 – 11.7m', 620000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Việt Mỹ', 4.7, 198, 0, NULL, 85, 'Thép cây Việt Mỹ D20 chịu lực lớn.'),
  ('Gạch Ốp Lát Prime 80x80cm', 560000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Prime', 4.8, 245, 0, NULL, 52, 'Gạch lát nền Prime 80x80.'),
  ('Sơn Ngoại Thất Kova 5L', 655000, 'lon', 'son', 'son-jotun-majestic.png', 'Kova', 4.5, 178, 0, NULL, 85, 'Sơn ngoại thất Kova bền màu.'),
  ('Bồn Tắm TOTO 1.7m', 9200000, 'cái', 've-sinh', 'bon-cau-toto.png', 'TOTO', 4.8, 67, 0, NULL, 12, 'Bồn tắm TOTO composite cao cấp.'),
  ('Ống HDPE Tiền Phong Φ90', 165000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Tiền Phong', 4.8, 112, 0, NULL, 280, 'Ống HDPE chịu áp lực cao.'),
  ('Xi Măng Nghi Sơn PCB40 – 50kg', 93500, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Nghi Sơn', 4.7, 356, 1, 107000, 175, 'Xi măng Nghi Sơn PCB40.'),
  ('Thép Cây Hòa Phát D25 CB400 – 11.7m', 850000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Hòa Phát', 4.8, 145, 0, NULL, 65, 'Thép cây Hòa Phát D25.'),
  ('Gạch Ốp Tường Viglacera 30x60', 305000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Viglacera', 4.7, 289, 0, NULL, 105, 'Gạch ốp tường Viglacera.'),
  ('Sơn Nội Thất Jotun Majestic Matt 5L', 710000, 'lon', 'son', 'son-jotun-majestic.png', 'Jotun', 4.8, 412, 1, 850000, 98, 'Sơn nội thất Jotun Majestic Matt.'),
  ('Vòi Lavabo Nóng Lạnh TOTO', 1580000, 'cái', 've-sinh', 'bon-cau-toto.png', 'TOTO', 4.7, 156, 0, NULL, 50, 'Vòi lavabo nóng lạnh TOTO.'),
  ('Ống PVC Bình Minh Φ50 – 4m', 52000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Bình Minh', 4.6, 198, 0, NULL, 680, 'Ống PVC Bình Minh Φ50.'),
  ('Xi Măng COTEC PCB40 – 50kg', 89500, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'COTEC', 4.5, 167, 0, NULL, 140, 'Xi măng COTEC PCB40.'),
  ('Thép Cuộn Việt Mỹ CB240 Φ6 – 100kg', 2380000, 'cuộn', 'thep', 'thep-cuon-hoa-phat.png', 'Việt Mỹ', 4.6, 134, 1, 2580000, 48, 'Thép cuộn Việt Mỹ Φ6.'),
  ('Gạch Lát Nền Amygres 60x60', 520000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Amygres', 4.8, 234, 0, NULL, 62, 'Gạch lát nền Amygres cao cấp.'),
  ('Sơn Ngoại Thất Jotun Jotashield Supreme 5L', 920000, 'lon', 'son', 'son-jotun-majestic.png', 'Jotun', 4.9, 289, 1, 1080000, 70, 'Sơn ngoại thất Jotun Supreme.'),
  ('Bồn Cầu 1 Khối American Standard', 3950000, 'cái', 've-sinh', 'bon-cau-toto.png', 'Am. Std', 4.7, 123, 0, NULL, 22, 'Bồn cầu 1 khối American Standard.'),
  ('Ống PPR Bình Minh Φ40 – 4m', 85000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Bình Minh', 4.7, 156, 0, NULL, 650, 'Ống PPR Bình Minh Φ40.'),
  ('Xi Măng Becamex PCB40 – 50kg', 87000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Becamex', 4.4, 98, 0, NULL, 120, 'Xi măng Becamex PCB40.'),
  ('Thép Cây Pomina D16 – 11.7m', 475000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Pomina', 4.7, 167, 0, NULL, 110, 'Thép cây Pomina D16.'),
  ('Gạch Ốp Lát Casagranda 60x60', 480000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Casagranda', 4.8, 201, 1, 550000, 58, 'Gạch Casagranda cao cấp.'),
  ('Sơn Nội Thất Dulux Ambiance 5L', 725000, 'lon', 'son', 'son-jotun-majestic.png', 'Dulux', 4.7, 289, 0, NULL, 100, 'Sơn nội thất Dulux Ambiance.'),
  ('Bồn Cầu 2 Khối Viglacera', 2450000, 'cái', 've-sinh', 'bon-cau-toto.png', 'Viglacera', 4.5, 134, 0, NULL, 38, 'Bồn cầu 2 khối Viglacera.'),
  ('Ống PVC Tiền Phong Φ160 – 4m', 215000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Tiền Phong', 4.6, 89, 0, NULL, 220, 'Ống PVC thoát nước lớn Φ160.'),
  ('Xi Măng Long Sơn PCB40 – 50kg', 90500, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Long Sơn', 4.6, 145, 0, NULL, 130, 'Xi măng Long Sơn PCB40.'),
  ('Thép Cây Việt Đức D12', 228000, 'cây', 'thep', 'thep-cay-viet-my.png', 'Việt Đức', 4.5, 112, 1, 255000, 160, 'Thép cây Việt Đức D12.'),
  ('Gạch Lát Nền Thạch Bàn 60x60', 340000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Thạch Bàn', 4.6, 278, 0, NULL, 72, 'Gạch Thạch Bàn chất lượng tốt.'),
  ('Sơn Ngoại Thất Mykolor 5L', 680000, 'lon', 'son', 'son-jotun-majestic.png', 'Mykolor', 4.5, 167, 0, NULL, 90, 'Sơn ngoại thất Mykolor.'),
  ('Lavabo Đặt Bàn TOTO', 1450000, 'cái', 've-sinh', 'bon-cau-toto.png', 'TOTO', 4.6, 98, 1, 1750000, 45, 'Lavabo đặt bàn TOTO.'),
  ('Ống PPR Tiền Phong Φ50 – 4m', 98000, 'cây', 'ong-nuoc', 'ong-nuoc-ppr-tien-phong.png', 'Tiền Phong', 4.7, 201, 0, NULL, 580, 'Ống PPR Tiền Phong Φ50.'),
  ('Xi Măng Xuân Thành PCB40 – 50kg', 88000, 'túi', 'xi-mang', 'xi-mang-ha-tien.png', 'Xuân Thành', 4.4, 134, 0, NULL, 125, 'Xi măng Xuân Thành PCB40.'),
  ('Thép Cuộn Hòa Phát Φ12 – 150kg', 3250000, 'cuộn', 'thep', 'thep-cuon-hoa-phat.png', 'Hòa Phát', 4.8, 189, 0, NULL, 40, 'Thép cuộn Hòa Phát Φ12.'),
  ('Gạch Ốp Tường Prime 25x40', 265000, 'thùng', 'gach', 'gach-op-lat-prime.png', 'Prime', 4.7, 245, 0, NULL, 110, 'Gạch ốp tường Prime 25x40.'),
  ('Sơn Nội Thất Jotun Jotaplast 5L', 555000, 'lon', 'son', 'son-jotun-majestic.png', 'Jotun', 4.6, 312, 0, NULL, 135, 'Sơn nội thất Jotun Jotaplast.'),
  ('Vòi Sen Tắm Nóng Lạnh American Standard', 1750000, 'bộ', 've-sinh', 'bon-cau-toto.png', 'Am. Std', 4.6, 123, 1, 2050000, 38, 'Vòi sen tắm nóng lạnh American Standard.'),
  ('Cát xây tô loại 1 – m³', 65481, 'm³', 'cat-da', 'xi-mang-ha-tien.png', 'MPE', 4.1, 269, 0, NULL, 248, 'Cát xây tô loại 1 – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cát bê tông hạt trung – m³', 65618, 'm³', 'cat-da', 'xi-mang-ha-tien.png', 'Cadivi', 4.1, 342, 1, 75461, 289, 'Cát bê tông hạt trung – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá 1×2 (10–20mm) – m³', 65755, 'tấn', 'cat-da', 'xi-mang-ha-tien.png', 'Sino', 4.1, 415, 0, NULL, 330, 'Đá 1×2 (10–20mm) – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá 4×6 – m³', 65892, 'bao', 'cat-da', 'xi-mang-ha-tien.png', 'Panasonic', 4.1, 488, 0, NULL, 371, 'Đá 4×6 – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá 0x4 (bụi) – m³', 66029, 'm²', 'cat-da', 'xi-mang-ha-tien.png', 'LS', 4.2, 561, 1, 75933, 412, 'Đá 0x4 (bụi) – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cát san lấp sạch – m³', 66166, 'viên', 'cat-da', 'xi-mang-ha-tien.png', 'Eaton', 4.2, 634, 0, NULL, 53, 'Cát san lấp sạch – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá hộc 5–15cm – tấn', 66303, 'can', 'cat-da', 'xi-mang-ha-tien.png', 'Toshiba', 4, 707, 0, NULL, 94, 'Đá hộc 5–15cm – tấn – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Sỏi trang trí hồ cá – bao 25kg', 66440, 'm³', 'cat-da', 'xi-mang-ha-tien.png', 'VLXD Đức Phiến', 4, 780, 1, 76406, 135, 'Sỏi trang trí hồ cá – bao 25kg – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cát lấp nền – m³', 66577, 'm³', 'cat-da', 'xi-mang-ha-tien.png', 'Hòa Phát', 4, 53, 0, NULL, 176, 'Cát lấp nền – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá mi sàng – m³', 66714, 'm³', 'cat-da', 'xi-mang-ha-tien.png', 'Nam Việt', 4, 126, 0, NULL, 217, 'Đá mi sàng – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá bazan xay dăm – tấn', 66851, 'tấn', 'cat-da', 'xi-mang-ha-tien.png', 'Kim Khí Sài Gòn', 4, 199, 1, 76879, 258, 'Đá bazan xay dăm – tấn – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cát nhiễm mặn đã rửa – m³', 66988, 'bao', 'cat-da', 'xi-mang-ha-tien.png', 'Điện Quang', 4.1, 272, 0, NULL, 299, 'Cát nhiễm mặn đã rửa – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá granit vụn – bao 20kg', 67125, 'm²', 'cat-da', 'xi-mang-ha-tien.png', 'Philips', 4.1, 345, 0, NULL, 340, 'Đá granit vụn – bao 20kg – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cát mịn trát – m³', 67262, 'viên', 'cat-da', 'xi-mang-ha-tien.png', 'Schneider', 4.1, 418, 1, 77351, 381, 'Cát mịn trát – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá dăm cấp phối – m³', 67399, 'can', 'cat-da', 'xi-mang-ha-tien.png', 'Stanley', 4.1, 491, 0, NULL, 22, 'Đá dăm cấp phối – m³ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cát thạch anh lọc nước – bao 20kg', 67536, 'm³', 'cat-da', 'xi-mang-ha-tien.png', 'Bosch', 4.1, 564, 0, NULL, 63, 'Cát thạch anh lọc nước – bao 20kg – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá xây móng cỡ lớn – viên', 67673, 'm³', 'cat-da', 'xi-mang-ha-tien.png', 'JYSK', 4.1, 637, 1, 77824, 104, 'Đá xây móng cỡ lớn – viên – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cát silic chịu nhiệt – bao', 67810, 'm³', 'cat-da', 'xi-mang-ha-tien.png', 'IKEA-style', 4.1, 710, 0, NULL, 145, 'Cát silic chịu nhiệt – bao – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đá slate trang trí – m²', 67947, 'tấn', 'cat-da', 'xi-mang-ha-tien.png', 'HomeBest', 4.1, 783, 0, NULL, 186, 'Đá slate trang trí – m² – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Phụ gia ổn định cát – can 5L', 68084, 'bao', 'cat-da', 'xi-mang-ha-tien.png', 'Eurogold', 4.1, 56, 1, 78297, 227, 'Phụ gia ổn định cát – can 5L – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Vít gỗ 4×40mm – hộp 200c', 68221, 'bộ', 'phu-kien', 'xi-mang-ha-tien.png', 'MPE', 4.1, 129, 0, NULL, 268, 'Vít gỗ 4×40mm – hộp 200c – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Tắc kê nở nhựa M8 – bộ 10', 68358, 'hộp', 'phu-kien', 'xi-mang-ha-tien.png', 'Cadivi', 4.2, 202, 0, NULL, 309, 'Tắc kê nở nhựa M8 – bộ 10 – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Pát kệ treo tường – cái', 68495, 'kg', 'phu-kien', 'xi-mang-ha-tien.png', 'Sino', 4.2, 275, 1, 78769, 350, 'Pát kệ treo tường – cái – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đinh thép 50mm – kg', 68632, 'cuộn', 'phu-kien', 'xi-mang-ha-tien.png', 'Panasonic', 4, 348, 0, NULL, 391, 'Đinh thép 50mm – kg – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Mối nối ống PVC U25', 68769, 'm', 'phu-kien', 'xi-mang-ha-tien.png', 'LS', 4, 421, 0, NULL, 32, 'Mối nối ống PVC U25 – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Ke chỉ gạch 2mm – cuộn 50m', 68906, 'cái', 'phu-kien', 'xi-mang-ha-tien.png', 'Eaton', 4, 494, 1, 79242, 73, 'Ke chỉ gạch 2mm – cuộn 50m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Neo sàn bê tông M10', 69043, 'bộ', 'phu-kien', 'xi-mang-ha-tien.png', 'Toshiba', 4, 567, 0, NULL, 114, 'Neo sàn bê tông M10 – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bulong inox M6×30 – bộ 20', 69180, 'hộp', 'phu-kien', 'xi-mang-ha-tien.png', 'VLXD Đức Phiến', 4, 640, 0, NULL, 155, 'Bulong inox M6×30 – bộ 20 – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Nẹp nhôm chữ L 2m', 69317, 'kg', 'phu-kien', 'xi-mang-ha-tien.png', 'Hòa Phát', 4.1, 713, 1, 79715, 196, 'Nẹp nhôm chữ L 2m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Vít bắn tôn 12# – hộp', 69454, 'cuộn', 'phu-kien', 'xi-mang-ha-tien.png', 'Nam Việt', 4.1, 786, 0, NULL, 237, 'Vít bắn tôn 12# – hộp – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Khóa tay nắm tròn inox', 69591, 'm', 'phu-kien', 'xi-mang-ha-tien.png', 'Kim Khí Sài Gòn', 4.1, 59, 0, NULL, 278, 'Khóa tay nắm tròn inox – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bản lề lá 4 inch inox', 69728, 'cái', 'phu-kien', 'xi-mang-ha-tien.png', 'Điện Quang', 4.1, 132, 1, 80187, 319, 'Bản lề lá 4 inch inox – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Ty ren thanh giằng M12', 69865, 'bộ', 'phu-kien', 'xi-mang-ha-tien.png', 'Philips', 4.1, 205, 0, NULL, 360, 'Ty ren thanh giằng M12 – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Kẹp U dầm cột D114', 70002, 'hộp', 'phu-kien', 'xi-mang-ha-tien.png', 'Schneider', 4.1, 278, 0, NULL, 401, 'Kẹp U dầm cột D114 – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Vòng đệm cao su M8', 70139, 'kg', 'phu-kien', 'xi-mang-ha-tien.png', 'Stanley', 4.1, 351, 1, 80660, 42, 'Vòng đệm cao su M8 – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Chốt an toàn cửa sổ', 70276, 'cuộn', 'phu-kien', 'xi-mang-ha-tien.png', 'Bosch', 4.1, 424, 0, NULL, 83, 'Chốt an toàn cửa sổ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Giá đỡ ống nước D27', 70413, 'm', 'phu-kien', 'xi-mang-ha-tien.png', 'JYSK', 4.1, 497, 0, NULL, 124, 'Giá đỡ ống nước D27 – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Pát treo quạt trần', 70550, 'cái', 'phu-kien', 'xi-mang-ha-tien.png', 'IKEA-style', 4.1, 570, 1, 81133, 165, 'Pát treo quạt trần – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Vít thạch cao 3.5×25 – hộp', 70687, 'bộ', 'phu-kien', 'xi-mang-ha-tien.png', 'HomeBest', 4.2, 643, 0, NULL, 206, 'Vít thạch cao 3.5×25 – hộp – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Móc treo tường chịu lực 20kg', 70824, 'hộp', 'phu-kien', 'xi-mang-ha-tien.png', 'Eurogold', 4.2, 716, 0, NULL, 247, 'Móc treo tường chịu lực 20kg – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Át tô-mát 2P 32A', 70961, 'module', 'dien', 'xi-mang-ha-tien.png', 'MPE', 4, 789, 1, 81605, 288, 'Át tô-mát 2P 32A – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Ổ cắm đôi có màn che', 71098, 'cái', 'dien', 'xi-mang-ha-tien.png', 'Cadivi', 4, 62, 0, NULL, 329, 'Ổ cắm đôi có màn che – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Dây điện VCmd 2×2.5 – cuộn 100m', 71235, 'bộ', 'dien', 'xi-mang-ha-tien.png', 'Sino', 4, 135, 0, NULL, 370, 'Dây điện VCmd 2×2.5 – cuộn 100m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Tụ bù 2.5kVAr', 71372, 'cuộn', 'dien', 'xi-mang-ha-tien.png', 'Panasonic', 4, 208, 1, 82078, 411, 'Tụ bù 2.5kVAr – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đèn LED bulb 12W', 71509, 'm', 'dien', 'xi-mang-ha-tien.png', 'LS', 4, 281, 0, NULL, 52, 'Đèn LED bulb 12W – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('MCB 1P 16A', 71646, 'lon', 'dien', 'xi-mang-ha-tien.png', 'Eaton', 4.1, 354, 0, NULL, 93, 'MCB 1P 16A – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Ống luồn dây PVC D20 – cây 4m', 71783, 'chai', 'dien', 'xi-mang-ha-tien.png', 'Toshiba', 4.1, 427, 1, 82550, 134, 'Ống luồn dây PVC D20 – cây 4m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bóng đèn tuýp LED 1.2m', 71920, 'module', 'dien', 'xi-mang-ha-tien.png', 'VLXD Đức Phiến', 4.1, 500, 0, NULL, 175, 'Bóng đèn tuýp LED 1.2m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Công tắc 2 chiều', 72057, 'cái', 'dien', 'xi-mang-ha-tien.png', 'Hòa Phát', 4.1, 573, 0, NULL, 216, 'Công tắc 2 chiều – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Tủ điện âm tường 12 module', 72194, 'bộ', 'dien', 'xi-mang-ha-tien.png', 'Nam Việt', 4.1, 646, 1, 83023, 257, 'Tủ điện âm tường 12 module – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Dây cáp đồng M16 tiếp địa', 72331, 'cuộn', 'dien', 'xi-mang-ha-tien.png', 'Kim Khí Sài Gòn', 4.1, 719, 0, NULL, 298, 'Dây cáp đồng M16 tiếp địa – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đèn Downlight âm trần 7W', 72468, 'm', 'dien', 'xi-mang-ha-tien.png', 'Điện Quang', 4.1, 792, 0, NULL, 339, 'Đèn Downlight âm trần 7W – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Rơ le nhiệt 9–13A', 72605, 'lon', 'dien', 'xi-mang-ha-tien.png', 'Philips', 4.1, 65, 1, 83496, 380, 'Rơ le nhiệt 9–13A – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Phích cắm chịu tải 16A', 72742, 'chai', 'dien', 'xi-mang-ha-tien.png', 'Schneider', 4.1, 138, 0, NULL, 21, 'Phích cắm chịu tải 16A – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Quạt thông gió ống D100', 72879, 'module', 'dien', 'xi-mang-ha-tien.png', 'Stanley', 4.1, 211, 0, NULL, 62, 'Quạt thông gió ống D100 – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Timer hẹn giờ số', 73016, 'cái', 'dien', 'xi-mang-ha-tien.png', 'Bosch', 4.2, 284, 1, 83968, 103, 'Timer hẹn giờ số – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Nguồn LED 12V 2A', 73153, 'bộ', 'dien', 'xi-mang-ha-tien.png', 'JYSK', 4.2, 357, 0, NULL, 144, 'Nguồn LED 12V 2A – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đèn pha LED 50W', 73290, 'cuộn', 'dien', 'xi-mang-ha-tien.png', 'IKEA-style', 4, 430, 0, NULL, 185, 'Đèn pha LED 50W – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Ổ cắm âm sàn', 73427, 'm', 'dien', 'xi-mang-ha-tien.png', 'HomeBest', 4, 503, 1, 84441, 226, 'Ổ cắm âm sàn – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Dây đơn VCmt 1×1.5 – cuộn', 73564, 'lon', 'dien', 'xi-mang-ha-tien.png', 'Eurogold', 4, 576, 0, NULL, 267, 'Dây đơn VCmt 1×1.5 – cuộn – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Búa cao su 500g', 73701, 'chai', 'dung-cu', 'xi-mang-ha-tien.png', 'MPE', 4, 649, 0, NULL, 308, 'Búa cao su 500g – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Máy khoan pin 18V (thân máy)', 73838, 'inch', 'dung-cu', 'xi-mang-ha-tien.png', 'Cadivi', 4, 722, 1, 84914, 349, 'Máy khoan pin 18V (thân máy) – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cưa tay cưa gỗ 450mm', 73975, 'cái', 'dung-cu', 'xi-mang-ha-tien.png', 'Sino', 4.1, 795, 0, NULL, 390, 'Cưa tay cưa gỗ 450mm – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Thước cuộn thép 5m', 74112, 'bộ', 'dung-cu', 'xi-mang-ha-tien.png', 'Panasonic', 4.1, 68, 0, NULL, 31, 'Thước cuộn thép 5m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Dao trát vữa inox 120mm', 74249, 'chiếc', 'dung-cu', 'xi-mang-ha-tien.png', 'LS', 4.1, 141, 1, 85386, 72, 'Dao trát vữa inox 120mm – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cào xây răng cư', 74386, 'chai', 'dung-cu', 'xi-mang-ha-tien.png', 'Eaton', 4.1, 214, 0, NULL, 113, 'Cào xây răng cư – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Máy mài góc 100mm', 74523, 'inch', 'dung-cu', 'xi-mang-ha-tien.png', 'Toshiba', 4.1, 287, 0, NULL, 154, 'Máy mài góc 100mm – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Kìm điện đa năng 8 inch', 74660, 'cái', 'dung-cu', 'xi-mang-ha-tien.png', 'VLXD Đức Phiến', 4.1, 360, 1, 85859, 195, 'Kìm điện đa năng 8 inch – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Tua vít 2 đầu', 74797, 'bộ', 'dung-cu', 'xi-mang-ha-tien.png', 'Hòa Phát', 4.1, 433, 0, NULL, 236, 'Tua vít 2 đầu – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Thang nhôm gấp 2 đoạn 2.5m', 74934, 'chiếc', 'dung-cu', 'xi-mang-ha-tien.png', 'Nam Việt', 4.1, 506, 0, NULL, 277, 'Thang nhôm gấp 2 đoạn 2.5m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Kéo cắt tôn tay', 75071, 'chai', 'dung-cu', 'xi-mang-ha-tien.png', 'Kim Khí Sài Gòn', 4.1, 579, 1, 86332, 318, 'Kéo cắt tôn tay – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bàn chải thép', 75208, 'inch', 'dung-cu', 'xi-mang-ha-tien.png', 'Điện Quang', 4.1, 652, 0, NULL, 359, 'Bàn chải thép – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Xô vữa 12L', 75345, 'cái', 'dung-cu', 'xi-mang-ha-tien.png', 'Philips', 4.2, 725, 0, NULL, 400, 'Xô vữa 12L – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bay xây thép 300mm', 75482, 'bộ', 'dung-cu', 'xi-mang-ha-tien.png', 'Schneider', 4.2, 798, 1, 86804, 41, 'Bay xây thép 300mm – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Keo silicone (chai)', 75619, 'chiếc', 'dung-cu', 'xi-mang-ha-tien.png', 'Stanley', 4, 71, 0, NULL, 82, 'Keo silicone (chai) – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Lưỡi cắt gạch 125mm', 75756, 'chai', 'dung-cu', 'xi-mang-ha-tien.png', 'Bosch', 4, 144, 0, NULL, 123, 'Lưỡi cắt gạch 125mm – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Kìm mỏ quạ 10 inch', 75893, 'inch', 'dung-cu', 'xi-mang-ha-tien.png', 'JYSK', 4, 217, 1, 87277, 164, 'Kìm mỏ quạ 10 inch – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Đe mini bàn 5kg', 76030, 'cái', 'dung-cu', 'xi-mang-ha-tien.png', 'IKEA-style', 4, 290, 0, NULL, 205, 'Đe mini bàn 5kg – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Cuốc chim cán gỗ', 76167, 'bộ', 'dung-cu', 'xi-mang-ha-tien.png', 'HomeBest', 4, 363, 0, NULL, 246, 'Cuốc chim cán gỗ – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bút đánh dấu công trình', 76304, 'chiếc', 'dung-cu', 'xi-mang-ha-tien.png', 'Eurogold', 4.1, 436, 1, 87750, 287, 'Bút đánh dấu công trình – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bàn làm việc MDF 1.2m', 76441, 'cái', 'noi-that', 'xi-mang-ha-tien.png', 'MPE', 4.1, 509, 0, NULL, 328, 'Bàn làm việc MDF 1.2m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Ghế xoay văn phòng lưới', 76578, 'm', 'noi-that', 'xi-mang-ha-tien.png', 'Cadivi', 4.1, 582, 0, NULL, 369, 'Ghế xoay văn phòng lưới – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Kệ sách 5 tầng gỗ cao su', 76715, 'chiếc', 'noi-that', 'xi-mang-ha-tien.png', 'Sino', 4.1, 655, 1, 88222, 410, 'Kệ sách 5 tầng gỗ cao su – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Tủ giày 3 cánh', 76852, 'bộ', 'noi-that', 'xi-mang-ha-tien.png', 'Panasonic', 4.1, 728, 0, NULL, 51, 'Tủ giày 3 cánh – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Kệ treo tường phòng khách', 76989, 'cái', 'noi-that', 'xi-mang-ha-tien.png', 'LS', 4.1, 801, 0, NULL, 92, 'Kệ treo tường phòng khách – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Ghế bar cao 750mm', 77126, 'm', 'noi-that', 'xi-mang-ha-tien.png', 'Eaton', 4.1, 74, 1, 88695, 133, 'Ghế bar cao 750mm – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bàn ăn 6 ghế gỗ sồi', 77263, 'chiếc', 'noi-that', 'xi-mang-ha-tien.png', 'Toshiba', 4.1, 147, 0, NULL, 174, 'Bàn ăn 6 ghế gỗ sồi – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Tủ quần áo 2m cánh lùa', 77400, 'bộ', 'noi-that', 'xi-mang-ha-tien.png', 'VLXD Đức Phiến', 4.1, 220, 0, NULL, 215, 'Tủ quần áo 2m cánh lùa – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Sofa góc L bọc vải', 77537, 'cái', 'noi-that', 'xi-mang-ha-tien.png', 'Hòa Phát', 4.1, 293, 1, 89168, 256, 'Sofa góc L bọc vải – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Kệ tivi treo tường 1.8m', 77674, 'm', 'noi-that', 'xi-mang-ha-tien.png', 'Nam Việt', 4.2, 366, 0, NULL, 297, 'Kệ tivi treo tường 1.8m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Tủ bếp trên module 80cm', 77811, 'chiếc', 'noi-that', 'xi-mang-ha-tien.png', 'Kim Khí Sài Gòn', 4.2, 439, 0, NULL, 338, 'Tủ bếp trên module 80cm – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Ghế đẩu gỗ tự nhiên', 77948, 'bộ', 'noi-that', 'xi-mang-ha-tien.png', 'Điện Quang', 4, 512, 1, 89640, 379, 'Ghế đẩu gỗ tự nhiên – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bàn console hành lang 1m', 78085, 'cái', 'noi-that', 'xi-mang-ha-tien.png', 'Philips', 4, 585, 0, NULL, 20, 'Bàn console hành lang 1m – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Giường 1.6m khung sắt', 78222, 'm', 'noi-that', 'xi-mang-ha-tien.png', 'Schneider', 4, 658, 0, NULL, 61, 'Giường 1.6m khung sắt – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Tủ đầu giường có ngăn', 78359, 'chiếc', 'noi-that', 'xi-mang-ha-tien.png', 'Stanley', 4, 731, 1, 90113, 102, 'Tủ đầu giường có ngăn – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Kệ giày thông minh 4 tầng', 78496, 'bộ', 'noi-that', 'xi-mang-ha-tien.png', 'Bosch', 4, 804, 0, NULL, 143, 'Kệ giày thông minh 4 tầng – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Bàn trà mặt đá nhân tạo', 78633, 'cái', 'noi-that', 'xi-mang-ha-tien.png', 'JYSK', 4.1, 77, 0, NULL, 184, 'Bàn trà mặt đá nhân tạo – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Ghế lười hạt xốp size L', 78770, 'm', 'noi-that', 'xi-mang-ha-tien.png', 'IKEA-style', 4.1, 150, 1, 90586, 225, 'Ghế lười hạt xốp size L – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Tủ ly phòng khách cánh kính', 78907, 'chiếc', 'noi-that', 'xi-mang-ha-tien.png', 'HomeBest', 4.1, 223, 0, NULL, 266, 'Tủ ly phòng khách cánh kính – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.'),
  ('Kệ trang trí treo tường', 79044, 'bộ', 'noi-that', 'xi-mang-ha-tien.png', 'Eurogold', 4.1, 296, 0, NULL, 307, 'Kệ trang trí treo tường – hàng VLXD Đức Phiến, phù hợp công trình dân dụng và thương mại.');

-- ============================================================
-- INSERT: Dữ liệu users
-- ============================================================
INSERT INTO users (id, full_name, email, phone, password, role, is_root, created_at) VALUES
  (1, 'NGUYỄN anh long', 'nal26052005@gmail.com', '', 'Nguyenanhlong123@', 'customer', 0, '2026-04-19 07:36:02'),
  (999, 'Đức Phiến (Root Admin)', 'admin@vlxdducphien.vn', '0901234999', 'Nguyenanhlong123@', 'admin', 1, '2026-01-01 00:00:00');
