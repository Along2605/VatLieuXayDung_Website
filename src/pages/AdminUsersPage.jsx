// ============================================================
// pages/AdminUsersPage.jsx — Trang quản lý người dùng (Admin)
//
// Chỉ admin mới vào được (AdminRoute trong App.jsx)
// Hiển thị danh sách user + nút cấp/thu hồi quyền admin
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API = "/api/users";

// Badge hiển thị vai trò
function RoleBadge({ user }) {
  if (user.isRoot)       return <span className="badge" style={{ background: "#7c3aed" }}>Root Admin</span>;
  if (user.role === "admin") return <span className="badge bg-primary">Admin</span>;
  return                        <span className="badge bg-secondary">Customer</span>;
}

export default function AdminUsersPage() {
  const { user: currentUser, grantAdmin, revokeAdmin, isRootAdminUser } = useAuth();

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [btnLoading, setBtnLoading] = useState({}); // { [userId]: true/false }
  const [toast,      setToast]      = useState(null); // { type, msg }

  // Fetch danh sách user — useCallback để tránh tạo lại hàm mỗi lần render
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
  }, []); // [] = hàm không thay đổi

  // Gọi fetchUsers khi component mount
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Toast tự tắt sau 3 giây
  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  // Cấp quyền admin
  async function handleGrant(targetId) {
    setBtnLoading((prev) => ({ ...prev, [targetId]: true }));
    const result = await grantAdmin(targetId);
    setBtnLoading((prev) => ({ ...prev, [targetId]: false }));
    if (result.ok) {
      showToast("success", "Đã cấp quyền Admin!");
      fetchUsers(); // reload để hiển thị thay đổi
    } else {
      showToast("error", result.error);
    }
  }

  // Thu hồi quyền admin
  async function handleRevoke(targetId) {
    if (!window.confirm("Thu hồi quyền Admin của user này?")) return;
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

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">
            <i className="bi bi-people me-2 text-primary"></i>Quản lý người dùng
          </h4>
          <p className="text-muted small mb-0">Danh sách tài khoản · Cấp / Thu hồi quyền admin</p>
        </div>
        <span className="badge bg-primary rounded-pill px-3 py-2">{users.length} tài khoản</span>
      </div>

      {/* Toast thông báo */}
      {toast && (
        <div className={`alert alert-${toast.type === "success" ? "success" : "danger"} d-flex align-items-center gap-2 py-2 mb-3`}
          style={{ borderRadius: 10 }}>
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-x-circle"}`}></i>
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

      {/* Lỗi */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Bảng danh sách user */}
      {!loading && !error && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th className="ps-4 py-3 small text-muted fw-semibold">ID</th>
                  <th className="py-3 small text-muted fw-semibold">Họ tên</th>
                  <th className="py-3 small text-muted fw-semibold">Email</th>
                  <th className="py-3 small text-muted fw-semibold">Điện thoại</th>
                  <th className="py-3 small text-muted fw-semibold">Quyền</th>
                  <th className="py-3 pe-4 text-end small text-muted fw-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf     = u.id === currentUser?.id; // đang xem chính mình
                  const isUserRoot = u.isRoot;
                  const busy       = btnLoading[u.id];

                  return (
                    <tr key={u.id} style={isSelf ? { background: "#eff6ff" } : {}}>
                      <td className="ps-4 text-muted small">#{u.id}</td>

                      {/* Avatar + họ tên */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                            style={{
                              width: 36, height: 36, fontSize: 13,
                              background: isUserRoot ? "#7c3aed" : u.role === "admin" ? "#2563eb" : "#64748b",
                            }}>
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold small">{u.fullName}</div>
                            {isSelf && <div className="text-muted" style={{ fontSize: 11 }}>(Bạn)</div>}
                          </div>
                        </div>
                      </td>

                      <td className="small text-muted">{u.email}</td>
                      <td className="small text-muted">{u.phone || "—"}</td>
                      <td><RoleBadge user={u} /></td>

                      {/* Nút thao tác — hiển thị khác nhau tùy vai trò */}
                      <td className="pe-4 text-end">
                        {/* Root admin → không thao tác được */}
                        {isUserRoot && <span className="text-muted small fst-italic">Không thể thay đổi</span>}

                        {/* Chính mình → không thao tác */}
                        {!isUserRoot && isSelf && <span className="text-muted small fst-italic">Tài khoản của bạn</span>}

                        {/* Customer → nút Cấp Admin */}
                        {!isUserRoot && !isSelf && u.role === "customer" && (
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleGrant(u.id)} disabled={busy} style={{ fontSize: 12 }}>
                            {busy ? <span className="spinner-border spinner-border-sm"></span>
                                  : <><i className="bi bi-shield-plus me-1"></i>Cấp Admin</>}
                          </button>
                        )}

                        {/* Admin (không phải root) + người xem là root → nút Thu hồi */}
                        {!isUserRoot && !isSelf && u.role === "admin" && isRootAdminUser && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRevoke(u.id)} disabled={busy} style={{ fontSize: 12 }}>
                            {busy ? <span className="spinner-border spinner-border-sm"></span>
                                  : <><i className="bi bi-shield-minus me-1"></i>Thu hồi</>}
                          </button>
                        )}

                        {/* Admin + người xem không phải root → chỉ label */}
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

      {/* Chú thích */}
      <div className="card border-0 mt-4" style={{ background: "#f8fafc", borderRadius: 10 }}>
        <div className="card-body p-3 small text-muted">
          <div className="fw-semibold mb-2"><i className="bi bi-info-circle me-1"></i>Quy tắc phân quyền</div>
          <ul className="mb-0 ps-3">
            <li><strong>Root Admin</strong> — Không thể thay đổi. Có thể thu hồi quyền admin người khác.</li>
            <li><strong>Admin</strong> — Thêm/sửa/xóa sản phẩm, danh mục. Cấp quyền admin cho customer.</li>
            <li><strong>Customer</strong> — Chỉ được xem sản phẩm và mua hàng.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
