// components/ProductImage.jsx
// Component hiển thị ảnh sản phẩm, có fallback khi ảnh chưa có

export default function ProductImage({ img, name, size = 130, className = "" }) {
  const src = `/images/${img}`;

  return (
    <img
      src={src}
      alt={name}
      className={className}
      style={{ width: "100%", height: size, objectFit: "contain" }}
      onError={(e) => {
        // Fallback: hiển thị placeholder SVG khi ảnh chưa có
        e.currentTarget.src =
          `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='${size}' viewBox='0 0 200 ${size}'><rect width='200' height='${size}' fill='%23f1f5f9'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13' fill='%2394a3b8' font-family='sans-serif'>Chưa có ảnh</text></svg>`;
        e.currentTarget.onerror = null; // tránh loop vô tận
      }}
    />
  );
}
