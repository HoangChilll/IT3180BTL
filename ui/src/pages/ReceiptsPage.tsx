import React, { useMemo, useState } from 'react';
import { Printer, Search, Receipt as ReceiptIcon, Banknote, CreditCard } from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { Receipt } from '../types';
import { formatDateTimeVN, formatVND } from '../utils/format';
import { Badge, EmptyState, Pagination } from '../components/ui/Common';
import { ReceiptPrintModal } from '../components/receipt/ReceiptPrintModal';

export const ReceiptsPage: React.FC = () => {
  const { state } = useBlueMoonStore();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.receipts.filter((r) => {
      const matchQ =
        !q ||
        r.receiptNo.toLowerCase().includes(q) ||
        r.apartmentCode.toLowerCase().includes(q) ||
        r.payerName.toLowerCase().includes(q);
      const matchMethod = methodFilter === 'ALL' || r.paymentMethod === methodFilter;
      return matchQ && matchMethod;
    });
  }, [methodFilter, search, state.receipts]);

  const stats = useMemo(() => {
    const total = filtered.reduce((s, r) => s + r.totalAmount, 0);
    const cash = filtered
      .filter((r) => r.paymentMethod === 'CASH')
      .reduce((s, r) => s + r.totalAmount, 0);
    const bank = filtered
      .filter((r) => r.paymentMethod === 'BANK_TRANSFER')
      .reduce((s, r) => s + r.totalAmount, 0);
    return { total, cash, bank };
  }, [filtered]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử Phiếu thu & In lại Biên nhận</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          US-13 • Tra cứu mọi chứng từ đã phát hành và in lại bất kỳ lúc nào với đúng mã chứng từ gốc.
        </p>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Tổng giá trị chứng từ ({filtered.length} phiếu)</p>
            <p className="text-xl font-extrabold text-[#1E3A8A] tabular-nums mt-1">
              {formatVND(stats.total)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E3A8A]">
            <ReceiptIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Thu qua Chuyển khoản</p>
            <p className="text-xl font-extrabold text-[#2563EB] tabular-nums mt-1">
              {formatVND(stats.bank)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50 text-[#2563EB]">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Thu bằng Tiền mặt</p>
            <p className="text-xl font-extrabold text-[#16A34A] tabular-nums mt-1">
              {formatVND(stats.cash)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#16A34A]">
            <Banknote className="w-5 h-5" />
          </div>
        </div>
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
            placeholder="Tìm theo số phiếu thu (PT-...), mã căn hộ, người nộp..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl"
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
        >
          <option value="ALL">Tất cả hình thức</option>
          <option value="BANK_TRANSFER">Chuyển khoản</option>
          <option value="CASH">Tiền mặt</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {paginated.length === 0 ? (
          <EmptyState title="Không tìm thấy phiếu thu phù hợp" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="px-4 py-3.5 text-left">Số phiếu thu</th>
                    <th className="px-4 py-3.5 text-left">Căn hộ</th>
                    <th className="px-4 py-3.5 text-left">Người nộp</th>
                    <th className="px-4 py-3.5 text-left">Ngày thu</th>
                    <th className="px-4 py-3.5 text-left">Hình thức</th>
                    <th className="px-4 py-3.5 text-right">Tổng số tiền</th>
                    <th className="px-4 py-3.5 text-right">Biên nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#1E3A8A]">
                        {r.receiptNo}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{r.apartmentCode}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900">{r.payerName}</p>
                        <p className="text-[11px] text-slate-500">
                          {r.items.length} khoản mục • Thu bởi: {r.cashierName}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 tabular-nums">
                        {formatDateTimeVN(r.paymentDate)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={r.paymentMethod === 'CASH' ? 'success' : 'info'}>
                          {r.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 tabular-nums">
                        {formatVND(r.totalAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Xem & In lại
                        </button>
                      </td>
                    </tr>
                  ))}
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

      <ReceiptPrintModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        isReprint={true}
      />
    </div>
  );
};
