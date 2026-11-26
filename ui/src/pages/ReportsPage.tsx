import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, Printer, Building2 } from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { formatDateVN, formatPeriodLabel, formatVND } from '../utils/format';
import { exportFinancialReportExcel, FinancialReportRow } from '../utils/excelExport';
import { Badge } from '../components/ui/Common';
import { useToast } from '../components/ui/Toast';

export const ReportsPage: React.FC = () => {
  const { state, getCurrentRepresentative } = useBlueMoonStore();
  const toast = useToast();

  const [period, setPeriod] = useState(state.selectedPeriod);
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const periods = useMemo(() => {
    const s = new Set<string>(['2026-09', '2026-10', '2026-11', '2026-12']);
    state.invoices.forEach((i) => s.add(i.period));
    return Array.from(s).sort().reverse();
  }, [state.invoices]);

  const floors = useMemo(
    () => Array.from(new Set(state.apartments.map((a) => a.floor))).sort((a, b) => a - b),
    [state.apartments]
  );

  const reportRows: FinancialReportRow[] = useMemo(() => {
    return state.apartments
      .filter((a) => floorFilter === 'ALL' || a.floor === Number(floorFilter))
      .map((apt) => {
        const invs = state.invoices.filter(
          (i) => i.apartmentId === apt.id && i.period === period
        );
        const serviceFee = invs
          .filter((i) => i.feeType === 'SERVICE')
          .reduce((s, i) => s + i.amount, 0);
        const managementFee = invs
          .filter((i) => i.feeType === 'MANAGEMENT')
          .reduce((s, i) => s + i.amount, 0);
        const parkingFee = invs
          .filter((i) => i.feeType === 'PARKING')
          .reduce((s, i) => s + i.amount, 0);
        const totalDue = serviceFee + managementFee + parkingFee;
        const totalPaid = invs.reduce((s, i) => s + i.paidAmount, 0);
        const remaining = totalDue - totalPaid;

        const statusLabel =
          totalDue === 0
            ? 'Chưa lập kỳ'
            : remaining === 0
              ? 'Đã thanh toán'
              : totalPaid > 0
                ? 'Nộp một phần'
                : 'Chưa nộp';

        return {
          apartmentCode: apt.code,
          floor: apt.floor,
          area: apt.area,
          type: apt.type,
          ownerName: getCurrentRepresentative(apt.id)?.residentName || 'Chưa gán',
          serviceFee,
          managementFee,
          parkingFee,
          totalDue,
          totalPaid,
          remaining,
          statusLabel,
        };
      })
      .filter((r) => {
        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'PAID') return r.statusLabel === 'Đã thanh toán';
        if (statusFilter === 'PARTIAL') return r.statusLabel === 'Nộp một phần';
        if (statusFilter === 'UNPAID') return r.statusLabel === 'Chưa nộp';
        return true;
      });
  }, [floorFilter, getCurrentRepresentative, period, state.apartments, state.invoices, statusFilter]);

  const totals = useMemo(() => {
    return reportRows.reduce(
      (acc, r) => ({
        serviceFee: acc.serviceFee + r.serviceFee,
        managementFee: acc.managementFee + r.managementFee,
        parkingFee: acc.parkingFee + r.parkingFee,
        totalDue: acc.totalDue + r.totalDue,
        totalPaid: acc.totalPaid + r.totalPaid,
        remaining: acc.remaining + r.remaining,
      }),
      { serviceFee: 0, managementFee: 0, parkingFee: 0, totalDue: 0, totalPaid: 0, remaining: 0 }
    );
  }, [reportRows]);

  const filterSummary = `Tầng: ${floorFilter === 'ALL' ? 'Tất cả' : `Tầng ${floorFilter}`} | Trạng thái: ${
    statusFilter === 'ALL' ? 'Tất cả' : statusFilter
  }`;

  const handleExportExcel = () => {
    exportFinancialReportExcel(reportRows, period, filterSummary);
    toast.success(
      'Xuất file Excel thành công',
      `Đã tải xuống BlueMoon_BaoCaoTaiChinh_${period}.xlsx (giữ nguyên công thức SUM & chuẩn Unicode).`
    );
  };

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo Tài chính & Xuất Hồ sơ Kế toán</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            US-16 • Xuất Excel (.xlsx) giữ nguyên công thức SUM chuẩn Unicode hoặc in báo cáo PDF khổ A4.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xuất Excel (.xlsx)
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            In / Lưu PDF (A4)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 text-sm font-bold text-[#1E3A8A] border border-blue-200 bg-blue-50/40 rounded-xl"
        >
          {periods.map((p) => (
            <option key={p} value={p}>
              Kỳ {formatPeriodLabel(p)}
            </option>
          ))}
        </select>
        <select
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="PARTIAL">Nộp một phần</option>
          <option value="UNPAID">Chưa nộp</option>
        </select>
        <span className="text-xs text-slate-500 ml-auto">
          Khớp 100% dữ liệu sau bộ lọc ({reportRows.length} căn hộ)
        </span>
      </div>

      {/* Printable Financial Report Sheet */}
      <div className="print-container print-a4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Print Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase text-[#1E3A8A]">
                Ban Quản trị Chung cư BlueMoon
              </p>
              <h2 className="text-lg font-extrabold text-slate-900 uppercase">
                Báo cáo Tổng hợp Thu phí Định kỳ — {formatPeriodLabel(period)}
              </h2>
              <p className="text-xs text-slate-500">
                {filterSummary} • Ngày lập biểu: {formatDateVN(new Date().toISOString())}
              </p>
            </div>
          </div>
          <div className="text-right text-xs tabular-nums">
            <p className="text-slate-500">Tỷ lệ hoàn thành</p>
            <p className="text-lg font-extrabold text-[#16A34A]">
              {totals.totalDue > 0
                ? `${Math.round((totals.totalPaid / totals.totalDue) * 1000) / 10}%`
                : '0%'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="px-3 py-3 text-left">Mã căn</th>
                <th className="px-3 py-3 text-left">Chủ hộ</th>
                <th className="px-3 py-3 text-right">DT</th>
                <th className="px-3 py-3 text-right">Phí DV</th>
                <th className="px-3 py-3 text-right">Phí QL</th>
                <th className="px-3 py-3 text-right">Gửi xe</th>
                <th className="px-3 py-3 text-right">Tổng phải thu</th>
                <th className="px-3 py-3 text-right">Đã thu</th>
                <th className="px-3 py-3 text-right">Còn nợ</th>
                <th className="px-3 py-3 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportRows.map((r) => (
                <tr key={r.apartmentCode} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2.5 font-bold text-[#1E3A8A]">{r.apartmentCode}</td>
                  <td className="px-3 py-2.5 text-slate-800">{r.ownerName}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{r.area}m²</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatVND(r.serviceFee)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatVND(r.managementFee)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatVND(r.parkingFee)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-slate-900">
                    {formatVND(r.totalDue)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-[#16A34A]">
                    {formatVND(r.totalPaid)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-[#DC2626]">
                    {formatVND(r.remaining)}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge
                      variant={
                        r.statusLabel === 'Đã thanh toán'
                          ? 'success'
                          : r.statusLabel === 'Nộp một phần'
                            ? 'warning'
                            : r.statusLabel === 'Chưa nộp'
                              ? 'danger'
                              : 'neutral'
                      }
                    >
                      {r.statusLabel}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-extrabold text-slate-900 tabular-nums">
                <td colSpan={3} className="px-3 py-3 text-left uppercase">
                  TỔNG CỘNG ({reportRows.length} căn)
                </td>
                <td className="px-3 py-3 text-right">{formatVND(totals.serviceFee)}</td>
                <td className="px-3 py-3 text-right">{formatVND(totals.managementFee)}</td>
                <td className="px-3 py-3 text-right">{formatVND(totals.parkingFee)}</td>
                <td className="px-3 py-3 text-right text-[#1E3A8A]">
                  {formatVND(totals.totalDue)}
                </td>
                <td className="px-3 py-3 text-right text-[#16A34A]">
                  {formatVND(totals.totalPaid)}
                </td>
                <td className="px-3 py-3 text-right text-[#DC2626]">
                  {formatVND(totals.remaining)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Accounting Signatures (visible nicely in PDF print) */}
        <div className="p-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <p className="font-bold text-slate-800">Người lập biểu</p>
            <p className="text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
            <div className="h-14" />
            <p className="font-semibold text-slate-700">Trần Thị Thu Hương</p>
          </div>
          <div>
            <p className="font-bold text-slate-800">Thủ quỹ đối chiếu</p>
            <p className="text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
            <div className="h-14" />
            <p className="font-semibold text-slate-700">Lê Hoàng Nam</p>
          </div>
          <div>
            <p className="font-bold text-slate-800">Trưởng Ban Quản trị</p>
            <p className="text-slate-500 italic">(Ký, đóng dấu xác nhận)</p>
            <div className="h-14" />
            <p className="font-semibold text-slate-700">Nguyễn Minh Quân</p>
          </div>
        </div>
      </div>
    </div>
  );
};
