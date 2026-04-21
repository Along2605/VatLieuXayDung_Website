// pages/AdminProductsPage.jsx
// Kiến thức: useState, useEffect, useAuth, useProducts hook, modal bằng Bootstrap
// Trang admin: Quản lý sản phẩm và danh mục
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../hooks/useProducts";

const formatPrice = (price) =>
  price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0 ₫";

// ── Form sản phẩm mặc định ─────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  name: "", price: "", unit: "", category: "", brand: "",
  stock: "", rating: 4.5, reviews: 0, sale: false, oldPrice: "",
  img: "", desc: "",
};

// ── Form category mặc định ─────────────────────────────────────────────────
const EMPTY_CATEGORY = { id: "", label: "", icon: "box" };

export default function AdminProductsPage() {
  const { user } = useAuth();
  const {
    loading, error,
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
  } = useProducts(user);

  // ── State dữ liệu ─────────────────────────────────────────
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [fetching,   setFetching]   = useState(true);

  // ── State UI ──────────────────────────────────────────────
  const [tab,        setTab]        = useState("products"); // "products" | "categories"
  const [toast,      setToast]      = useState(null);
  const [search,     setSearch]     = useState("");

  // ── Modal sản phẩm ────────────────────────────────────────
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct,   setEditingProduct]   = useState(null); // null = thêm mới
  const [productForm,      setProductForm]      = useState(EMPTY_PRODUCT);

  // ── Modal category ────────────────────────────────────────
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat,   setEditingCat]   = useState(null);
  const [catForm,      setCatForm]      = useState(EMPTY_CATEGORY);

  // ── Fetch data ────────────────────────────────────────────
  async function fetchData() {
    setFetching(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/data/products.json"),
        fetch("/data/products.json"),
      ]);
      const pData = await pRes.json();
      setProducts(pData.products   || []);
      setCategories((pData.categories || []).filter((c) => c.id !== "all"));
    } catch {
      showToast("error", "Không tải được dữ liệu.");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // ── Toast ─────────────────────────────────────────────────
  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  // ══════════════════════════════════════════════════════════
  // PRODUCT HANDLERS
  // ══════════════════════════════════════════════════════════

  function openAddProduct() {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setShowProductModal(true);
  }

  function openEditProduct(product) {
    setEditingProduct(product);
    setProductForm({
      name:     product.name,
      price:    product.price,
      unit:     product.unit,
      category: product.category,
      brand:    product.brand    || "",
      stock:    product.stock    || "",
      rating:   product.rating   || 4.5,
      reviews:  product.reviews  || 0,
      sale:     product.sale     || false,
      oldPrice: product.oldPrice || "",
      img:      product.img      || "",
      desc:     product.desc     || "",
    });
    setShowProductModal(true);
  }

  async function handleSaveProduct() {
    // Validation cơ bản
    if (!productForm.name.trim()) return showToast("error", "Vui lòng nhập tên sản phẩm.");
    if (!productForm.price)       return showToast("error", "Vui lòng nhập giá.");
    if (!productForm.category)    return showToast("error", "Vui lòng chọn danh mục.");

    const data = {
      ...productForm,
      price:    Number(productForm.price),
      oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,
      stock:    Number(productForm.stock) || 0,
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, data);
    } else {
      result = await addProduct(data);
    }

    if (result.ok) {
      showToast("success", editingProduct ? "Đã cập nhật sản phẩm!" : "Đã thêm sản phẩm mới!");
      setShowProductModal(false);
      fetchData();
    } else {
      showToast("error", result.error);
    }
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return;
    const result = await deleteProduct(product.id);
    if (result.ok) {
      showToast("success", "Đã xóa sản phẩm.");
      fetchData();
    } else {
      showToast("error", result.error);
    }
  }

  // ══════════════════════════════════════════════════════════
  // CATEGORY HANDLERS
  // ══════════════════════════════════════════════════════════

  function openAddCategory() {
    setEditingCat(null);
    setCatForm(EMPTY_CATEGORY);
    setShowCatModal(true);
  }

  function openEditCategory(cat) {
    setEditingCat(cat);
    setCatForm({ id: cat.id, label: cat.label, icon: cat.icon || "box" });
    setShowCatModal(true);
  }

  async function handleSaveCategory() {
    if (!catForm.label.trim()) return showToast("error", "Vui lòng nhập tên danh mục.");
    if (!editingCat && !catForm.id.trim()) return showToast("error", "Vui lòng nhập ID danh mục.");

    let result;
    if (editingCat) {
      result = await updateCategory(editingCat.id, { label: catForm.label, icon: catForm.icon });
    } else {
      result = await addCategory({ id: catForm.id.trim(), label: catForm.label, icon: catForm.icon });
    }

    if (result.ok) {
      showToast("success", editingCat ? "Đã cập nhật danh mục!" : "Đã thêm danh mục!");
      setShowCatModal(false);
      fetchData();
    } else {
      showToast("error", result.error);
    }
  }

  async function handleDeleteCategory(cat) {
    if (!window.confirm(`Xóa danh mục "${cat.label}"?`)) return;
    const result = await deleteCategory(cat.id);
    if (result.ok) {
      showToast("success", "Đã xóa danh mục.");
      fetchData();
    } else {
      showToast("error", result.error);
    }
  }

  // ── Lọc sản phẩm theo search ──────────────────────────────
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="container py-4">

      {/* Tiêu đề */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">
            <i className="bi bi-box-seam me-2 text-primary"></i>Quản lý kho hàng
          </h4>
          <p className="text-muted small mb-0">
            Sản phẩm & Danh mục · Chỉ Admin mới thấy trang này
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`alert alert-${toast.type === "success" ? "success" : "danger"} d-flex align-items-center gap-2 py-2 mb-3`}
          style={{ borderRadius: 10 }}
        >
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-x-circle"}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "products" ? "active fw-bold" : ""}`}
            onClick={() => setTab("products")}
          >
            <i className="bi bi-box me-1"></i>Sản phẩm ({products.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "categories" ? "active fw-bold" : ""}`}
            onClick={() => setTab("categories")}
          >
            <i className="bi bi-tags me-1"></i>Danh mục ({categories.length})
          </button>
        </li>
      </ul>

      {fetching && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="text-muted mt-2">Đang tải...</p>
        </div>
      )}

      {/* ── TAB SẢN PHẨM ── */}
      {!fetching && tab === "products" && (
        <>
          <div className="d-flex justify-content-between gap-2 mb-3">
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: 320 }}
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* Nút thêm — ẩn với customer, hiện với admin */}
            <button className="btn btn-primary fw-bold" onClick={openAddProduct}>
              <i className="bi bi-plus-lg me-1"></i>Thêm sản phẩm
            </button>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th className="ps-4 py-3" style={thStyle}>ID</th>
                    <th className="py-3"      style={thStyle}>Tên sản phẩm</th>
                    <th className="py-3"      style={thStyle}>Danh mục</th>
                    <th className="py-3"      style={thStyle}>Giá</th>
                    <th className="py-3"      style={thStyle}>Kho</th>
                    <th className="py-3 pe-4 text-end" style={thStyle}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="ps-4 text-muted small">#{p.id}</td>
                      <td>
                        <div className="fw-semibold small">{p.name}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{p.brand}</div>
                      </td>
                      <td className="small">
                        <span className="badge bg-light text-dark border">{p.category}</span>
                      </td>
                      <td className="small fw-semibold" style={{ color: "#2563eb" }}>
                        {formatPrice(p.price)}
                      </td>
                      <td className="small">{p.stock ?? "—"}</td>
                      <td className="pe-4 text-end">
                        {/* Nút Sửa */}
                        <button
                          className="btn btn-sm btn-outline-secondary me-1"
                          onClick={() => openEditProduct(p)}
                          style={{ fontSize: 12 }}
                        >
                          <i className="bi bi-pencil me-1"></i>Sửa
                        </button>
                        {/* Nút Xóa */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteProduct(p)}
                          disabled={loading}
                          style={{ fontSize: 12 }}
                        >
                          <i className="bi bi-trash me-1"></i>Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── TAB DANH MỤC ── */}
      {!fetching && tab === "categories" && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-primary fw-bold" onClick={openAddCategory}>
              <i className="bi bi-plus-lg me-1"></i>Thêm danh mục
            </button>
          </div>

          <div className="row g-3">
            {categories.map((cat) => (
              <div key={cat.id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <i className={`bi bi-${cat.icon} me-2 text-primary`}></i>
                      <span className="fw-semibold small">{cat.label}</span>
                      <div className="text-muted" style={{ fontSize: 11 }}>ID: {cat.id}</div>
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openEditCategory(cat)}
                        style={{ fontSize: 12, padding: "2px 8px" }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteCategory(cat)}
                        disabled={loading}
                        style={{ fontSize: 12, padding: "2px 8px" }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ MODAL THÊM/SỬA SẢN PHẨM ══ */}
      {showProductModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.45)" }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h5>
                <button className="btn-close" onClick={() => setShowProductModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Tên sản phẩm *</label>
                    <input
                      type="text" className="form-control"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Xi Măng Hà Tiên PCB40 – 50kg"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Giá (VNĐ) *</label>
                    <input
                      type="number" className="form-control"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="95000"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Đơn vị</label>
                    <input
                      type="text" className="form-control"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      placeholder="túi, cây, m2..."
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Tồn kho</label>
                    <input
                      type="number" className="form-control"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Danh mục *</label>
                    <select
                      className="form-select"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Thương hiệu</label>
                    <input
                      type="text" className="form-control"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <div className="form-check mt-4">
                      <input
                        type="checkbox" className="form-check-input" id="chkSale"
                        checked={productForm.sale}
                        onChange={(e) => setProductForm({ ...productForm, sale: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="chkSale">
                        Đang khuyến mãi
                      </label>
                    </div>
                  </div>
                  {productForm.sale && (
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Giá gốc (VNĐ)</label>
                      <input
                        type="number" className="form-control"
                        value={productForm.oldPrice}
                        onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="col-md-8">
                    <label className="form-label fw-semibold small">Tên file ảnh</label>
                    <input
                      type="text" className="form-control"
                      value={productForm.img}
                      onChange={(e) => setProductForm({ ...productForm, img: e.target.value })}
                      placeholder="ten-anh.png"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Mô tả</label>
                    <textarea
                      className="form-control" rows={2}
                      value={productForm.desc}
                      onChange={(e) => setProductForm({ ...productForm, desc: e.target.value })}
                      style={{ resize: "none" }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setShowProductModal(false)}>
                  Huỷ
                </button>
                <button className="btn btn-primary fw-bold" onClick={handleSaveProduct} disabled={loading}>
                  {loading
                    ? <span className="spinner-border spinner-border-sm"></span>
                    : editingProduct ? "Cập nhật" : "Thêm mới"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL THÊM/SỬA DANH MỤC ══ */}
      {showCatModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.45)" }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingCat ? "Sửa danh mục" : "Thêm danh mục mới"}
                </h5>
                <button className="btn-close" onClick={() => setShowCatModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {/* ID chỉ cần khi thêm mới */}
                  {!editingCat && (
                    <div className="col-12">
                      <label className="form-label fw-semibold small">ID (slug) *</label>
                      <input
                        type="text" className="form-control"
                        value={catForm.id}
                        onChange={(e) => setCatForm({ ...catForm, id: e.target.value })}
                        placeholder="vd: gach-men"
                      />
                      <div className="form-text">Chỉ gồm chữ thường và dấu gạch ngang.</div>
                    </div>
                  )}
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Tên danh mục *</label>
                    <input
                      type="text" className="form-control"
                      value={catForm.label}
                      onChange={(e) => setCatForm({ ...catForm, label: e.target.value })}
                      placeholder="Gạch Men"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Bootstrap Icon</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className={`bi bi-${catForm.icon}`}></i>
                      </span>
                      <input
                        type="text" className="form-control"
                        value={catForm.icon}
                        onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                        placeholder="box, tools, grid..."
                      />
                    </div>
                    <div className="form-text">Xem tên icon tại icons.getbootstrap.com</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setShowCatModal(false)}>
                  Huỷ
                </button>
                <button className="btn btn-primary fw-bold" onClick={handleSaveCategory} disabled={loading}>
                  {loading
                    ? <span className="spinner-border spinner-border-sm"></span>
                    : editingCat ? "Cập nhật" : "Thêm mới"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Style cột header
const thStyle = { fontSize: 13, fontWeight: 600, color: "#64748b" };
