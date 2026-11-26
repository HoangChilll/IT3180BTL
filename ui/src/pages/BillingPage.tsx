import React, { useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { formatPeriodLabel, formatVND } from '../utils/format';
import { Badge, EmptyState, Pagination } from '../components/ui/Common';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';

export const BillingPage: React.FC = () => {
  const { state, generateMonthlyBilling, setSelectedPeriod } = useBlueMoonStore();
  const toast = useToast();

  const [targetPeriod, setTargetPeriod] = useState('2026-12');
  const [viewPeriod, setViewPeriod] = useState(state.selectedPeriod);
  const [search, setSearch] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastBatchReport, setLastBatchReport] = useState<{
    period: string;
    ok: boolean;
    message: string;
    createdCount: number;
    skippedCount: number;
    totalAmount: number;
    elapsedMs: number;
  } | null>(null);

  const availablePeriods = useMemo(() => {
    const s = new Set<string>(['2026-09', '2026-10', '2026-11', '2026-12', '2027-01']);
    state.invoices.forEach((i) => s.add(i.period));
    return Array.from(s).sort().reverse();
  }, [state.invoices]);

  const existingForTarget = useMemo(
    () => state.invoices.filter((i) => i.period === targetPeriod).length,
    [state.invoices, targetPeriod]
  );

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.invoices.filter((inv) => {
      if (inv.period !== viewPeriod) return false;
      const matchQ =
        !q ||
        inv.apartmentCode.toLowerCase().includes(q) ||
        inv.title.toLowerCase().includes(q);
      const matchType = feeTypeFilter === 'ALL' || inv.feeType === feeTypeFilter;
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchQ && matchType && matchStatus;
    });
  }, [feeTypeFilter, search, state.invoices, statusFilter, viewPeriod]);

  const summary = useMemo(() => {
    const totalDue = filteredInvoices.reduce((s, i) => s + i.amount, 0);
    const totalPaid = filteredInvoices.reduce((s, i) => s + i.paidAmount, 0);
    return { totalDue, totalPaid, remaining: totalDue - totalPaid };
  }, [filteredInvoices]);

  const paginated = filteredInvoices.slice((page - 1) * pageSize, page * pageSize);

  const handleRunBatch = () => {
    const res = generateMonthlyBilling(targetPeriod);
    if (res.data) {
      setLastBatchReport({
        period: targetPeriod,
        ok: res.ok,
        message: res.message,
        ...res.data,
      });
    }
    if (res.ok) {
      setViewPeriod(targetPeriod);
      setSelectedPeriod(targetPeriod);
      toast.success('Lập bảng kê thành công', res.message);
    } else {
      toast.warning('Phát hiện trùng kỳ thu', res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tự động Lập Bảng kê Phí Tháng</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          US-10 • Tính tự động Phí dịch vụ + Phí quản lý (Diện tích × Đơn giá hiệu lực) và gộp Phí
          gửi xe v2.0, chống sinh trùng tuyệt đối.
        </p>
      </div>

      {/* Batch Generator Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Chạy tiến trình sinh công nợ định kỳ (Batch Process)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Đơn giá đang hiệu lực: Phí dịch vụ{' '}
                <strong className="text-slate-800 whitespace-nowrap">
                  {formatVND(state.feeRate.serviceFeePerM2)}/m²
                </strong>{' '}
                • Phí quản lý{' '}
                <strong className="text-slate-800 whitespace-nowrap">
                  {formatVND(state.feeRate.managementFeePerM2)}/m²
                </strong>{' '}
                • Xe máy{' '}
                <strong className="text-slate-800 whitespace-nowrap">
                  {formatVND(state.feeRate.motorbikeFee)}
                </strong>{' '}
                • Ô tô{' '}
                <strong className="text-slate-800 whitespace-nowrap">
                  {formatVND(state.feeRate.carFee)}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Chọn kỳ cần lập bảng kê
              </label>
              <input
                aria-label="Chọn kỳ lập bảng kê"
                type="month"
                value={targetPeriod}
                onChange={(e) => setTargetPeriod(e.target.value)}
                className="px-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl bg-white"
              />
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm transition"
            >
              <PlayCircle className="w-4 h-4" />
              Lập bảng kê kỳ {targetPeriod}
            </button>
          </div>
        </div>

        {existingForTarget > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Kỳ <strong>{formatPeriodLabel(targetPeriod)}</strong> hiện đã có{' '}
              <strong>{existingForTarget}</strong> bản ghi công nợ. Nếu chạy lại, cơ chế chống sinh
              trùng sẽ tự động bỏ qua các khoản đã tồn tại và chỉ bổ sung cho căn hộ mới (nếu có).
            </span>
          </div>
        )}

        {lastBatchReport && (
          <div
            className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
              lastBatchReport.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {lastBatchReport.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">{lastBatchReport.message}</p>
                <p className="mt-0.5 tabular-nums">
                  Mới tạo: <strong>{lastBatchReport.createdCount}</strong> khoản • Bỏ qua trùng:{' '}
                  <strong>{lastBatchReport.skippedCount}</strong> khoản • Tổng giá trị sinh mới:{' '}
                  <strong>{formatVND(lastBatchReport.totalAmount)}</strong>
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
              Thời gian xử lý: {lastBatchReport.elapsedMs} ms (&lt; 5s)
            </div>
          </div>
        )}
      </div>

      {/* Ledger Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Xem bảng kê theo kỳ"
              value={viewPeriod}
              onChange={(e) => {
                setViewPeriod(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm font-bold text-[#1E3A8A] border border-blue-200 bg-blue-50/50 rounded-xl"
            >
              {availablePeriods.map((p) => (
                <option key={p} value={p}>
                  Bảng kê {formatPeriodLabel(p)}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Lọc mã căn hộ..."
                className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl w-44"
              />
            </div>

            <select
              value={feeTypeFilter}
              onChange={(e) => {
                setFeeTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
            >
              <option value="ALL">Tất cả loại phí</option>
              <option value="SERVICE">Phí dịch vụ</option>
              <option value="MANAGEMENT">Phí quản lý</option>
              <option value="PARKING">Phí gửi xe (v2.0)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PARTIAL">Nộp một phần</option>
              <option value="UNPAID">Chưa nộp</option>
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs tabular-nums">
            <span>
              Phải thu: <strong className="text-slate-900">{formatVND(summary.totalDue)}</strong>
            </span>
            <span>
              Đã thu: <strong className="text-[#16A34A]">{formatVND(summary.totalPaid)}</strong>
            </span>
            <span>
              Còn nợ: <strong className="text-[#DC2626]">{formatVND(summary.remaining)}</strong>
            </span>
          </div>
        </div>

        {paginated.length === 0 ? (
          <EmptyState
            title={`Chưa có bảng kê cho ${formatPeriodLabel(viewPeriod)}`}
            description="Chọn kỳ thu ở khung trên và nhấn nút Lập bảng kê để hệ thống tính toán tự động."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="px-4 py-3 text-left">Mã căn</th>
                    <th className="px-4 py-3 text-left">Khoản thu</th>
                    <th className="px-4 py-3 text-right">Định mức / Công thức</th>
                    <th className="px-4 py-3 text-right">Thành tiền</th>
                    <th className="px-4 py-3 text-right">Đã nộp</th>
                    <th className="px-4 py-3 text-right">Còn nợ</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((inv) => {
                    const rem = inv.amount - inv.paidAmount;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-bold text-[#1E3A8A]">{inv.apartmentCode}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{inv.title}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500 tabular-nums">
                          {inv.feeType === 'PARKING'
                            ? `${inv.quantity} xe đang gửi`
                            : `${inv.quantity} m² × ${formatVND(inv.unitPrice)}`}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                          {formatVND(inv.amount)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#16A34A]">
                          {formatVND(inv.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums text-[#DC2626]">
                          {formatVND(rem)}
                        </td>
                        <td className="px-4 py-3">
                          {inv.status === 'PAID' ? (
                            <Badge variant="success">Đã thanh toán</Badge>
                          ) : inv.status === 'PARTIAL' ? (
                            <Badge variant="warning">Nộp một phần</Badge>
                          ) : (
                            <Badge variant="danger">Chưa nộp</Badge>
                          )}
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
              total={filteredInvoices.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRunBatch}
        title={`Chốt & Lập bảng kê phí ${formatPeriodLabel(targetPeriod)}?`}
        description={`Hệ thống sẽ tự động tính phí dịch vụ, phí quản lý cho toàn bộ ${state.apartments.length} căn hộ và cộng dồn phí gửi xe đang hoạt động. Các khoản thu đã tồn tại trong kỳ sẽ được tự động bỏ qua để chống sinh trùng.`}
        confirmLabel="Thực hiện lập bảng kê"
      />
    </div>
  );
};
