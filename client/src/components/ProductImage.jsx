// ============================================================
// components/ProductImage.jsx — Hiển thị ảnh sản phẩm
//
// Tại sao cần component riêng?
//   - Tất cả ảnh đều nằm trong /public/images/
//   - Khi ảnh chưa có → hiện placeholder thay vì ảnh vỡ
//   - Dùng lại ở nhiều nơi: ProductCard, CartPage, AdminPage...
// ============================================================

export default function ProductImage({ img, name, size = 130 }) {
  // Đường dẫn tới ảnh trong thư mục public/images/
  const src = `/images/${img}`;

  return (
    <img
      src={src}
      alt={name}
      style={{ width: "100%", height: size, objectFit: "contain" }}
      onError={(e) => {
        // onError: chạy khi ảnh bị lỗi (file không tồn tại, sai tên...)
        // Thay bằng ảnh SVG placeholder tạo thẳng bằng code
        e.currentTarget.src =
          `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='${size}'><rect width='200' height='${size}' fill='%23f1f5f9'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13' fill='%2394a3b8' font-family='sans-serif'>Chưa có ảnh</text></svg>`;
        // Tắt onError để tránh vòng lặp vô tận
        e.currentTarget.onerror = null;
      }}
    />
  );
}
