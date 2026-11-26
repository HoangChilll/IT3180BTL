import React, { useMemo, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit3,
  UserCheck,
  History,
  AlertTriangle,
  Users,
  Phone,
  Calendar,
  Car,
} from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { Apartment, ApartmentType } from '../types';
import { Badge, EmptyState, Pagination } from '../components/ui/Common';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { canEditApartmentsAndResidents } from '../utils/permissions';
import { validateApartmentArea, validateCCCD } from '../utils/validators';
import { formatDateVN } from '../utils/format';

export const ApartmentsPage: React.FC<{ initialSearch?: string }> = ({ initialSearch = '' }) => {
  const {
    state,
    currentUser,
    addApartment,
    updateApartment,
    getCurrentRepresentative,
    assignRepresentative,
  } = useBlueMoonStore();
  const toast = useToast();

  const canEdit = currentUser ? canEditApartmentsAndResidents(currentUser.role) : false;

  const [search, setSearch] = useState(initialSearch);
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // CRUD Modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);
  const [code, setCode] = useState('');
  const [floor, setFloor] = useState(1);
  const [area, setArea] = useState(75);
  const [type, setType] = useState<ApartmentType>('2PN');
  const [status, setStatus] = useState<'OCCUPIED' | 'VACANT'>('OCCUPIED');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Representative Detail & Timeline Modal (US-05)
  const [detailApt, setDetailApt] = useState<Apartment | null>(null);
  const [repFormOpen, setRepFormOpen] = useState(false);
  const [repName, setRepName] = useState('');
  const [repCCCD, setRepCCCD] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repDate, setRepDate] = useState(new Date().toISOString().slice(0, 10));
  const [repNote, setRepNote] = useState('');
  const [repError, setRepError] = useState<string | null>(null);

  const floors = useMemo(
    () => Array.from(new Set(state.apartments.map((a) => a.floor))).sort((a, b) => a - b),
    [state.apartments]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.apartments
      .filter((a) => {
        const rep = getCurrentRepresentative(a.id);
        const matchQ =
          !q ||
          a.code.toLowerCase().includes(q) ||
          (rep && rep.residentName.toLowerCase().includes(q));
        const matchFloor = floorFilter === 'ALL' || a.floor === Number(floorFilter);
        const matchType = typeFilter === 'ALL' || a.type === typeFilter;
        return matchQ && matchFloor && matchType;
      })
      .sort((a, b) => a.floor - b.floor || a.code.localeCompare(b.code, 'vi'));
  }, [floorFilter, getCurrentRepresentative, search, state.apartments, typeFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditingApt(null);
    setCode('');
    setFloor(1);
    setArea(75);
    setType('2PN');
    setStatus('OCCUPIED');
    setNotes('');
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (apt: Apartment) => {
    setEditingApt(apt);
    setCode(apt.code);
    setFloor(apt.floor);
    setArea(apt.area);
    setType(apt.type);
    setStatus(apt.status);
    setNotes(apt.notes || '');
    setFormError(null);
    setFormOpen(true);
  };

  const handleSaveApt = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const areaErr = validateApartmentArea(area);
    if (areaErr) {
      setFormError(areaErr);
      return;
    }

    if (editingApt) {
      const res = updateApartment(editingApt.id, { code, floor, area, type, status, notes });
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      toast.success('Đã cập nhật căn hộ', res.message);
      setFormOpen(false);
    } else {
      const res = addApartment({ code, floor, area, type, status, notes });
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      toast.success('Đã thêm căn hộ mới', res.message);
      setFormOpen(false);
    }
  };

  const handleAssignRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailApt) return;
    setRepError(null);
    const cccdErr = validateCCCD(repCCCD);
    if (cccdErr) {
      setRepError(cccdErr);
      return;
    }
    const res = assignRepresentative(detailApt.id, {
      residentName: repName,
      cccd: repCCCD,
      phone: repPhone,
      effectiveDate: repDate,
      note: repNote,
    });
    if (!res.ok) {
      setRepError(res.message);
      return;
    }
    toast.success('Đã cập nhật chủ hộ / đại diện', res.message);
    setRepFormOpen(false);
    setRepName('');
    setRepCCCD('');
    setRepPhone('');
    setRepNote('');
  };

  const detailHistories = detailApt
    ? state.representativeHistories
        .filter((h) => h.apartmentId === detailApt.id)
        .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
    : [];

  const detailResidents = detailApt
    ? state.residents.filter((r) => r.apartmentId === detailApt.id)
    : [];

  const detailVehicles = detailApt
    ? state.vehicles.filter((v) => v.apartmentId === detailApt.id && v.status === 'ACTIVE')
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ Căn hộ & Người đại diện</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            US-04 & US-05 • Quản lý danh sách căn hộ theo tầng, diện tích tính phí (30–250 m²) và lịch sử chủ hộ.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Thêm căn hộ mới
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
            placeholder="Tìm theo mã căn hộ (P101, P1205) hoặc tên chủ hộ..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
        </div>
        <select
          aria-label="Lọc theo tầng"
          value={floorFilter}
          onChange={(e) => {
            setFloorFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
        >
          <option value="ALL">Tất cả các tầng</option>
          {floors.map((f) => (
            <option key={f} value={f}>
              Tầng {f}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc theo loại căn hộ"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
        >
          <option value="ALL">Tất cả loại hình</option>
          <option value="1PN">1 Phòng ngủ (1PN)</option>
          <option value="2PN">2 Phòng ngủ (2PN)</option>
          <option value="3PN">3 Phòng ngủ (3PN)</option>
          <option value="Penthouse">Penthouse</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {paginated.length === 0 ? (
          <EmptyState
            title="Không tìm thấy căn hộ nào"
            description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc tầng/loại căn hộ."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="px-4 py-3.5 text-left">Mã căn</th>
                    <th className="px-4 py-3.5 text-center">Tầng</th>
                    <th className="px-4 py-3.5 text-right">Diện tích</th>
                    <th className="px-4 py-3.5 text-left">Loại hình</th>
                    <th className="px-4 py-3.5 text-left">Chủ hộ / Đại diện hiện tại</th>
                    <th className="px-4 py-3.5 text-center">Nhân khẩu</th>
                    <th className="px-4 py-3.5 text-left">Trạng thái</th>
                    <th className="px-4 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((apt) => {
                    const rep = getCurrentRepresentative(apt.id);
                    const residentCount = state.residents.filter((r) => r.apartmentId === apt.id).length;
                    const histCount = state.representativeHistories.filter(
                      (h) => h.apartmentId === apt.id
                    ).length;
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5 font-bold text-[#1E3A8A]">{apt.code}</td>
                        <td className="px-4 py-3.5 text-center tabular-nums text-slate-700">
                          Tầng {apt.floor}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                          {apt.area} m²
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={apt.type === 'Penthouse' ? 'navy' : 'neutral'}>
                            {apt.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {rep ? (
                            <div>
                              <p className="font-semibold text-slate-900">{rep.residentName}</p>
                              <p className="text-xs text-slate-500 tabular-nums">
                                {rep.phone} • Hiệu lực từ {formatDateVN(rep.effectiveDate)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs italic text-slate-400">Chưa gán đại diện</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center tabular-nums">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {residentCount}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {apt.status === 'OCCUPIED' ? (
                            <Badge variant="success">Đang ở</Badge>
                          ) : (
                            <Badge variant="warning">Đang trống</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setDetailApt(apt);
                                setRepFormOpen(false);
                                setRepError(null);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 transition"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Đại diện ({histCount})
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => openEdit(apt)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#2563EB] hover:bg-slate-100 transition"
                                title="Sửa căn hộ"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
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

      {/* Create / Edit Apartment Modal (US-04) */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingApt ? `Chỉnh sửa căn hộ ${editingApt.code}` : 'Thêm hồ sơ căn hộ mới'}
        subtitle="Diện tích hợp lệ từ 30 m² đến 250 m². Mã căn hộ là duy nhất."
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="apt-form"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg"
            >
              {editingApt ? 'Lưu cập nhật' : 'Tạo căn hộ'}
            </button>
          </>
        }
      >
        <form id="apt-form" onSubmit={handleSaveApt} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {formError}
            </div>
          )}

          {editingApt && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý nghiệp vụ (US-04):</strong> Khi thay đổi diện tích căn hộ, hệ thống{' '}
                <strong>không tự ý điều chỉnh số tiền các kỳ phí đã chốt trước đó</strong>. Diện
                tích mới chỉ áp dụng cho các bảng kê lập sau thời điểm cập nhật.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã căn hộ <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: P905"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số tầng <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Diện tích sử dụng (m²) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
              <p className="text-[11px] text-slate-500 mt-1">Khoảng hợp lệ: 30 m² – 250 m²</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại hình căn hộ <span className="text-red-600">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ApartmentType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="1PN">1 Phòng ngủ (1PN)</option>
                <option value="2PN">2 Phòng ngủ (2PN)</option>
                <option value="3PN">3 Phòng ngủ (3PN)</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái sử dụng</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'OCCUPIED' | 'VACANT')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="OCCUPIED">Đang có cư dân sinh sống</option>
              <option value="VACANT">Căn hộ trống / Chưa bàn giao</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú (Tùy chọn)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm về hiện trạng căn hộ..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </form>
      </Modal>

      {/* US-05: Apartment Detail & Representative History Modal */}
      <Modal
        open={Boolean(detailApt)}
        onClose={() => setDetailApt(null)}
        title={detailApt ? `Hồ sơ chi tiết căn hộ ${detailApt.code}` : ''}
        subtitle={
          detailApt
            ? `Tầng ${detailApt.floor} • Diện tích ${detailApt.area} m² • Loại ${detailApt.type}`
            : ''
        }
        size="lg"
      >
        {detailApt && (
          <div className="space-y-6">
            {/* Quick Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Diện tích tính phí</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {detailApt.area} m²
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Nhân khẩu hiện tại</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {detailResidents.length} người
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Phương tiện gửi xe</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-[#2563EB]" />
                  {detailVehicles.length} xe
                </p>
              </div>
            </div>

            {/* Assign New Representative Section */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#1E3A8A]" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Lịch sử Chủ hộ / Người đại diện (US-05)
                  </h4>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setRepFormOpen((v) => !v)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition"
                  >
                    {repFormOpen ? 'Đóng form' : '+ Cập nhật đại diện mới'}
                  </button>
                )}
              </div>

              {repFormOpen && (
                <form
                  onSubmit={handleAssignRep}
                  className="p-4 bg-blue-50/40 border-b border-slate-200 space-y-3"
                >
                  <p className="text-xs text-blue-900 font-medium">
                    Người đại diện cũ sẽ tự động được chốt ngày kết thúc và lưu vĩnh viễn trong dòng
                    thời gian lịch sử (không xóa dữ liệu cũ).
                  </p>
                  {repError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      {repError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ tên đại diện mới <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={repName}
                        onChange={(e) => setRepName(e.target.value)}
                        placeholder="VD: Nguyễn Minh Đức"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số CCCD (12 chữ số) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={repCCCD}
                        onChange={(e) => setRepCCCD(e.target.value)}
                        placeholder="001090123456"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số điện thoại liên hệ <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={repPhone}
                        onChange={(e) => setRepPhone(e.target.value)}
                        placeholder="09xxxxxxxx"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ngày hiệu lực <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={repDate}
                        onChange={(e) => setRepDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lý do / Căn cứ bàn giao (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={repNote}
                      onChange={(e) => setRepNote(e.target.value)}
                      placeholder="VD: Chuyển nhượng quyền sở hữu / Hợp đồng thuê mới"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1E3A8A] text-white hover:bg-[#172554]"
                    >
                      Xác nhận cập nhật đại diện
                    </button>
                  </div>
                </form>
              )}

              {/* Timeline */}
              <div className="p-4">
                {detailHistories.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    Chưa có thông tin người đại diện cho căn hộ này.
                  </p>
                ) : (
                  <ol className="relative border-l-2 border-slate-200 ml-3 space-y-5">
                    {detailHistories.map((h) => {
                      const active = !h.endDate;
                      return (
                        <li key={h.id} className="ml-5">
                          <span
                            className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white ${
                              active ? 'bg-[#16A34A] ring-4 ring-emerald-100' : 'bg-slate-400'
                            }`}
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-900">
                              {h.residentName}{' '}
                              {active ? (
                                <Badge variant="success" className="ml-1.5">
                                  Đang hiệu lực
                                </Badge>
                              ) : (
                                <Badge variant="neutral" className="ml-1.5">
                                  Lịch sử cũ
                                </Badge>
                              )}
                            </p>
                            <span className="text-xs text-slate-500 flex items-center gap-1 tabular-nums">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDateVN(h.effectiveDate)} →{' '}
                              {h.endDate ? formatDateVN(h.endDate) : 'Hiện tại'}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
                            <span className="font-mono">CCCD: {h.cccd}</span>
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {h.phone}
                            </span>
                          </div>
                          {h.note && <p className="text-xs text-slate-500 mt-1 italic">{h.note}</p>}
                          <p className="text-[11px] text-slate-400 mt-1">
                            Cập nhật bởi: {h.updatedBy}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>

            {/* Residents inside this apartment */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2563EB]" />
                Danh sách nhân khẩu thuộc căn hộ ({detailResidents.length})
              </h4>
              {detailResidents.length === 0 ? (
                <p className="text-xs text-slate-500">Chưa có nhân khẩu đăng ký.</p>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-3 py-2 text-left">Họ tên</th>
                        <th className="px-3 py-2 text-left">CCCD</th>
                        <th className="px-3 py-2 text-left">Quan hệ</th>
                        <th className="px-3 py-2 text-left">Tình trạng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detailResidents.map((r) => (
                        <tr key={r.id}>
                          <td className="px-3 py-2 font-semibold text-slate-800">{r.fullName}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{r.cccd}</td>
                          <td className="px-3 py-2">{r.relationship}</td>
                          <td className="px-3 py-2">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
