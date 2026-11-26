import React, { useMemo, useState } from 'react';
import { Car, Bike, Plus, Search, Trash2, Power } from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { VehicleType } from '../types';
import { formatDateVN, formatVND } from '../utils/format';
import { Badge, EmptyState } from '../components/ui/Common';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

export const VehiclesPage: React.FC = () => {
  const { state, addVehicle, toggleVehicleStatus, deleteVehicle, getCurrentRepresentative } =
    useBlueMoonStore();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const [apartmentId, setApartmentId] = useState(state.apartments[0]?.id || '');
  const [type, setType] = useState<VehicleType>('MOTORBIKE');
  const [licensePlate, setLicensePlate] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [registeredDate, setRegisteredDate] = useState(new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.vehicles.filter((v) => {
      const matchQ =
        !q ||
        v.apartmentCode.toLowerCase().includes(q) ||
        v.licensePlate.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q);
      const matchType = typeFilter === 'ALL' || v.type === typeFilter;
      return matchQ && matchType;
    });
  }, [search, state.vehicles, typeFilter]);

  const stats = useMemo(() => {
    const active = state.vehicles.filter((v) => v.status === 'ACTIVE');
    const motoCount = active.filter((v) => v.type === 'MOTORBIKE').length;
    const carCount = active.filter((v) => v.type === 'CAR').length;
    const monthlyRevenue =
      motoCount * state.feeRate.motorbikeFee + carCount * state.feeRate.carFee;
    return { motoCount, carCount, monthlyRevenue };
  }, [state.feeRate.carFee, state.feeRate.motorbikeFee, state.vehicles]);

  const handleOpenAdd = () => {
    const firstApt = state.apartments[0];
    setApartmentId(firstApt?.id || '');
    setOwnerName(firstApt ? getCurrentRepresentative(firstApt.id)?.residentName || '' : '');
    setType('MOTORBIKE');
    setLicensePlate('');
    setBrandModel('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const res = addVehicle({
      apartmentId,
      type,
      licensePlate,
      brandModel,
      ownerName: ownerName.trim() || 'Chủ hộ',
      registeredDate,
      status: 'ACTIVE',
    });
    if (!res.ok) {
      setFormError(res.message);
      return;
    }
    toast.success('Đã đăng ký phương tiện', res.message);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý Phương tiện & Phí Gửi xe
            </h1>
            <Badge variant="info">v2.0</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            US-17 • Một hộ có thể đăng ký nhiều xe; tự động tính phí xe máy (
            {formatVND(state.feeRate.motorbikeFee)}/tháng) & ô tô (
            {formatVND(state.feeRate.carFee)}/tháng) và gộp vào bảng kê định kỳ.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Đăng ký xe mới
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Xe máy đang gửi ({formatVND(state.feeRate.motorbikeFee)}/tháng)</p>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
              {stats.motoCount} xe
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50 text-[#0284C7]">
            <Bike className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Ô tô đang gửi ({formatVND(state.feeRate.carFee)}/tháng)</p>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
              {stats.carCount} xe
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E3A8A]">
            <Car className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Dự kiến doanh thu gửi xe / tháng</p>
            <p className="text-2xl font-extrabold text-[#16A34A] tabular-nums mt-1">
              {formatVND(stats.monthlyRevenue)}
            </p>
          </div>
          <Badge variant="success">Tự động gộp bảng kê</Badge>
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
            placeholder="Tìm theo mã căn, biển số xe, chủ phương tiện..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
        >
          <option value="ALL">Tất cả loại xe</option>
          <option value="CAR">Ô tô</option>
          <option value="MOTORBIKE">Xe máy</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState title="Không có phương tiện phù hợp" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="px-4 py-3.5 text-left">Căn hộ</th>
                  <th className="px-4 py-3.5 text-left">Loại xe</th>
                  <th className="px-4 py-3.5 text-left">Biển số & Dòng xe</th>
                  <th className="px-4 py-3.5 text-left">Chủ xe</th>
                  <th className="px-4 py-3.5 text-left">Ngày ĐK</th>
                  <th className="px-4 py-3.5 text-right">Phí tháng</th>
                  <th className="px-4 py-3.5 text-left">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => {
                  const fee =
                    v.type === 'CAR' ? state.feeRate.carFee : state.feeRate.motorbikeFee;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 font-bold text-[#1E3A8A]">{v.apartmentCode}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={v.type === 'CAR' ? 'navy' : 'info'}>
                          {v.type === 'CAR' ? 'Ô tô' : 'Xe máy'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-mono font-bold text-slate-900">{v.licensePlate}</p>
                        <p className="text-xs text-slate-500">{v.brandModel || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{v.ownerName}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 tabular-nums">
                        {formatDateVN(v.registeredDate)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold tabular-nums text-slate-900">
                        {v.status === 'ACTIVE' ? formatVND(fee) : '0 đ'}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={v.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {v.status === 'ACTIVE' ? 'Đang gửi' : 'Ngừng gửi'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              toggleVehicleStatus(v.id);
                              toast.info('Đã đổi trạng thái gửi xe');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2563EB] hover:bg-blue-50"
                            title="Bật/tắt gửi xe"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              deleteVehicle(v.id);
                              toast.success('Đã xóa phương tiện');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Đăng ký Phương tiện gửi xe mới"
        subtitle="Phương tiện đang hoạt động sẽ tự động cộng dồn vào bảng kê phí hàng tháng."
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
              form="veh-form"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg"
            >
              Đăng ký xe
            </button>
          </>
        }
      >
        <form id="veh-form" onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thuộc căn hộ <span className="text-red-600">*</span>
              </label>
              <select
                value={apartmentId}
                onChange={(e) => {
                  setApartmentId(e.target.value);
                  const rep = getCurrentRepresentative(e.target.value);
                  if (rep) setOwnerName(rep.residentName);
                }}
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
                Loại phương tiện <span className="text-red-600">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VehicleType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="MOTORBIKE">
                  Xe máy ({formatVND(state.feeRate.motorbikeFee)}/tháng)
                </option>
                <option value="CAR">Ô tô ({formatVND(state.feeRate.carFee)}/tháng)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Biển kiểm soát <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="VD: 30K-123.45"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hãng / Dòng xe (Tùy chọn)
              </label>
              <input
                type="text"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="VD: Honda SH, VinFast VF8..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chủ phương tiện <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày đăng ký</label>
              <input
                type="date"
                value={registeredDate}
                onChange={(e) => setRegisteredDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
