import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Plus, Download, Search, Calendar } from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { ResidencyEventType } from '../types';
import { Badge, EmptyState } from '../components/ui/Common';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { canEditApartmentsAndResidents, canExportResidencyEvents } from '../utils/permissions';
import { formatDateVN } from '../utils/format';
import { exportResidencyEventsExcel } from '../utils/excelExport';

export const ResidencyEventsPage: React.FC = () => {
  const { state, currentUser, addResidencyEvent } = useBlueMoonStore();
  const toast = useToast();

  const canEdit = currentUser ? canEditApartmentsAndResidents(currentUser.role) : false;
  const canExport = currentUser ? canExportResidencyEvents(currentUser.role) : false;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  // Modal Form
  const [modalOpen, setModalOpen] = useState(false);
  const [residentId, setResidentId] = useState(state.residents[0]?.id || '');
  const [type, setType] = useState<ResidencyEventType>('Tạm trú');
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.residencyEvents.filter((ev) => {
      const matchQ =
        !q ||
        ev.residentName.toLowerCase().includes(q) ||
        ev.apartmentCode.toLowerCase().includes(q) ||
        ev.reason.toLowerCase().includes(q);
      const matchType = typeFilter === 'ALL' || ev.type === typeFilter;
      const matchFrom = !fromFilter || ev.fromDate >= fromFilter;
      const matchTo = !toFilter || ev.fromDate <= toFilter;
      return matchQ && matchType && matchFrom && matchTo;
    });
  }, [fromFilter, search, state.residencyEvents, toFilter, typeFilter]);

  const counts = useMemo(
    () => ({
      tamTru: state.residencyEvents.filter((e) => e.type === 'Tạm trú').length,
      tamVang: state.residencyEvents.filter((e) => e.type === 'Tạm vắng').length,
      chuyenDi: state.residencyEvents.filter((e) => e.type === 'Thay đổi nơi cư trú').length,
    }),
    [state.residencyEvents]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const res = addResidencyEvent({
      residentId,
      type,
      fromDate,
      toDate: toDate || undefined,
      reason,
    });
    if (!res.ok) {
      setFormError(res.message);
      return;
    }
    toast.success('Đã ghi nhận biến động', res.message);
    setModalOpen(false);
    setReason('');
    setToDate('');
  };

  const handleExport = () => {
    exportResidencyEventsExcel(
      filtered.map((ev) => ({
        apartmentCode: ev.apartmentCode,
        residentName: ev.residentName,
        type: ev.type,
        fromDate: ev.fromDate,
        toDate: ev.toDate || '',
        reason: ev.reason,
        recordedBy: ev.recordedBy,
      }))
    );
    toast.success('Đã xuất file Excel', `Đã trích xuất ${filtered.length} bản ghi biến động cư trú.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Biến động Cư trú (Tạm trú / Tạm vắng)</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            US-07 • Ghi nhận, tra cứu lịch sử biến động cư trú và xuất danh sách theo phân quyền.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {canExport && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất Excel
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => {
                setFormError(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Ghi nhận biến động
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Đăng ký Tạm trú</p>
            <p className="text-2xl font-extrabold text-[#0284C7] tabular-nums mt-1">{counts.tamTru}</p>
          </div>
          <Badge variant="info">Tạm trú</Badge>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Khai báo Tạm vắng</p>
            <p className="text-2xl font-extrabold text-[#D97706] tabular-nums mt-1">{counts.tamVang}</p>
          </div>
          <Badge variant="warning">Tạm vắng</Badge>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Thay đổi nơi cư trú</p>
            <p className="text-2xl font-extrabold text-[#1E3A8A] tabular-nums mt-1">{counts.chuyenDi}</p>
          </div>
          <Badge variant="navy">Chuyển cư trú</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên cư dân, mã căn, lý do..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
        >
          <option value="ALL">Tất cả loại biến động</option>
          <option value="Tạm trú">Tạm trú</option>
          <option value="Tạm vắng">Tạm vắng</option>
          <option value="Thay đổi nơi cư trú">Thay đổi nơi cư trú</option>
        </select>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={fromFilter}
            onChange={(e) => setFromFilter(e.target.value)}
            className="px-2.5 py-2 border border-slate-300 rounded-xl text-xs"
            title="Từ ngày"
          />
          <span>→</span>
          <input
            type="date"
            value={toFilter}
            onChange={(e) => setToFilter(e.target.value)}
            className="px-2.5 py-2 border border-slate-300 rounded-xl text-xs"
            title="Đến ngày"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu biến động cư trú phù hợp" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="px-4 py-3.5 text-left">Cư dân</th>
                  <th className="px-4 py-3.5 text-left">Căn hộ</th>
                  <th className="px-4 py-3.5 text-left">Loại biến động</th>
                  <th className="px-4 py-3.5 text-left">Thời gian hiệu lực</th>
                  <th className="px-4 py-3.5 text-left">Lý do</th>
                  <th className="px-4 py-3.5 text-left">Người ghi nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{ev.residentName}</td>
                    <td className="px-4 py-3.5 font-bold text-[#1E3A8A]">{ev.apartmentCode}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          ev.type === 'Tạm trú'
                            ? 'info'
                            : ev.type === 'Tạm vắng'
                              ? 'warning'
                              : 'navy'
                        }
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        {ev.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700 tabular-nums">
                      {formatDateVN(ev.fromDate)} →{' '}
                      {ev.toDate ? formatDateVN(ev.toDate) : 'Không xác định'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs">{ev.reason}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{ev.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Event Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ghi nhận Biến động Cư trú"
        subtitle="Tự động cập nhật trạng thái cư dân và lưu vết lịch sử tra cứu."
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
              form="residency-event-form"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg"
            >
              Lưu biến động
            </button>
          </>
        }
      >
        <form id="residency-event-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn nhân khẩu <span className="text-red-600">*</span>
            </label>
            <select
              value={residentId}
              onChange={(e) => setResidentId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {state.residents.map((r) => {
                const apt = state.apartments.find((a) => a.id === r.apartmentId);
                return (
                  <option key={r.id} value={r.id}>
                    {r.fullName} — {apt?.code} (CCCD: {r.cccd})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Loại biến động <span className="text-red-600">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ResidencyEventType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="Tạm trú">Tạm trú</option>
              <option value="Tạm vắng">Tạm vắng</option>
              <option value="Thay đổi nơi cư trú">Thay đổi nơi cư trú</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Từ ngày <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đến ngày (Tùy chọn)
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lý do biến động <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết (công tác, học tập, chuyển khẩu...)"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
