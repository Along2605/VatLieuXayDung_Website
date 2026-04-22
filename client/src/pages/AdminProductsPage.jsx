// ============================================================
// client/src/pages/AdminProductsPage.jsx
// Thay đổi: fetch('/api/products') → api.products.getAll()
//           fetch('/api/categories') → api.categories.getAll()
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import api from '../services/api';

function formatPrice(price) {
  return price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫';
}

const EMPTY_PRODUCT  = { name: '', price: '', unit: '', category: '', brand: '', stock: '', rating: 4.5, reviews: 0, sale: false, old_price: '', img: '', description: '' };
const EMPTY_CATEGORY = { id: '', label: '', icon: 'box' };

export default function AdminProductsPage() {
  const { user } = useAuth();
  const { loading, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory } = useProducts(user);

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [fetching,   setFetching]   = useState(true);
  const [tab,    setTab]    = useState('products');
  const [search, setSearch] = useState('');
  const [toast,  setToast]  = useState(null);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct,   setEditingProduct]   = useState(null);
  const [productForm,      setProductForm]      = useState(EMPTY_PRODUCT);

  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat,   setEditingCat]   = useState(null);
  const [catForm,      setCatForm]      = useState(EMPTY_CATEGORY);

  async function fetchData() {
    setFetching(true);
    try {
      // Dùng api service thay vì fetch trực tiếp
      const [pRes, cRes] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll(),
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data.filter((c) => c.id !== 'all'));
    } catch { showToast('error', 'Không tải được dữ liệu.'); }
    finally   { setFetching(false); }
  }

  useEffect(() => { fetchData(); }, []);

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Product handlers ──────────────────────────────────────
  function openAddProduct()  { setEditingProduct(null); setProductForm(EMPTY_PRODUCT); setShowProductModal(true); }
  function openEditProduct(p) {
    setEditingProduct(p);
    setProductForm({ name: p.name, price: p.price, unit: p.unit, category: p.category,
      brand: p.brand || '', stock: p.stock || '', rating: p.rating || 4.5, reviews: p.reviews || 0,
      sale: p.sale || false, old_price: p.old_price || '', img: p.img || '', description: p.description || '' });
    setShowProductModal(true);
  }

  async function handleSaveProduct() {
    if (!productForm.name.trim()) return showToast('error', 'Vui lòng nhập tên sản phẩm.');
    if (!productForm.price)       return showToast('error', 'Vui lòng nhập giá.');
    if (!productForm.category)    return showToast('error', 'Vui lòng chọn danh mục.');

    const data = { ...productForm,
      price:     Number(productForm.price),
      old_price: productForm.old_price ? Number(productForm.old_price) : null,
      stock:     Number(productForm.stock) || 0,
    };
    const result = editingProduct ? await updateProduct(editingProduct.id, data) : await addProduct(data);
    if (result.ok) { showToast('success', editingProduct ? 'Đã cập nhật!' : 'Đã thêm!'); setShowProductModal(false); fetchData(); }
    else showToast('error', result.error);
  }

  async function handleDeleteProduct(p) {
    if (!window.confirm(`Xóa "${p.name}"?`)) return;
    const result = await deleteProduct(p.id);
    if (result.ok) { showToast('success', 'Đã xóa sản phẩm.'); fetchData(); }
    else showToast('error', result.error);
  }

  // ── Category handlers ─────────────────────────────────────
  function openAddCategory()  { setEditingCat(null); setCatForm(EMPTY_CATEGORY); setShowCatModal(true); }
  function openEditCategory(c) { setEditingCat(c); setCatForm({ id: c.id, label: c.label, icon: c.icon || 'box' }); setShowCatModal(true); }

  async function handleSaveCategory() {
    if (!catForm.label.trim()) return showToast('error', 'Vui lòng nhập tên danh mục.');
    if (!editingCat && !catForm.id.trim()) return showToast('error', 'Vui lòng nhập ID.');
    const result = editingCat
      ? await updateCategory(editingCat.id, { label: catForm.label, icon: catForm.icon })
      : await addCategory({ id: catForm.id.trim(), label: catForm.label, icon: catForm.icon });
    if (result.ok) { showToast('success', editingCat ? 'Đã cập nhật!' : 'Đã thêm!'); setShowCatModal(false); fetchData(); }
    else showToast('error', result.error);
  }

  async function handleDeleteCategory(cat) {
    if (!window.confirm(`Xóa danh mục "${cat.label}"?`)) return;
    const result = await deleteCategory(cat.id);
    if (result.ok) { showToast('success', 'Đã xóa danh mục.'); fetchData(); }
    else showToast('error', result.error);
  }

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h4 className="fw-bold mb-0"><i className="bi bi-box-seam me-2 text-primary"></i>Quản lý kho hàng</h4>
        <p className="text-muted small mb-0">Sản phẩm & Danh mục · Chỉ Admin</p>
      </div>

      {toast && (
        <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 py-2 mb-3`} style={{ borderRadius: 10 }}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle' : 'bi-x-circle'}`}></i>{toast.msg}
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'products' ? 'active fw-bold' : ''}`} onClick={() => setTab('products')}>
            <i className="bi bi-box me-1"></i>Sản phẩm ({products.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'categories' ? 'active fw-bold' : ''}`} onClick={() => setTab('categories')}>
            <i className="bi bi-tags me-1"></i>Danh mục ({categories.length})
          </button>
        </li>
      </ul>

      {fetching && <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>}

      {/* Tab sản phẩm */}
      {!fetching && tab === 'products' && (
        <>
          <div className="d-flex justify-content-between gap-2 mb-3">
            <input type="text" className="form-control" style={{ maxWidth: 320 }}
              placeholder="Tìm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn btn-primary fw-bold" onClick={openAddProduct}>
              <i className="bi bi-plus-lg me-1"></i>Thêm sản phẩm
            </button>
          </div>
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th className="ps-4 py-3 small text-muted fw-semibold">ID</th>
                    <th className="py-3 small text-muted fw-semibold">Tên sản phẩm</th>
                    <th className="py-3 small text-muted fw-semibold">Danh mục</th>
                    <th className="py-3 small text-muted fw-semibold">Giá</th>
                    <th className="py-3 small text-muted fw-semibold">Kho</th>
                    <th className="py-3 pe-4 text-end small text-muted fw-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="ps-4 text-muted small">#{p.id}</td>
                      <td><div className="fw-semibold small">{p.name}</div><div className="text-muted" style={{ fontSize: 11 }}>{p.brand}</div></td>
                      <td><span className="badge bg-light text-dark border">{p.category}</span></td>
                      <td className="small fw-semibold" style={{ color: '#2563eb' }}>{formatPrice(p.price)}</td>
                      <td className="small">{p.stock ?? '—'}</td>
                      <td className="pe-4 text-end">
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEditProduct(p)} style={{ fontSize: 12 }}>
                          <i className="bi bi-pencil me-1"></i>Sửa
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProduct(p)} disabled={loading} style={{ fontSize: 12 }}>
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

      {/* Tab danh mục */}
      {!fetching && tab === 'categories' && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-primary fw-bold" onClick={openAddCategory}>
              <i className="bi bi-plus-lg me-1"></i>Thêm danh mục
            </button>
          </div>
          <div className="row g-3">
            {categories.map((cat) => (
              <div className="col-sm-6 col-md-4 col-lg-3" key={cat.id}>
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <i className={`bi bi-${cat.icon} me-2 text-primary`}></i>
                      <span className="fw-semibold small">{cat.label}</span>
                      <div className="text-muted" style={{ fontSize: 11 }}>ID: {cat.id}</div>
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => openEditCategory(cat)} style={{ fontSize: 12, padding: '2px 8px' }}><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCategory(cat)} disabled={loading} style={{ fontSize: 12, padding: '2px 8px' }}><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal sản phẩm */}
      {showProductModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.45)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h5>
                <button className="btn-close" onClick={() => setShowProductModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Tên sản phẩm *</label>
                    <input type="text" className="form-control" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Giá (VNĐ) *</label>
                    <input type="number" className="form-control" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Đơn vị</label>
                    <input type="text" className="form-control" placeholder="túi, cây..." value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Tồn kho</label>
                    <input type="number" className="form-control" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Danh mục *</label>
                    <select className="form-select" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                      <option value="">-- Chọn --</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Thương hiệu</label>
                    <input type="text" className="form-control" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <div className="form-check mt-4">
                      <input type="checkbox" className="form-check-input" id="chkSale" checked={productForm.sale} onChange={(e) => setProductForm({ ...productForm, sale: e.target.checked })} />
                      <label className="form-check-label small fw-semibold" htmlFor="chkSale">Đang khuyến mãi</label>
                    </div>
                  </div>
                  {productForm.sale && (
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Giá gốc</label>
                      <input type="number" className="form-control" value={productForm.old_price} onChange={(e) => setProductForm({ ...productForm, old_price: e.target.value })} />
                    </div>
                  )}
                  <div className="col-md-8">
                    <label className="form-label fw-semibold small">Tên file ảnh</label>
                    <input type="text" className="form-control" placeholder="ten-anh.png" value={productForm.img} onChange={(e) => setProductForm({ ...productForm, img: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Mô tả</label>
                    <textarea className="form-control" rows={2} style={{ resize: 'none' }} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setShowProductModal(false)}>Huỷ</button>
                <button className="btn btn-primary fw-bold" onClick={handleSaveProduct} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal danh mục */}
      {showCatModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.45)' }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingCat ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h5>
                <button className="btn-close" onClick={() => setShowCatModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {!editingCat && (
                    <div className="col-12">
                      <label className="form-label fw-semibold small">ID (slug) *</label>
                      <input type="text" className="form-control" placeholder="gach-men" value={catForm.id} onChange={(e) => setCatForm({ ...catForm, id: e.target.value })} />
                    </div>
                  )}
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Tên danh mục *</label>
                    <input type="text" className="form-control" value={catForm.label} onChange={(e) => setCatForm({ ...catForm, label: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Bootstrap Icon</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><i className={`bi bi-${catForm.icon}`}></i></span>
                      <input type="text" className="form-control" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setShowCatModal(false)}>Huỷ</button>
                <button className="btn btn-primary fw-bold" onClick={handleSaveCategory} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : editingCat ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
