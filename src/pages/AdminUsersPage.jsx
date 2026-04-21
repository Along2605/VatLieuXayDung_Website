// pages/AdminUsersPage.jsx
// Kiến thức: useState, useEffect, fetch, useAuth, isAdmin, isRootAdmin
// Trang quản lý user: xem danh sách, cấp/thu hồi quyền admin
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API = "/api/users";

// Label badge theo role
function RoleBadge({ user }) {
  if (user.isRoot) {
    return (
      <span className="badge" style={{ background: "#7c3aed", fontSize: 11 }}>
        <i className="bi bi-shield-fill-check me-1"></i>Root Admin
      </span>
    );
  }
  if (user.role === "admin") {
    return (
      <span className="badge" style={{ background: "#2563eb", fontSize: 11 }}>
        <i className="bi bi-shield-check me-1"></i>Admin
      </span>
    );
  }
  return (
    <span className="badge bg-secondary" style={{ fontSize: 11 }}>
      <i className="bi bi-person me-1"></i>Customer
    </span>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser, grantAdmin, revokeAdmin, isRootAdminUser } = useAuth();

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  // Lưu trạng thái loading của từng nút theo userId
  const [btnLoading, setBtnLoading] = useState({});
  // Toast thông báo
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }

  // ── Fetch danh sách user ─────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(API);
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Không tải được danh sách user.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Hiển thị toast tự tắt sau 3s ────────────────────────────────────────
  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Cấp quyền admin ──────────────────────────────────────────────────────
  async function handleGrant(targetId) {
    setBtnLoading((prev) => ({ ...prev, [targetId]: true }));
    const result = await grantAdmin(targetId);
    setBtnLoading((prev) => ({ ...prev, [targetId]: false }));

    if (result.ok) {
      showToast("success", "Đã cấp quyền Admin thành công!");
      fetchUsers(); // reload danh sách
    } else {
      showToast("error", result.error);
    }
  }

  // ── Thu hồi quyền admin ──────────────────────────────────────────────────
  async function handleRevoke(targetId) {
    if (!window.confirm("Bạn chắc chắn muốn thu hồi quyền Admin của user này?")) return;
    setBtnLoading((prev) => ({ ...prev, [targetId]: true }));
    const result = await revokeAdmin(targetId);
    setBtnLoading((prev) => ({ ...prev, [targetId]: false }));

    if (result.ok) {
      showToast("success", "Đã thu hồi quyền Admin.");
      fetchUsers();
    } else {
      showToast("error", result.error);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="container py-4">

      {/* Header trang */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">
            <i className="bi bi-people me-2 text-primary"></i>Quản lý người dùng
          </h4>
          <p className="text-muted small mb-0">
            Danh sách tài khoản · Cấp / Thu hồi quyền admin
          </p>
        </div>
        <span className="badge bg-primary rounded-pill px-3 py-2" style={{ fontSize: 13 }}>
          {users.length} tài khoản
        </span>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`alert alert-${toast.type === "success" ? "success" : "danger"} d-flex align-items-center gap-2 py-2 mb-3`}
          style={{ borderRadius: 10 }}
        >
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-exclamation-circle"}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="text-muted mt-2">Đang tải...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Bảng danh sách */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th className="ps-4 py-3" style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>ID</th>
                  <th className="py-3"      style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Họ tên</th>
                  <th className="py-3"      style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Email</th>
                  <th className="py-3"      style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Điện thoại</th>
                  <th className="py-3"      style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Quyền</th>
                  <th className="py-3 pe-4 text-end" style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf     = u.id === currentUser?.id;
                  const isUserRoot = u.isRoot;
                  const busy       = btnLoading[u.id];

                  return (
                    <tr key={u.id} style={isSelf ? { background: "#eff6ff" } : {}}>
                      {/* ID */}
                      <td className="ps-4 text-muted small">#{u.id}</td>

                      {/* Họ tên */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                            style={{
                              width: 36, height: 36,
                              background: isUserRoot ? "#7c3aed" : u.role === "admin" ? "#2563eb" : "#64748b",
                              fontSize: 13,
                            }}
                          >
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold small">{u.fullName}</div>
                            {isSelf && <div className="text-muted" style={{ fontSize: 11 }}>(Bạn)</div>}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="small text-muted">{u.email}</td>

                      {/* Điện thoại */}
                      <td className="small text-muted">{u.phone || "—"}</td>

                      {/* Badge quyền */}
                      <td><RoleBadge user={u} /></td>

                      {/* Nút thao tác */}
                      <td className="pe-4 text-end">
                        {/* Root admin → chỉ hiện label, không có nút */}
                        {isUserRoot && (
                          <span className="text-muted small fst-italic">Không thể thay đổi</span>
                        )}

                        {/* Chính mình → không thao tác */}
                        {!isUserRoot && isSelf && (
                          <span className="text-muted small fst-italic">Tài khoản của bạn</span>
                        )}

                        {/* Customer → nút Cấp quyền Admin (chỉ admin thấy) */}
                        {!isUserRoot && !isSelf && u.role === "customer" && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleGrant(u.id)}
                            disabled={busy}
                            style={{ fontSize: 12 }}
                          >
                            {busy
                              ? <span className="spinner-border spinner-border-sm"></span>
                              : <><i className="bi bi-shield-plus me-1"></i>Cấp Admin</>
                            }
                          </button>
                        )}

                        {/* Admin (không phải root) → nút Thu hồi (chỉ root thấy) */}
                        {!isUserRoot && !isSelf && u.role === "admin" && isRootAdminUser && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRevoke(u.id)}
                            disabled={busy}
                            style={{ fontSize: 12 }}
                          >
                            {busy
                              ? <span className="spinner-border spinner-border-sm"></span>
                              : <><i className="bi bi-shield-minus me-1"></i>Thu hồi Admin</>
                            }
                          </button>
                        )}

                        {/* Admin (không phải root) + người xem không phải root → chỉ xem */}
                        {!isUserRoot && !isSelf && u.role === "admin" && !isRootAdminUser && (
                          <span className="text-muted small fst-italic">Admin</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chú thích phân quyền */}
      <div className="card border-0 mt-4" style={{ background: "#f8fafc", borderRadius: 10 }}>
        <div className="card-body p-3 small text-muted">
          <div className="fw-semibold mb-2">
            <i className="bi bi-info-circle me-1"></i>Quy tắc phân quyền
          </div>
          <ul className="mb-0 ps-3">
            <li><span className="badge me-1" style={{ background: "#7c3aed" }}>Root Admin</span> — Không thể bị thay đổi quyền. Có thể thu hồi quyền admin của người khác.</li>
            <li><span className="badge bg-primary me-1">Admin</span> — Thêm/sửa/xóa sản phẩm, category. Cấp quyền admin cho customer.</li>
            <li><span className="badge bg-secondary me-1">Customer</span> — Chỉ xem sản phẩm và mua hàng.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
