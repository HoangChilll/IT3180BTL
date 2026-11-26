import React, { useState } from 'react';
import {
  SlidersHorizontal,
  HeartHandshake,
  Plus,
  History,
  Save,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { formatDateVN, formatVND } from '../utils/format';
import { validateManagementFee, validateServiceFee } from '../utils/validators';
import { Badge } from '../components/ui/Common';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';

export const FeeConfigPage: React.FC = () => {
  const {
    state,
    updateFeeRates,
    createDonationCampaign,
    toggleDonationCampaignStatus,
  } = useBlueMoonStore();
  const toast = useToast();

  // US-08 Fee Rate form
  const [serviceFee, setServiceFee] = useState(state.feeRate.serviceFeePerM2);
  const [managementFee, setManagementFee] = useState(state.feeRate.managementFeePerM2);
  const [motorbikeFee, setMotorbikeFee] = useState(state.feeRate.motorbikeFee);
  const [carFee, setCarFee] = useState(state.feeRate.carFee);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [decisionNo, setDecisionNo] = useState('QĐ-05/2026/BQT-BM');
  const [rateNote, setRateNote] = useState('');
  const [confirmSaveRates, setConfirmSaveRates] = useState(false);

  // US-09 Campaign Modal
  const [campModalOpen, setCampModalOpen] = useState(false);
  const [campName, setCampName] = useState('');
  const [campPurpose, setCampPurpose] = useState('');
  const [campOrganizer, setCampOrganizer] = useState('BQT Chung cư BlueMoon');
  const [campStart, setCampStart] = useState(new Date().toISOString().slice(0, 10));
  const [campEnd, setCampEnd] = useState('2026-12-31');
  const [campError, setCampError] = useState<string | null>(null);

  const svcErr = validateServiceFee(serviceFee);
  const mgtErr = validateManagementFee(managementFee);
  const parkingErr =
    motorbikeFee < 0 || carFee < 0 ? 'Đơn giá gửi xe không được là số âm.' : null;
  const hasRateErr = Boolean(svcErr || mgtErr || parkingErr || !effectiveDate);

  const handleConfirmSaveRates = () => {
    const res = updateFeeRates({
      serviceFeePerM2: serviceFee,
      managementFeePerM2: managementFee,
      motorbikeFee,
      carFee,
      effectiveDate,
      decisionNo,
      note: rateNote,
    });
    if (!res.ok) {
      toast.error('Không thể cập nhật đơn giá', res.message);
      return;
    }
    toast.success('Đã cập nhật biểu phí', res.message);
    setRateNote('');
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setCampError(null);
    const res = createDonationCampaign({
      name: campName,
      purpose: campPurpose,
      organizer: campOrganizer,
      startDate: campStart,
      endDate: campEnd,
    });
    if (!res.ok) {
      setCampError(res.message);
      return;
    }
    toast.success('Đã tạo đợt đóng góp', res.message);
    setCampModalOpen(false);
    setCampName('');
    setCampPurpose('');
  };

  // Calculate real-time totals for each campaign from receipts
  const getCampaignStats = (campaignId: string) => {
    let total = 0;
    const aptSet = new Set<string>();
    state.receipts.forEach((r) => {
      r.items.forEach((it) => {
        if (it.category === 'VOLUNTARY_DONATION' && it.refId === campaignId) {
          total += it.amount;
          aptSet.add(r.apartmentId);
        }
      });
    });
    return { total, count: aptSet.size };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Cấu hình Đơn giá Phí & Quỹ Đóng góp Tự nguyện
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          US-08 & US-09 • Thiết lập đơn giá phí bắt buộc theo quyết định BQT và quản lý các đợt quyên
          góp từ thiện.
        </p>
      </div>

      {/* US-08: Mandatory Fee Rate Configuration */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Biểu giá phí bắt buộc & gửi xe (US-08)
                </h2>
                <p className="text-xs text-slate-500">
                  Hiệu lực hiện tại từ {formatDateVN(state.feeRate.effectiveDate)} • Cập nhật bởi{' '}
                  {state.feeRate.updatedBy}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              Mọi thay đổi đơn giá chỉ áp dụng cho các kỳ phí lập mới kể từ <strong>Ngày áp dụng</strong>.
              Các kỳ phí đã phát hành giữ nguyên đơn giá tại thời điểm chốt bảng kê.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phí dịch vụ chung cư (đ/m²/tháng) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step={500}
                value={serviceFee}
                onChange={(e) => setServiceFee(Number(e.target.value))}
                className={`w-full px-3 py-2 text-sm font-semibold tabular-nums border rounded-xl ${
                  svcErr ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {svcErr ? (
                <p className="text-[11px] text-red-600 mt-1">{svcErr}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Khoảng quy định: 2.500 – 16.500 đ/m²/tháng
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phí quản lý chung cư (đ/m²/tháng) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step={500}
                value={managementFee}
                onChange={(e) => setManagementFee(Number(e.target.value))}
                className={`w-full px-3 py-2 text-sm font-semibold tabular-nums border rounded-xl ${
                  mgtErr ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {mgtErr ? (
                <p className="text-[11px] text-red-600 mt-1">{mgtErr}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Quy định tối thiểu: &ge; 7.000 đ/m²/tháng
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phí gửi xe máy v2.0 (đ/xe/tháng)
              </label>
              <input
                type="number"
                step={10000}
                value={motorbikeFee}
                onChange={(e) => setMotorbikeFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-semibold tabular-nums border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phí gửi ô tô v2.0 (đ/xe/tháng)
              </label>
              <input
                type="number"
                step={50000}
                value={carFee}
                onChange={(e) => setCarFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-semibold tabular-nums border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {parkingErr && <p className="text-xs text-red-600 font-medium">{parkingErr}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày áp dụng <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số quyết định BQT
              </label>
              <input
                type="text"
                value={decisionNo}
                onChange={(e) => setDecisionNo(e.target.value)}
                placeholder="VD: QĐ-05/2026/BQT-BM"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú điều chỉnh (Tùy chọn)
            </label>
            <input
              type="text"
              value={rateNote}
              onChange={(e) => setRateNote(e.target.value)}
              placeholder="Lý do điều chỉnh theo Nghị quyết Hội nghị nhà chung cư..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end">
            <button
              disabled={hasRateErr}
              onClick={() => setConfirmSaveRates(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Save className="w-4 h-4" />
              Lưu cấu hình đơn giá
            </button>
          </div>
        </div>

        {/* Fee Rate History Table */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
            <History className="w-4 h-4 text-[#1E3A8A]" />
            <h3 className="text-sm font-bold text-slate-900">Lịch sử thay đổi đơn giá</h3>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[460px]">
            {state.feeRateHistories.map((h) => (
              <div key={h.id} className="p-4 text-xs hover:bg-slate-50/70">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{h.category}</span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {h.decisionNo}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 tabular-nums">
                  <span className="line-through text-slate-400">{formatVND(h.oldPrice)}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-[#16A34A] text-sm">{formatVND(h.newPrice)}</span>
                </div>
                <p className="text-slate-500 mt-1">
                  Hiệu lực: <strong>{formatDateVN(h.effectiveDate)}</strong> • Bởi: {h.updatedBy}
                </p>
                {h.note && <p className="text-slate-400 italic mt-0.5">{h.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* US-09: Voluntary Donation Campaigns */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Đợt vận động Đóng góp Tự nguyện (US-09)
              </h2>
              <p className="text-xs text-slate-500">
                Không gắn định mức bắt buộc, không ghi thành công nợ — cư dân ủng hộ số tiền linh hoạt khi nộp phí.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCampError(null);
              setCampModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tạo đợt đóng góp mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.donationCampaigns.map((camp) => {
            const stats = getCampaignStats(camp.id);
            return (
              <div
                key={camp.id}
                className="rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:border-sky-300 transition bg-slate-50/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{camp.name}</h3>
                    <Badge variant={camp.status === 'ACTIVE' ? 'info' : 'neutral'}>
                      {camp.status === 'ACTIVE' ? 'Đang vận động' : 'Đã kết thúc'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{camp.purpose}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Đơn vị phát động: <strong className="text-slate-700">{camp.organizer}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                    Thời hạn: {formatDateVN(camp.startDate)} – {formatDateVN(camp.endDate)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500">Đã quyên góp ({stats.count} hộ)</p>
                    <p className="text-base font-extrabold text-[#1E3A8A] tabular-nums">
                      {formatVND(stats.total)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      toggleDonationCampaignStatus(camp.id);
                      toast.info('Đã đổi trạng thái', `Cập nhật trạng thái quỹ "${camp.name}".`);
                    }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                  >
                    {camp.status === 'ACTIVE' ? 'Đóng đợt' : 'Mở lại'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Campaign Modal */}
      <Modal
        open={campModalOpen}
        onClose={() => setCampModalOpen(false)}
        title="Tạo Đợt đóng góp Tự nguyện mới"
        subtitle="Khoản thu tự nguyện không tạo công nợ bắt buộc đối với căn hộ."
        footer={
          <>
            <button
              type="button"
              onClick={() => setCampModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="camp-form"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0284C7] hover:bg-sky-700 rounded-lg"
            >
              Khởi tạo quỹ
            </button>
          </>
        }
      >
        <form id="camp-form" onSubmit={handleCreateCampaign} className="space-y-4">
          {campError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {campError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên đợt vận động / Quỹ <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={campName}
              onChange={(e) => setCampName(e.target.value)}
              placeholder="VD: Quỹ Ủng hộ Đồng bào Bão lũ"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cơ quan / Đơn vị phát động <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={campOrganizer}
              onChange={(e) => setCampOrganizer(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mục đích vận động <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={campPurpose}
              onChange={(e) => setCampPurpose(e.target.value)}
              placeholder="Mô tả mục đích sử dụng nguồn quỹ..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày bắt đầu <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={campStart}
                onChange={(e) => setCampStart(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày kết thúc <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={campEnd}
                onChange={(e) => setCampEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Đợt quyên góp sẽ xuất hiện tức thì tại màn hình Thu phí để ghi nhận số tiền linh hoạt.
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmSaveRates}
        onClose={() => setConfirmSaveRates(false)}
        onConfirm={handleConfirmSaveRates}
        title="Xác nhận thay đổi đơn giá phí?"
        description="Hệ thống sẽ lưu đơn giá mới vào lịch sử thay đổi và áp dụng cho các kỳ lập bảng kê mới. Các kỳ phí đã chốt trước đó giữ nguyên đơn giá cũ."
        confirmLabel="Xác nhận lưu đơn giá"
      />
    </div>
  );
};
