// ============================================================
// client/src/pages/AdminUsersPage.jsx
// Thay đổi: fetch('/api/users') → api.users.getAll()
// Lưu ý: backend trả về field 'full_name' (snake_case) thay vì 'fullName'
//         và 'is_root' thay vì 'isRoot'
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Badge vai trò — dùng field từ backend (is_root, role)
function RoleBadge({ user }) {
  if (user.is_root)          return <span className="badge" style={{ background: '#7c3aed' }}>Root Admin</span>;
  if (user.role === 'admin') return <span className="badge bg-primary">Admin</span>;
  return                            <span className="badge bg-secondary">Customer</span>;
}

export default function AdminUsersPage() {
  const { user: currentUser, grantAdmin, revokeAdmin, isRootAdminUser } = useAuth();

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [btnLoading, setBtnLoading] = useState({});
  const [toast,      setToast]      = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.users.getAll(); // GET /api/users
      setUsers(res.data);
    } catch (err) {
      setError(err.message || 'Không tải được danh sách user.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleGrant(targetId) {
    setBtnLoading((prev) => ({ ...prev, [targetId]: true }));
    const result = await grantAdmin(targetId);
    setBtnLoading((prev) => ({ ...prev, [targetId]: false }));
    if (result.ok) { showToast('success', 'Đã cấp quyền Admin!'); fetchUsers(); }
    else showToast('error', result.error);
  }

  async function handleRevoke(targetId) {
    if (!window.confirm('Thu hồi quyền Admin của user này?')) return;
    setBtnLoading((prev) => ({ ...prev, [targetId]: true }));
    const result = await revokeAdmin(targetId);
    setBtnLoading((prev) => ({ ...prev, [targetId]: false }));
    if (result.ok) { showToast('success', 'Đã thu hồi quyền Admin.'); fetchUsers(); }
    else showToast('error', result.error);
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0"><i className="bi bi-people me-2 text-primary"></i>Quản lý người dùng</h4>
          <p className="text-muted small mb-0">Danh sách tài khoản · Cấp / Thu hồi quyền</p>
        </div>
        <span className="badge bg-primary rounded-pill px-3 py-2">{users.length} tài khoản</span>
      </div>

      {toast && (
        <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 py-2 mb-3`} style={{ borderRadius: 10 }}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle' : 'bi-x-circle'}`}></i>{toast.msg}
        </div>
      )}

      {loading && <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ background: '#f8fafc' }}>
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
                  const isSelf     = u.id === currentUser?.id;
                  const isUserRoot = u.is_root; // ← backend trả is_root (snake_case)
                  const busy       = btnLoading[u.id];

                  return (
                    <tr key={u.id} style={isSelf ? { background: '#eff6ff' } : {}}>
                      <td className="ps-4 text-muted small">#{u.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                            style={{ width: 36, height: 36, fontSize: 13,
                              background: isUserRoot ? '#7c3aed' : u.role === 'admin' ? '#2563eb' : '#64748b' }}>
                            {/* full_name từ backend */}
                            {u.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold small">{u.full_name}</div>
                            {isSelf && <div className="text-muted" style={{ fontSize: 11 }}>(Bạn)</div>}
                          </div>
                        </div>
                      </td>
                      <td className="small text-muted">{u.email}</td>
                      <td className="small text-muted">{u.phone || '—'}</td>
                      <td><RoleBadge user={u} /></td>
                      <td className="pe-4 text-end">
                        {isUserRoot && <span className="text-muted small fst-italic">Không thể thay đổi</span>}
                        {!isUserRoot && isSelf && <span className="text-muted small fst-italic">Tài khoản của bạn</span>}
                        {!isUserRoot && !isSelf && u.role === 'customer' && (
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleGrant(u.id)} disabled={busy} style={{ fontSize: 12 }}>
                            {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-shield-plus me-1"></i>Cấp Admin</>}
                          </button>
                        )}
                        {!isUserRoot && !isSelf && u.role === 'admin' && isRootAdminUser && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRevoke(u.id)} disabled={busy} style={{ fontSize: 12 }}>
                            {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-shield-minus me-1"></i>Thu hồi</>}
                          </button>
                        )}
                        {!isUserRoot && !isSelf && u.role === 'admin' && !isRootAdminUser && (
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
    </div>
  );
}
