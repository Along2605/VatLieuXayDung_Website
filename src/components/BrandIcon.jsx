// Logo thương hiệu dạng tròn — thay cho mọi icon Bootstrap trong UI
export const STORE_NAME = "VLXD Đức Phiến";

export const LOGO_SRC = "/images/logo.png";

export default function BrandIcon({ size = 20, className = "", alt = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-circle ${className}`.trim()}
      style={{
        objectFit: "cover",
        verticalAlign: "middle",
        aspectRatio: "1 / 1",
      }}
    />
  );
}
