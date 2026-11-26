import React, { useMemo, useState } from 'react';
import { UserPlus, Search, Edit3, Trash2 } from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { Relationship, ResidencyStatus, Resident } from '../types';
import { Badge, EmptyState, Pagination } from '../components/ui/Common';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { canEditApartmentsAndResidents } from '../utils/permissions';
import { validateCCCD } from '../utils/validators';
import { formatDateVN } from '../utils/format';

const RELATIONSHIPS: Relationship[] = ['Chủ hộ', 'Vợ/Chồng', 'Con', 'Bố/Mẹ', 'Khác'];
const STATUSES: ResidencyStatus[] = ['Thường trú', 'Tạm trú', 'Tạm vắng', 'Đã chuyển đi'];

export const ResidentsPage: React.FC = () => {
  const { state, currentUser, addResident, updateResident, deleteResident } = useBlueMoonStore();
  const toast = useToast();
  const canEdit = currentUser ? canEditApartmentsAndResidents(currentUser.role) : false;

  const [search, setSearch] = useState('');
  const [aptFilter, setAptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Resident | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resident | null>(null);

  // Form
  const [apartmentId, setApartmentId] = useState(state.apartments[0]?.id || '');
  const [fullName, setFullName] = useState('');
  const [cccd, setCccd] = useState('');
  const [dob, setDob] = useState('1990-01-01');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [relationship, setRelationship] = useState<Relationship>('Con');
  const [phone, setPhone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus>('Thường trú');
  const [formError, setFormError] = useState<string | null>(null);

  const aptMap = useMemo(
    () => new Map(state.apartments.map((a) => [a.id, a])),
    [state.apartments]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.residents.filter((r) => {
      const apt = aptMap.get(r.apartmentId);
      const matchQ =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.cccd.includes(q) ||
        (apt && apt.code.toLowerCase().includes(q));
      const matchApt = aptFilter === 'ALL' || r.apartmentId === aptFilter;
      const matchStatus = statusFilter === 'ALL' || r.residencyStatus === statusFilter;
      return matchQ && matchApt && matchStatus;
    });
  }, [aptFilter, aptMap, search, state.residents, statusFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setApartmentId(state.apartments[0]?.id || '');
    setFullName('');
    setCccd('');
    setDob('1990-01-01');
    setGender('Nam');
    setRelationship('Con');
    setPhone('');
    setOccupation('');
    setResidencyStatus('Thường trú');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (r: Resident) => {
    setEditing(r);
    setApartmentId(r.apartmentId);
    setFullName(r.fullName);
    setCccd(r.cccd);
    setDob(r.dob);
    setGender(r.gender);
    setRelationship(r.relationship);
    setPhone(r.phone || '');
    setOccupation(r.occupation || '');
    setResidencyStatus(r.residencyStatus);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cccdErr = validateCCCD(cccd);
    if (cccdErr) {
      setFormError(cccdErr);
      return;
    }

    if (editing) {
      const res = updateResident(editing.id, {
        apartmentId,
        fullName,
        cccd,
        dob,
        gender,
        relationship,
        phone,
        occupation,
        residencyStatus,
      });
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      toast.success('Đã cập nhật nhân khẩu', res.message);
      setModalOpen(false);
    } else {
      const res = addResident({
        apartmentId,
        fullName,
        cccd,
        dob,
        gender,
        relationship,
        phone,
        occupation,
        residencyStatus,
      });
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      toast.success('Đã thêm nhân khẩu', res.message);
      setModalOpen(false);
    }
  };

  const cccdLiveError = cccd.length > 0 ? validateCCCD(cccd) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách Nhân khẩu Cư dân</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            US-06 • Quản lý nhân khẩu gắn với từng căn hộ hợp lệ, kiểm chuẩn CCCD 12 chữ số.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            Thêm nhân khẩu
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo họ tên, số CCCD 12 số hoặc mã căn hộ..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
        </div>
        <select
          value={aptFilter}
          onChange={(e) => {
            setAptFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
        >
          <option value="ALL">Tất cả căn hộ</option>
          {state.apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} (Tầng {a.floor})
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
        >
          <option value="ALL">Tất cả tình trạng cư trú</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {paginated.length === 0 ? (
          <EmptyState title="Không tìm thấy nhân khẩu phù hợp" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="px-4 py-3.5 text-left">Họ và tên</th>
                    <th className="px-4 py-3.5 text-left">Căn hộ</th>
                    <th className="px-4 py-3.5 text-left">Số CCCD</th>
                    <th className="px-4 py-3.5 text-left">Ngày sinh</th>
                    <th className="px-4 py-3.5 text-left">Quan hệ chủ hộ</th>
                    <th className="px-4 py-3.5 text-left">Tình trạng</th>
                    {canEdit && <th className="px-4 py-3.5 text-right">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((r) => {
                    const apt = aptMap.get(r.apartmentId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-900">{r.fullName}</p>
                          <p className="text-xs text-slate-500">
                            {r.gender}
                            {r.phone ? ` • ${r.phone}` : ''}
                            {r.occupation ? ` • ${r.occupation}` : ''}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#1E3A8A]">
                          {apt?.code || '—'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-700">{r.cccd}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 tabular-nums">
                          {formatDateVN(r.dob)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={r.relationship === 'Chủ hộ' ? 'navy' : 'neutral'}>
                            {r.relationship}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={
                              r.residencyStatus === 'Thường trú'
                                ? 'success'
                                : r.residencyStatus === 'Tạm trú'
                                  ? 'info'
                                  : r.residencyStatus === 'Tạm vắng'
                                    ? 'warning'
                                    : 'neutral'
                            }
                          >
                            {r.residencyStatus}
                          </Badge>
                        </td>
                        {canEdit && (
                          <td className="px-4 py-3.5 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => openEdit(r)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#2563EB] hover:bg-blue-50"
                                title="Sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(r)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Add / Edit Resident Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Cập nhật nhân khẩu: ${editing.fullName}` : 'Thêm mới nhân khẩu'}
        subtitle="Các trường đánh dấu (*) là bắt buộc theo quy định quản lý cư trú."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="resident-form"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg"
            >
              {editing ? 'Lưu thay đổi' : 'Thêm nhân khẩu'}
            </button>
          </>
        }
      >
        <form id="resident-form" onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thuộc căn hộ <span className="text-red-600">*</span>
              </label>
              <select
                value={apartmentId}
                onChange={(e) => setApartmentId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {state.apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — Tầng {a.floor} ({a.area} m²)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quan hệ với chủ hộ <span className="text-red-600">*</span>
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as Relationship)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Minh Anh"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số CCCD (đúng 12 chữ số) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={cccd}
                onChange={(e) => setCccd(e.target.value.replace(/\s/g, ''))}
                placeholder="001095123456"
                className={`w-full px-3 py-2 text-sm border rounded-lg font-mono ${
                  cccdLiveError ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {cccdLiveError && <p className="text-[11px] text-red-600 mt-1">{cccdLiveError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày sinh <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giới tính <span className="text-red-600">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ' | 'Khác')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tình trạng cư trú <span className="text-red-600">*</span>
              </label>
              <select
                value={residencyStatus}
                onChange={(e) => setResidencyStatus(e.target.value as ResidencyStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase text-slate-400 mb-2.5">
              Thông tin tùy chọn
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
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
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nghề nghiệp (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="VD: Kỹ sư, Sinh viên..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const res = deleteResident(deleteTarget.id);
          if (res.ok) toast.success('Đã xóa', res.message);
        }}
        variant="danger"
        title={`Xóa hồ sơ nhân khẩu ${deleteTarget?.fullName}?`}
        description="Hành động này sẽ xóa nhân khẩu khỏi danh sách cư trú hiện tại. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel="Xóa nhân khẩu"
      />
    </div>
  );
};
