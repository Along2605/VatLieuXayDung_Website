-- ============================================================
-- database/orders.sql — Thêm bảng orders vào database
--
-- Chạy file này để thêm bảng orders vào database đã có:
--   mysql -u sa -psapassword vlxd_db < database/orders.sql
--
-- Hoặc chạy trực tiếp trong MySQL Workbench / phpMyAdmin
-- ============================================================

USE vlxd_db;

-- ============================================================
-- Bảng: orders (đơn hàng)
--
-- Mỗi đơn hàng lưu:
--   - Thông tin khách (tên, SĐT, địa chỉ)
--   - Danh sách sản phẩm (JSON)
--   - Tổng tiền, phương thức thanh toán
--   - Trạng thái: pending → paid → cancelled
--   - Thời gian tạo và hết hạn (15 phút)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  -- orderId dạng "DH1718000000000" (timestamp) thay vì AUTO_INCREMENT
  -- vì frontend tạo orderId trước khi gửi lên server
  order_id      VARCHAR(30)   PRIMARY KEY,

  -- Thông tin khách hàng (tách riêng để query dễ hơn là lồng JSON)
  customer_name  VARCHAR(150)  NOT NULL,
  customer_phone VARCHAR(20)   NOT NULL,
  customer_address VARCHAR(300) NOT NULL,
  customer_note  VARCHAR(500)  DEFAULT '',

  -- Danh sách sản phẩm lưu dạng JSON text
  -- VD: [{"id":1,"name":"Xi Măng","price":95000,"qty":2}]
  items         JSON          NOT NULL,

  total_items   INT           NOT NULL DEFAULT 0,
  total_amount  INT           NOT NULL,              -- tổng tiền (VNĐ)

  -- Phương thức thanh toán: cod | bank | momo
  payment       ENUM('cod','bank','momo') DEFAULT 'cod',

  -- Trạng thái đơn hàng
  -- pending   = vừa tạo, chờ thanh toán
  -- paid      = admin đã xác nhận (nhắn "ok DH123" trên Telegram)
  -- cancelled = hết hạn 15 phút hoặc bị huỷ
  status        ENUM('pending','paid','cancelled') DEFAULT 'pending',

  -- ID user đặt hàng (NULL nếu guest, nhưng project này yêu cầu đăng nhập)
  user_id       INT           DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

  -- Thời điểm hết hạn — backend cũng kiểm tra, không chỉ tin frontend
  expire_at     TIMESTAMP     NOT NULL,

  -- Index để query nhanh theo status và user
  INDEX idx_status   (status),
  INDEX idx_user_id  (user_id),
  INDEX idx_created  (created_at)
);
