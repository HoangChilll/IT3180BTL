import React, { useMemo, useState } from 'react';
import { Zap, Droplets, Wifi, Plus, Search, ArrowRight, Trash2 } from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { PageKey, UtilityType } from '../types';
import { formatPeriodLabel, formatVND } from '../utils/format';
import { Badge, EmptyState } from '../components/ui/Common';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

export const UtilitiesPage: React.FC<{
  onNavigate: (page: PageKey, extra?: { apartmentCode?: string }) => void;
}> = ({ onNavigate }) => {
  const { state, addUtilityBill, deleteUtilityBill } = useBlueMoonStore();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const [apartmentId, setApartmentId] = useState(state.apartments[0]?.id || '');
  const [period, setPeriod] = useState(state.selectedPeriod);
  const [utilityType, setUtilityType] = useState<UtilityType>('ELECTRICITY');
  const [provider, setProvider] = useState('EVN Hà Nội');
  const [amount, setAmount] = useState(850000);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.utilityBills.filter((b) => {
      const matchQ =
        !q ||
        b.apartmentCode.toLowerCase().includes(q) ||
        b.provider.toLowerCase().includes(q);
      const matchType = typeFilter === 'ALL' || b.utilityType === typeFilter;
      return matchQ && matchType;
    });
  }, [search, state.utilityBills, typeFilter]);

  const totals = useMemo(() => {
    const due = filtered.reduce((s, b) => s + b.amount, 0);
    const paid = filtered.reduce((s, b) => s + b.paidAmount, 0);
    return { due, paid, rem: due - paid };
  }, [filtered]);

  const handleUtilityTypeChange = (next: UtilityType) => {
    setUtilityType(next);
    if (next === 'ELECTRICITY') setProvider('EVN Hà Nội');
    else if (next === 'WATER') setProvider('Viwaco');
    else setProvider('FPT Telecom');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const res = addUtilityBill({
      apartmentId,
      period,
      utilityType,
      provider,
      amount,
      note,
    });
    if (!res.ok) {
      setFormError(res.message);
      return;
    }
    toast.success('Đã nhập hóa đơn thu hộ', res.message);
    setModalOpen(false);
    setNote('');
  };

  const renderTypeBadge = (t: UtilityType) => {
    if (t === 'ELECTRICITY')
      return (
        <Badge variant="warning">
          <Zap className="w-3 h-3" /> Điện
        </Badge>
      );
    if (t === 'WATER')
      return (
        <Badge variant="info">
          <Droplets className="w-3 h-3" /> Nước
        </Badge>
      );
    return (
      <Badge variant="navy">
        <Wifi className="w-3 h-3" /> Internet
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý Thu hộ Điện • Nước • Internet
            </h1>
            <Badge variant="info">v2.0</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            US-18 • Nhập hóa đơn nhà cung cấp ngoài để thu hộ cùng lần giao dịch và tách dòng rõ
            ràng khỏi phí dịch vụ chung cư trên Phiếu thu.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nhập hóa đơn thu hộ
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Tổng giá trị hóa đơn thu hộ</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
            {formatVND(totals.due)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Đã thu hộ cư dân</p>
          <p className="text-2xl font-extrabold text-[#16A34A] tabular-nums mt-1">
            {formatVND(totals.paid)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Chưa thanh toán</p>
          <p className="text-2xl font-extrabold text-[#D97706] tabular-nums mt-1">
            {formatVND(totals.rem)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã căn hộ, nhà cung cấp (EVN, Viwaco, FPT)..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
        >
          <option value="ALL">Tất cả dịch vụ</option>
          <option value="ELECTRICITY">Tiền điện</option>
          <option value="WATER">Tiền nước</option>
          <option value="INTERNET">Internet</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState title="Chưa có hóa đơn thu hộ nào phù hợp" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="px-4 py-3.5 text-left">Căn hộ</th>
                  <th className="px-4 py-3.5 text-left">Kỳ thu</th>
                  <th className="px-4 py-3.5 text-left">Dịch vụ</th>
                  <th className="px-4 py-3.5 text-left">Đơn vị cung cấp</th>
                  <th className="px-4 py-3.5 text-right">Số tiền</th>
                  <th className="px-4 py-3.5 text-left">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 font-bold text-[#1E3A8A]">{b.apartmentCode}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {formatPeriodLabel(b.period)}
                    </td>
                    <td className="px-4 py-3.5">{renderTypeBadge(b.utilityType)}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-900">{b.provider}</p>
                      {b.note && <p className="text-xs text-slate-500">{b.note}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold tabular-nums text-slate-900">
                      {formatVND(b.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          b.status === 'PAID'
                            ? 'success'
                            : b.status === 'PARTIAL'
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {b.status === 'PAID'
                          ? 'Đã thu hộ'
                          : b.status === 'PARTIAL'
                            ? 'Nộp một phần'
                            : 'Chưa thu'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {b.status !== 'PAID' && (
                          <button
                            onClick={() =>
                              onNavigate('collection', { apartmentCode: b.apartmentCode })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8]"
                          >
                            Thu hộ
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {b.paidAmount === 0 && (
                          <button
                            onClick={() => {
                              const res = deleteUtilityBill(b.id);
                              if (res.ok) toast.success('Đã xóa hóa đơn thu hộ');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Utility Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nhập khoản Thu hộ Điện / Nước / Internet"
        subtitle="Hiển thị tách biệt khỏi phí quản lý & dịch vụ chung cư trên phiếu thu."
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
              form="utl-form"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg"
            >
              Lưu hóa đơn thu hộ
            </button>
          </>
        }
      >
        <form id="utl-form" onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Căn hộ <span className="text-red-600">*</span>
              </label>
              <select
                value={apartmentId}
                onChange={(e) => setApartmentId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {state.apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} (Tầng {a.floor})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kỳ phát sinh <span className="text-red-600">*</span>
              </label>
              <input
                type="month"
                required
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại dịch vụ <span className="text-red-600">*</span>
              </label>
              <select
                value={utilityType}
                onChange={(e) => handleUtilityTypeChange(e.target.value as UtilityType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="ELECTRICITY">Tiền điện</option>
                <option value="WATER">Tiền nước</option>
                <option value="INTERNET">Internet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn vị cung cấp <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="VD: EVN Hà Nội, Viwaco, FPT..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tiền thu hộ (VNĐ) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-bold tabular-nums border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chi tiết chỉ số / Gói cước (Tùy chọn)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: 340 kWh hoặc 18 m³ nước"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
