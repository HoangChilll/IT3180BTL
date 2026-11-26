import React, { useState } from 'react';
import { UserPlus, ShieldCheck, Lock, Unlock, Edit3, Search } from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { Role, User } from '../types';
import { ROLE_META } from '../utils/permissions';
import { formatDateTimeVN } from '../utils/format';
import { Badge } from '../components/ui/Common';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { validatePassword } from '../utils/validators';

export const UsersPage: React.FC = () => {
  const { state, currentUser, createUser, updateUser, toggleUserStatus } = useBlueMoonStore();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('ACCOUNTANT');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Không có quyền truy cập</h2>
        <p className="text-sm text-slate-500 mt-1">
          US-03: Chỉ Trưởng Ban Quản trị (Admin) mới có quyền quản lý tài khoản cán bộ.
        </p>
      </div>
    );
  }

  const filtered = state.users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q));
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchQ && matchRole;
  });

  const openCreate = () => {
    setEditingUser(null);
    setUsername('');
    setFullName('');
    setPassword('BlueMoon2026');
    setRole('ACCOUNTANT');
    setEmail('');
    setPhone('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setFullName(u.fullName);
    setPassword('');
    setRole(u.role);
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (editingUser) {
      const res = updateUser(editingUser.id, { fullName, role, email, phone });
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      toast.success('Đã cập nhật', res.message);
      setModalOpen(false);
    } else {
      const pwdErr = validatePassword(password);
      if (pwdErr) {
        setFormError(pwdErr);
        return;
      }
      const res = createUser({ username, fullName, password, role, email, phone });
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      toast.success('Đã tạo tài khoản', res.message);
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Tài khoản Cán bộ BQT</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            US-03 • Phân quyền vai trò và kích hoạt/khóa tài khoản cán bộ có hiệu lực tức thì.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          Thêm tài khoản cán bộ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đăng nhập, họ tên, email..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2563EB]"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="ADMIN">Trưởng BQT (Admin)</option>
          <option value="ACCOUNTANT">Kế toán BQT</option>
          <option value="CASHIER">Thủ quỹ</option>
          <option value="RESIDENT_OFFICER">Cán bộ dân cư</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold text-slate-600 uppercase">
                <th className="px-4 py-3.5">Tên đăng nhập</th>
                <th className="px-4 py-3.5">Họ và tên</th>
                <th className="px-4 py-3.5">Vai trò</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Đăng nhập gần nhất</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5 font-mono font-semibold text-[#1E3A8A]">
                    @{u.username}
                    {u.id === currentUser.id && (
                      <span className="ml-2 text-[10px] font-sans px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        Bạn
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900">{u.fullName}</p>
                    <p className="text-xs text-slate-500">{u.email || u.phone || '—'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_META[u.role].badgeClass}`}
                    >
                      {ROLE_META[u.role].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {u.status === 'ACTIVE' ? (
                      <Badge variant="success">Hoạt động</Badge>
                    ) : (
                      <div>
                        <Badge variant="danger">Đã khóa</Badge>
                        {u.lockedReason && (
                          <p className="text-[11px] text-red-600 mt-1">{u.lockedReason}</p>
                        )}
                      </div>
                    )}
                    {u.failedAttempts > 0 && u.status === 'ACTIVE' && (
                      <p className="text-[11px] text-amber-600 mt-0.5">
                        Sai mật khẩu: {u.failedAttempts}/5 lần
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 tabular-nums">
                    {formatDateTimeVN(u.lastLoginAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2 rounded-lg text-slate-600 hover:text-[#2563EB] hover:bg-blue-50 transition"
                        title="Sửa thông tin"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => setConfirmToggle(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                            u.status === 'ACTIVE'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Khóa
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" /> Mở khóa
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Cập nhật cán bộ @${editingUser.username}` : 'Thêm tài khoản cán bộ mới'}
        subtitle="Tên đăng nhập phải duy nhất trong toàn hệ thống."
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="user-form"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg"
            >
              {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên đăng nhập <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                disabled={Boolean(editingUser)}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: ketoan2"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vai trò phân quyền <span className="text-red-600">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="ADMIN">Trưởng BQT (Admin)</option>
                <option value="ACCOUNTANT">Kế toán BQT</option>
                <option value="CASHIER">Thủ quỹ</option>
                <option value="RESIDENT_OFFICER">Cán bộ dân cư</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Thị Minh Anh"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu khởi tạo <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email (Tùy chọn)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@bluemoon.vn"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại (Tùy chọn)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Lock / Unlock */}
      <ConfirmDialog
        open={Boolean(confirmToggle)}
        onClose={() => setConfirmToggle(null)}
        onConfirm={() => {
          if (!confirmToggle) return;
          const res = toggleUserStatus(confirmToggle.id);
          if (res.ok) toast.success('Cập nhật trạng thái', res.message);
          else toast.error('Không thể thực hiện', res.message);
        }}
        variant={confirmToggle?.status === 'ACTIVE' ? 'danger' : 'primary'}
        title={
          confirmToggle?.status === 'ACTIVE'
            ? `Khóa tài khoản @${confirmToggle.username}?`
            : `Kích hoạt mở khóa @${confirmToggle?.username}?`
        }
        description={
          confirmToggle?.status === 'ACTIVE'
            ? 'Tài khoản bị khóa sẽ không thể đăng nhập mới vào hệ thống ngay lập tức.'
            : 'Tài khoản sẽ được mở khóa và đặt lại số lần nhập sai mật khẩu về 0.'
        }
        confirmLabel={confirmToggle?.status === 'ACTIVE' ? 'Khóa ngay' : 'Mở khóa'}
      />
    </div>
  );
};
