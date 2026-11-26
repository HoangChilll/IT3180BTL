import React, { useMemo, useState } from 'react';
import { HeartHandshake, FileSpreadsheet, Eye, EyeOff, Printer } from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { formatDateVN, formatVND, maskSensitiveName } from '../utils/format';
import { exportDonationsExcel } from '../utils/excelExport';
import { Badge, EmptyState } from '../components/ui/Common';
import { useToast } from '../components/ui/Toast';

export const DonationsReportPage: React.FC = () => {
  const { state } = useBlueMoonStore();
  const toast = useToast();

  const [campaignFilter, setCampaignFilter] = useState<string>('ALL');
  const [publicBoardMode, setPublicBoardMode] = useState(false);

  const campaignMap = useMemo(
    () => new Map(state.donationCampaigns.map((c) => [c.id, c])),
    [state.donationCampaigns]
  );

  const rows = useMemo(() => {
    const list: Array<{
      id: string;
      apartmentCode: string;
      donorName: string;
      allowPublic: boolean;
      campaignId: string;
      campaignName: string;
      amount: number;
      paymentDate: string;
      receiptNo: string;
      paymentMethod: string;
    }> = [];

    state.receipts.forEach((r) => {
      r.items.forEach((it) => {
        if (it.category !== 'VOLUNTARY_DONATION') return;
        const campId = it.refId || '';
        if (campaignFilter !== 'ALL' && campId !== campaignFilter) return;
        const camp = campaignMap.get(campId);
        list.push({
          id: it.id,
          apartmentCode: r.apartmentCode,
          donorName: r.payerName,
          allowPublic: r.allowPublicDisclosure !== false,
          campaignId: campId,
          campaignName: camp?.name || it.description,
          amount: it.amount,
          paymentDate: r.paymentDate,
          receiptNo: r.receiptNo,
          paymentMethod: r.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản',
        });
      });
    });

    return list.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [campaignFilter, campaignMap, state.receipts]);

  const totalAmount = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);
  const uniqueApartments = useMemo(
    () => new Set(rows.map((r) => r.apartmentCode)).size,
    [rows]
  );

  const activeCampaignTitle =
    campaignFilter === 'ALL'
      ? 'Tất cả các quỹ tự nguyện'
      : campaignMap.get(campaignFilter)?.name || 'Quỹ tự nguyện';

  const getDisplayName = (donorName: string, allowPublic: boolean) => {
    if (!publicBoardMode) return donorName;
    if (!allowPublic) return 'Cư dân ủng hộ ẩn danh';
    return maskSensitiveName(donorName);
  };

  const handleExport = () => {
    exportDonationsExcel(
      rows.map((r) => ({
        apartmentCode: r.apartmentCode,
        donorName: getDisplayName(r.donorName, r.allowPublic),
        campaignName: r.campaignName,
        amount: r.amount,
        paymentDate: r.paymentDate,
        receiptNo: r.receiptNo,
        paymentMethod: r.paymentMethod,
      })),
      activeCampaignTitle
    );
    toast.success('Đã xuất danh sách ủng hộ', 'Tệp Excel giữ nguyên công thức tổng lũy kế SUM.');
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Thống kê Danh sách Đóng góp Tự nguyện
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            US-15 • Hiển thị tách biệt với phí bắt buộc, hỗ trợ chế độ niêm yết công khai bảng tin
            chung cư và xuất Excel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xuất Excel
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold shadow-sm"
          >
            <Printer className="w-4 h-4" />
            In bảng niêm yết
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl bg-white"
          >
            <option value="ALL">Tất cả các đợt vận động</option>
            {state.donationCampaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setPublicBoardMode((v) => !v)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
              publicBoardMode
                ? 'bg-sky-50 border-[#0284C7] text-[#0284C7]'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {publicBoardMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {publicBoardMode
              ? 'Đang bật: Chế độ Niêm yết công khai (Bảo vệ riêng tư)'
              : 'Chế độ Kế toán (Hiển thị đầy đủ)'}
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm tabular-nums">
          <span className="text-slate-600">
            Số hộ ủng hộ: <strong className="text-slate-900">{uniqueApartments} hộ</strong>
          </span>
          <span className="text-slate-600">
            Tổng lũy kế:{' '}
            <strong className="text-[#0284C7] text-base">{formatVND(totalAmount)}</strong>
          </span>
        </div>
      </div>

      {/* Printable Public Board Table */}
      <div className="print-container print-a4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-sky-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase">
                Bảng Công khai Đóng góp Tự nguyện — {activeCampaignTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {publicBoardMode
                  ? 'Bản niêm yết bảng tin chung cư BlueMoon (đã ẩn thông tin cư dân yêu cầu riêng tư)'
                  : 'Bản chi tiết lưu hồ sơ kế toán BQT BlueMoon'}
              </p>
            </div>
          </div>
          <Badge variant="info">Tách biệt phí bắt buộc</Badge>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="Chưa có lượt đóng góp nào cho quỹ này" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="px-4 py-3 text-center w-12">STT</th>
                  <th className="px-4 py-3 text-left">Số phòng</th>
                  <th className="px-4 py-3 text-left">Họ tên hộ ủng hộ</th>
                  <th className="px-4 py-3 text-left">Đợt vận động</th>
                  <th className="px-4 py-3 text-left">Ngày đóng</th>
                  <th className="px-4 py-3 text-left">Số phiếu thu</th>
                  <th className="px-4 py-3 text-right">Số tiền đóng góp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-center text-xs text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1E3A8A]">{r.apartmentCode}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {getDisplayName(r.donorName, r.allowPublic)}
                      {!r.allowPublic && !publicBoardMode && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Yêu cầu ẩn tên khi công khai
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.campaignName}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 tabular-nums">
                      {formatDateVN(r.paymentDate)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.receiptNo}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-[#0284C7] tabular-nums">
                      {formatVND(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-sky-50/70 border-t-2 border-sky-200 font-extrabold">
                  <td colSpan={6} className="px-4 py-3.5 text-right uppercase text-slate-800">
                    Tổng cộng lũy kế ({rows.length} lượt ủng hộ)
                  </td>
                  <td className="px-4 py-3.5 text-right text-base text-[#1E3A8A] tabular-nums">
                    {formatVND(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
