import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Building2,
  Zap,
  HeartHandshake,
  CreditCard,
  Banknote,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { PaymentMethod, Receipt } from '../types';
import { formatPeriodLabel, formatVND, numberToVietnameseWords } from '../utils/format';
import { Badge } from '../components/ui/Common';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ReceiptPrintModal } from '../components/receipt/ReceiptPrintModal';
import { useToast } from '../components/ui/Toast';

export const CollectionPage: React.FC<{ initialApartmentCode?: string }> = ({
  initialApartmentCode = '',
}) => {
  const { state, getCurrentRepresentative, recordPayment } = useBlueMoonStore();
  const toast = useToast();

  const [query, setQuery] = useState(initialApartmentCode || 'P201');
  const [selectedAptId, setSelectedAptId] = useState<string | null>(() => {
    const code = (initialApartmentCode || 'P201').toUpperCase();
    return state.apartments.find((a) => a.code.toUpperCase() === code)?.id || null;
  });
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);

  // Payment input maps
  const [invoiceAmounts, setInvoiceAmounts] = useState<Record<string, number>>({});
  const [utilityAmounts, setUtilityAmounts] = useState<Record<string, number>>({});
  const [donationAmounts, setDonationAmounts] = useState<Record<string, number>>({});
  const [payerName, setPayerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [note, setNote] = useState('');
  const [allowPublic, setAllowPublic] = useState(true);

  const [confirmPayOpen, setConfirmPayOpen] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (initialApartmentCode) {
      const match = state.apartments.find(
        (a) => a.code.toUpperCase() === initialApartmentCode.toUpperCase()
      );
      setQuery(initialApartmentCode);
      if (match) {
        setSelectedAptId(match.id);
        setNotFoundCode(null);
      }
    }
  }, [initialApartmentCode, state.apartments]);

  const selectedApt = useMemo(
    () => state.apartments.find((a) => a.id === selectedAptId) || null,
    [selectedAptId, state.apartments]
  );

  const currentRep = selectedApt ? getCurrentRepresentative(selectedApt.id) : undefined;

  // Unpaid/partial invoices separated by Old periods vs Current period (US-11 AC3)
  const aptInvoices = useMemo(() => {
    if (!selectedApt) return { oldPeriod: [], currentPeriod: [], allOpen: [] };
    const open = state.invoices
      .filter((inv) => inv.apartmentId === selectedApt.id && inv.status !== 'PAID')
      .sort((a, b) => a.period.localeCompare(b.period));
    return {
      oldPeriod: open.filter((i) => i.period < state.selectedPeriod),
      currentPeriod: open.filter((i) => i.period >= state.selectedPeriod),
      allOpen: open,
    };
  }, [selectedApt, state.invoices, state.selectedPeriod]);

  const aptOpenUtilities = useMemo(() => {
    if (!selectedApt) return [];
    return state.utilityBills.filter(
      (b) => b.apartmentId === selectedApt.id && b.status !== 'PAID'
    );
  }, [selectedApt, state.utilityBills]);

  const activeCampaigns = useMemo(
    () => state.donationCampaigns.filter((c) => c.status === 'ACTIVE'),
    [state.donationCampaigns]
  );

  // Reset form amounts whenever apartment changes
  useEffect(() => {
    if (!selectedApt) return;
    setPayerName(currentRep?.residentName || '');
    setNote('');
    const initInv: Record<string, number> = {};
    aptInvoices.allOpen.forEach((inv) => {
      initInv[inv.id] = inv.amount - inv.paidAmount;
    });
    setInvoiceAmounts(initInv);
    setUtilityAmounts({});
    setDonationAmounts({});
  }, [selectedApt?.id]);

  // Quick list of apartments that currently have debt
  const indebtedApts = useMemo(() => {
    const map = new Map<string, number>();
    state.invoices.forEach((i) => {
      const rem = i.amount - i.paidAmount;
      if (rem > 0) map.set(i.apartmentId, (map.get(i.apartmentId) || 0) + rem);
    });
    return state.apartments
      .filter((a) => (map.get(a.id) || 0) > 0)
      .map((a) => ({ apt: a, debt: map.get(a.id) || 0 }));
  }, [state.apartments, state.invoices]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    const exact = state.apartments.find((a) => a.code.toLowerCase() === q);
    const partial =
      exact ||
      state.apartments.find((a) => {
        const rep = getCurrentRepresentative(a.id);
        return (
          a.code.toLowerCase().includes(q) ||
          (rep && rep.residentName.toLowerCase().includes(q))
        );
      });

    if (!partial) {
      setSelectedAptId(null);
      setNotFoundCode(query.trim().toUpperCase());
      return;
    }

    setNotFoundCode(null);
    setSelectedAptId(partial.id);
  };

  const selectQuickApartment = (aptId: string, code: string) => {
    setQuery(code);
    setNotFoundCode(null);
    setSelectedAptId(aptId);
  };

  // Totals
  const totalOldDebt = aptInvoices.oldPeriod.reduce((s, i) => s + (i.amount - i.paidAmount), 0);
  const totalCurDebt = aptInvoices.currentPeriod.reduce((s, i) => s + (i.amount - i.paidAmount), 0);
  const totalUtilityDebt = aptOpenUtilities.reduce((s, u) => s + (u.amount - u.paidAmount), 0);

  const payingInvoiceSum = aptInvoices.allOpen.reduce(
    (s, i) => s + Math.max(0, Number(invoiceAmounts[i.id] || 0)),
    0
  );
  const payingUtilitySum = aptOpenUtilities.reduce(
    (s, u) => s + Math.max(0, Number(utilityAmounts[u.id] || 0)),
    0
  );
  const payingDonationSum = activeCampaigns.reduce(
    (s, c) => s + Math.max(0, Number(donationAmounts[c.id] || 0)),
    0
  );
  const grandTotal = payingInvoiceSum + payingUtilitySum + payingDonationSum;

  const handleExecutePayment = () => {
    if (!selectedApt) return;
    const res = recordPayment({
      apartmentId: selectedApt.id,
      payerName,
      paymentMethod,
      note,
      allowPublicDisclosure: allowPublic,
      invoicePayments: aptInvoices.allOpen
        .filter((i) => (invoiceAmounts[i.id] || 0) > 0)
        .map((i) => ({ invoiceId: i.id, amount: Number(invoiceAmounts[i.id]) })),
      utilityPayments: aptOpenUtilities
        .filter((u) => (utilityAmounts[u.id] || 0) > 0)
        .map((u) => ({ utilityId: u.id, amount: Number(utilityAmounts[u.id]) })),
      donations: activeCampaigns
        .filter((c) => (donationAmounts[c.id] || 0) > 0)
        .map((c) => ({ campaignId: c.id, amount: Number(donationAmounts[c.id]) })),
    });

    if (!res.ok) {
      toast.error('Giao dịch thu tiền thất bại', res.message);
      return;
    }

    toast.success('Thu phí thành công', res.message);
    if (res.data) {
      setCreatedReceipt(res.data);
    }
    // Refresh inputs after payment
    setInvoiceAmounts({});
    setUtilityAmounts({});
    setDonationAmounts({});
    setNote('');
  };

  const renderInvoiceRow = (inv: (typeof aptInvoices.allOpen)[number]) => {
    const remaining = inv.amount - inv.paidAmount;
    const payVal = invoiceAmounts[inv.id] ?? 0;
    const isChecked = payVal > 0;
    const willBePartial = payVal > 0 && payVal < remaining;
    const exceeds = payVal > remaining;

    return (
      <tr key={inv.id} className="hover:bg-slate-50/70">
        <td className="px-3 py-3 w-9">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) =>
              setInvoiceAmounts((prev) => ({
                ...prev,
                [inv.id]: e.target.checked ? remaining : 0,
              }))
            }
            className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500"
          />
        </td>
        <td className="px-3 py-3">
          <p className="font-semibold text-slate-900 text-xs sm:text-sm">{inv.title}</p>
          <p className="text-[11px] text-slate-500">
            Kỳ {formatPeriodLabel(inv.period)} •{' '}
            {inv.status === 'PARTIAL' ? `Đã nộp trước: ${formatVND(inv.paidAmount)}` : 'Chưa nộp'}
          </p>
        </td>
        <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-700 text-xs sm:text-sm">
          {formatVND(remaining)}
        </td>
        <td className="px-3 py-3 text-right w-44">
          <div className="flex items-center justify-end gap-1.5">
            <input
              type="number"
              min={0}
              max={remaining}
              step={10000}
              aria-label={`Số tiền thu cho ${inv.title}`}
              value={payVal === 0 ? '' : payVal}
              placeholder="0"
              onChange={(e) =>
                setInvoiceAmounts((prev) => ({
                  ...prev,
                  [inv.id]: Math.max(0, Number(e.target.value)),
                }))
              }
              className={`w-28 px-2.5 py-1.5 text-right text-xs font-bold tabular-nums border rounded-lg ${
                exceeds ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-300'
              }`}
            />
            <button
              type="button"
              onClick={() =>
                setInvoiceAmounts((prev) => ({
                  ...prev,
                  [inv.id]: remaining,
                }))
              }
              className="text-[10px] font-semibold px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#2563EB] text-slate-600"
              title="Điền đủ số dư"
            >
              Đủ
            </button>
          </div>
          {exceeds && <p className="text-[10px] text-red-600 mt-0.5">Vượt quá dư nợ!</p>}
          {willBePartial && (
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">
              → Chuyển trạng thái Nộp một phần
            </p>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tra cứu Công nợ & Lập Phiếu thu</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          US-11, US-12 & US-13 • Tra cứu tức thì theo số phòng, hỗ trợ nộp một phần/toàn phần và in
          biên nhận chuẩn BQT.
        </p>
      </div>

      {/* Instant Lookup Bar (US-11) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5">
        <form onSubmit={handleLookup} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập mã căn hộ (VD: P201, P205, P401) hoặc tên chủ hộ..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold shadow-sm transition"
          >
            Tra cứu ngay
          </button>
        </form>

        {/* Quick Debt Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Căn hộ đang có công nợ:</span>
          {indebtedApts.slice(0, 9).map(({ apt, debt }) => (
            <button
              key={apt.id}
              type="button"
              onClick={() => selectQuickApartment(apt.id, apt.code)}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition tabular-nums ${
                selectedAptId === apt.id
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {apt.code}{' '}
              <span className={selectedAptId === apt.id ? 'text-blue-100' : 'text-red-600'}>
                ({formatVND(debt)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Not Found State (US-11 AC4) */}
      {notFoundCode && (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2.5" />
          <h3 className="text-base font-bold text-slate-900">
            Không tìm thấy căn hộ mã "{notFoundCode}"
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Vui lòng kiểm tra lại số phòng hợp lệ trong chung cư BlueMoon (VD: P101, P201, P1205).
          </p>
        </div>
      )}

      {/* Selected Apartment Workspace */}
      {selectedApt && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: Debt Breakdown */}
          <div className="xl:col-span-8 space-y-5">
            {/* Apartment Info Strip */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold">Căn hộ {selectedApt.code}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-semibold">
                      Tầng {selectedApt.floor} • {selectedApt.area} m² • {selectedApt.type}
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1">
                    Chủ hộ / Đại diện:{' '}
                    <strong className="text-white">
                      {currentRep?.residentName || 'Chưa cập nhật'}
                    </strong>
                    {currentRep?.phone ? ` • SĐT: ${currentRep.phone}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 text-right tabular-nums">
                <div>
                  <p className="text-[11px] text-blue-200">Nợ kỳ cũ</p>
                  <p className="text-sm font-bold text-amber-300">{formatVND(totalOldDebt)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-blue-200">Kỳ hiện tại</p>
                  <p className="text-sm font-bold">{formatVND(totalCurDebt)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-blue-200">Tổng nợ phí</p>
                  <p className="text-lg font-extrabold">{formatVND(totalOldDebt + totalCurDebt)}</p>
                </div>
              </div>
            </div>

            {/* Section 1: Old Period Debt (US-11 AC3) */}
            {aptInvoices.oldPeriod.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-red-50/70 border-b border-red-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-bold text-red-900">
                      Công nợ các kỳ cũ chưa thanh toán ({aptInvoices.oldPeriod.length} khoản)
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-red-700 tabular-nums">
                    {formatVND(totalOldDebt)}
                  </span>
                </div>
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2" />
                      <th className="px-3 py-2 text-left">Khoản nợ</th>
                      <th className="px-3 py-2 text-right">Còn nợ</th>
                      <th className="px-3 py-2 text-right">Số tiền nộp lần này</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aptInvoices.oldPeriod.map(renderInvoiceRow)}
                  </tbody>
                </table>
              </div>
            )}

            {/* Section 2: Current Period Debt */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#1E3A8A]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Công nợ Phí Chung cư kỳ hiện tại ({formatPeriodLabel(state.selectedPeriod)})
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#1E3A8A] tabular-nums">
                  {formatVND(totalCurDebt)}
                </span>
              </div>

              {aptInvoices.currentPeriod.length === 0 ? (
                <div className="p-6 text-center text-sm text-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Căn hộ đã hoàn thành toàn bộ phí chung cư kỳ hiện tại!
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-b border-slate-200 text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2" />
                      <th className="px-3 py-2 text-left">Khoản thu</th>
                      <th className="px-3 py-2 text-right">Còn nợ</th>
                      <th className="px-3 py-2 text-right">Số tiền nộp lần này</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aptInvoices.currentPeriod.map(renderInvoiceRow)}
                  </tbody>
                </table>
              )}
            </div>

            {/* Section 3: External Utility Collections v2.0 (US-18 separated) */}
            {aptOpenUtilities.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-950">
                      Khoản thu hộ Điện • Nước • Internet (Tách riêng phí chung cư — v2.0)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-800 tabular-nums">
                    {formatVND(totalUtilityDebt)}
                  </span>
                </div>
                <table className="w-full">
                  <tbody className="divide-y divide-slate-100">
                    {aptOpenUtilities.map((bill) => {
                      const rem = bill.amount - bill.paidAmount;
                      const payVal = utilityAmounts[bill.id] ?? 0;
                      const typeText =
                        bill.utilityType === 'ELECTRICITY'
                          ? 'Tiền điện'
                          : bill.utilityType === 'WATER'
                            ? 'Tiền nước'
                            : 'Internet';
                      return (
                        <tr key={bill.id} className="hover:bg-slate-50/70">
                          <td className="px-3 py-3 w-9">
                            <input
                              type="checkbox"
                              checked={payVal > 0}
                              onChange={(e) =>
                                setUtilityAmounts((prev) => ({
                                  ...prev,
                                  [bill.id]: e.target.checked ? rem : 0,
                                }))
                              }
                              className="w-4 h-4 rounded border-slate-300 text-amber-600"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">
                              {typeText} — {bill.provider}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Kỳ {bill.period} {bill.note ? `• ${bill.note}` : ''}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-right text-xs sm:text-sm font-semibold tabular-nums">
                            {formatVND(rem)}
                          </td>
                          <td className="px-3 py-3 text-right w-40">
                            <input
                              type="number"
                              min={0}
                              max={rem}
                              value={payVal === 0 ? '' : payVal}
                              placeholder="0"
                              onChange={(e) =>
                                setUtilityAmounts((prev) => ({
                                  ...prev,
                                  [bill.id]: Math.max(0, Number(e.target.value)),
                                }))
                              }
                              className="w-28 px-2.5 py-1.5 text-right text-xs font-bold tabular-nums border border-slate-300 rounded-lg"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Section 4: Voluntary Donations (US-09) */}
            {activeCampaigns.length > 0 && (
              <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-sky-50/70 border-b border-sky-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-[#0284C7]" />
                    <h3 className="text-sm font-bold text-sky-950">
                      Đóng góp Quỹ Tự nguyện (Không bắt buộc)
                    </h3>
                  </div>
                  <Badge variant="info">Tự nguyện</Badge>
                </div>
                <div className="divide-y divide-slate-100 p-4 space-y-3">
                  {activeCampaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="pt-3 first:pt-0 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-sm font-semibold text-slate-900">{camp.name}</p>
                        <p className="text-xs text-slate-500">{camp.organizer}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[100000, 200000, 500000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              setDonationAmounts((prev) => ({ ...prev, [camp.id]: preset }))
                            }
                            className="text-[11px] px-2 py-1 rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-50 tabular-nums"
                          >
                            +{preset / 1000}k
                          </button>
                        ))}
                        <input
                          type="number"
                          min={0}
                          step={50000}
                          value={donationAmounts[camp.id] || ''}
                          placeholder="Số tiền..."
                          onChange={(e) =>
                            setDonationAmounts((prev) => ({
                              ...prev,
                              [camp.id]: Math.max(0, Number(e.target.value)),
                            }))
                          }
                          className="w-28 px-2.5 py-1.5 text-right text-xs font-bold tabular-nums border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                  {payingDonationSum > 0 && (
                    <label className="pt-3 flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowPublic}
                        onChange={(e) => setAllowPublic(e.target.checked)}
                        className="rounded border-slate-300 text-[#0284C7]"
                      />
                      Cư dân đồng ý hiển thị họ tên trên Bảng tin niêm yết công khai (US-15)
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right 4 Cols: Checkout & Receipt Issuing Panel */}
          <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-20 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ReceiptIcon className="w-5 h-5 text-[#1E3A8A]" />
              <h3 className="text-base font-bold text-slate-900">Thông tin Lập Phiếu thu</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ tên người nộp tiền <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Nhập họ tên người nộp"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hình thức thanh toán <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'bg-blue-50 border-[#2563EB] text-[#1E3A8A]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Chuyển khoản
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-50 border-[#16A34A] text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  Tiền mặt
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú phiếu thu (Tùy chọn)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Chuyển khoản Vietcombank..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            {/* Breakdown Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Phí chung cư & gửi xe:</span>
                <span className="font-semibold tabular-nums">{formatVND(payingInvoiceSum)}</span>
              </div>
              {payingUtilitySum > 0 && (
                <div className="flex justify-between">
                  <span className="text-amber-800">Thu hộ điện/nước/net:</span>
                  <span className="font-semibold text-amber-800 tabular-nums">
                    {formatVND(payingUtilitySum)}
                  </span>
                </div>
              )}
              {payingDonationSum > 0 && (
                <div className="flex justify-between">
                  <span className="text-sky-800">Đóng góp tự nguyện:</span>
                  <span className="font-semibold text-sky-800 tabular-nums">
                    {formatVND(payingDonationSum)}
                  </span>
                </div>
              )}
              <div className="pt-2.5 border-t border-slate-200 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900">TỔNG THU</span>
                <span className="text-xl font-extrabold text-[#1E3A8A] tabular-nums">
                  {formatVND(grandTotal)}
                </span>
              </div>
              {grandTotal > 0 && (
                <p className="text-[11px] italic text-slate-500 pt-1">
                  ({numberToVietnameseWords(grandTotal)})
                </p>
              )}
            </div>

            <button
              disabled={grandTotal <= 0 || !payerName.trim()}
              onClick={() => setConfirmPayOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Xác nhận Thu tiền & Lập Phiếu thu
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmPayOpen}
        onClose={() => setConfirmPayOpen(false)}
        onConfirm={handleExecutePayment}
        title="Xác nhận giao dịch thu tiền?"
        description={`Thu tổng cộng ${formatVND(grandTotal)} từ căn hộ ${
          selectedApt?.code
        } (Người nộp: ${payerName}). Hệ thống sẽ đồng thời phát hành mã phiếu thu duy nhất và cập nhật công nợ theo nguyên tắc atomic.`}
        confirmLabel="Xác nhận & Phát hành phiếu"
      />

      {/* Immediate Receipt Print Preview after payment (US-13) */}
      <ReceiptPrintModal
        receipt={createdReceipt}
        onClose={() => setCreatedReceipt(null)}
        isReprint={false}
      />
    </div>
  );
};
