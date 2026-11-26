import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  HeartHandshake,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { PageKey } from '../types';
import { formatPeriodLabel, formatVND } from '../utils/format';
import { Badge } from '../components/ui/Common';
import { canCollectPayments } from '../utils/permissions';

interface DashboardPageProps {
  onNavigate: (page: PageKey, extra?: { apartmentCode?: string }) => void;
}

const PIE_COLORS = ['#16A34A', '#D97706', '#DC2626'];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { state, currentUser, getCurrentRepresentative } = useBlueMoonStore();

  const [timeMode, setTimeMode] = useState<'MONTH' | 'QUARTER'>('MONTH');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const canCollect = currentUser ? canCollectPayments(currentUser.role) : false;

  const floors = useMemo(
    () => Array.from(new Set(state.apartments.map((a) => a.floor))).sort((a, b) => a - b),
    [state.apartments]
  );

  // Filtered apartments based on Floor & Type
  const filteredApartments = useMemo(() => {
    return state.apartments.filter((a) => {
      const okFloor = floorFilter === 'ALL' || a.floor === Number(floorFilter);
      const okType = typeFilter === 'ALL' || a.type === typeFilter;
      return okFloor && okType;
    });
  }, [floorFilter, state.apartments, typeFilter]);

  const filteredAptIds = useMemo(
    () => new Set(filteredApartments.map((a) => a.id)),
    [filteredApartments]
  );

  // Target periods based on Month or Quarter
  const targetPeriods = useMemo(() => {
    if (timeMode === 'MONTH') return [state.selectedPeriod];
    const [year, monthStr] = state.selectedPeriod.split('-');
    const q = Math.ceil(Number(monthStr) / 3);
    const startM = (q - 1) * 3 + 1;
    return [startM, startM + 1, startM + 2].map(
      (m) => `${year}-${String(m).padStart(2, '0')}`
    );
  }, [state.selectedPeriod, timeMode]);

  const periodSet = useMemo(() => new Set(targetPeriods), [targetPeriods]);

  // Invoices matching filters
  const scopedInvoices = useMemo(() => {
    return state.invoices.filter(
      (inv) => filteredAptIds.has(inv.apartmentId) && periodSet.has(inv.period)
    );
  }, [filteredAptIds, periodSet, state.invoices]);

  // Exact reconciled KPIs (US-14 AC4: totalDue = totalPaid + totalRemaining)
  const kpis = useMemo(() => {
    const totalDue = scopedInvoices.reduce((s, i) => s + i.amount, 0);
    const totalPaid = scopedInvoices.reduce((s, i) => s + i.paidAmount, 0);
    const totalRemaining = totalDue - totalPaid;
    const rate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 1000) / 10 : 0;

    // Total voluntary donations across all active/historical receipts in scoped apartments
    const donationTotal = state.receipts
      .filter((r) => filteredAptIds.has(r.apartmentId))
      .reduce(
        (s, r) =>
          s +
          r.items
            .filter((it) => it.category === 'VOLUNTARY_DONATION')
            .reduce((is, it) => is + it.amount, 0),
        0
      );

    return { totalDue, totalPaid, totalRemaining, rate, donationTotal };
  }, [filteredAptIds, scopedInvoices, state.receipts]);

  // Apartment-level aggregation for Pie chart & Unpaid List
  const aptRollup = useMemo(() => {
    return filteredApartments.map((apt) => {
      const invs = scopedInvoices.filter((i) => i.apartmentId === apt.id);
      const due = invs.reduce((s, i) => s + i.amount, 0);
      const paid = invs.reduce((s, i) => s + i.paidAmount, 0);
      const rem = due - paid;
      const status: 'PAID' | 'PARTIAL' | 'UNPAID' =
        due === 0 || rem === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';
      return {
        apt,
        rep: getCurrentRepresentative(apt.id),
        due,
        paid,
        rem,
        status,
      };
    });
  }, [filteredApartments, getCurrentRepresentative, scopedInvoices]);

  const pieData = useMemo(() => {
    const paid = aptRollup.filter((r) => r.due > 0 && r.status === 'PAID').length;
    const partial = aptRollup.filter((r) => r.status === 'PARTIAL').length;
    const unpaid = aptRollup.filter((r) => r.status === 'UNPAID').length;
    return [
      { name: 'Đã thanh toán đủ', value: paid },
      { name: 'Nộp một phần', value: partial },
      { name: 'Chưa nộp phí', value: unpaid },
    ];
  }, [aptRollup]);

  // Multi-month comparison BarChart (respects Floor & Type filter!)
  const monthlyChartData = useMemo(() => {
    const periods = Array.from(new Set(state.invoices.map((i) => i.period)))
      .sort()
      .slice(-6);
    return periods.map((p) => {
      const invs = state.invoices.filter(
        (i) => i.period === p && filteredAptIds.has(i.apartmentId)
      );
      const paid = invs.reduce((s, i) => s + i.paidAmount, 0);
      const rem = invs.reduce((s, i) => s + (i.amount - i.paidAmount), 0);
      return {
        period: p.replace('2026-', 'T'),
        'Đã thu': Math.round(paid / 1000000 * 100) / 100,
        'Còn nợ': Math.round(rem / 1000000 * 100) / 100,
      };
    });
  }, [filteredAptIds, state.invoices]);

  const unpaidList = useMemo(
    () => aptRollup.filter((r) => r.rem > 0).sort((a, b) => b.rem - a.rem),
    [aptRollup]
  );

  const periodCaption =
    timeMode === 'MONTH'
      ? formatPeriodLabel(state.selectedPeriod)
      : `Quý ${Math.ceil(Number(state.selectedPeriod.split('-')[1]) / 3)}/${
          state.selectedPeriod.split('-')[0]
        }`;

  return (
    <div className="space-y-6">
      {/* Header + Global Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Quản trị Chung cư BlueMoon
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            US-14 • Số liệu tổng hợp thời gian thực cho <strong>{periodCaption}</strong> (
            {filteredApartments.length} căn hộ đang lọc).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1 pl-2 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setTimeMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeMode === 'MONTH'
                  ? 'bg-white text-[#1E3A8A] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setTimeMode('QUARTER')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeMode === 'QUARTER'
                  ? 'bg-white text-[#1E3A8A] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo Quý
            </button>
          </div>

          <select
            aria-label="Lọc Dashboard theo tầng"
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700"
          >
            <option value="ALL">Tất cả tầng</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                Tầng {f}
              </option>
            ))}
          </select>

          <select
            aria-label="Lọc Dashboard theo loại căn hộ"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700"
          >
            <option value="ALL">Tất cả loại căn</option>
            <option value="1PN">1PN</option>
            <option value="2PN">2PN</option>
            <option value="3PN">3PN</option>
            <option value="Penthouse">Penthouse</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng phải thu ({periodCaption})</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#1E3A8A]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums mt-2">
            {formatVND(kpis.totalDue)}
          </p>
          <p className="text-xs text-slate-500 mt-1.5 tabular-nums">
            {scopedInvoices.length} khoản công nợ phát sinh
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng tiền đã thu</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#16A34A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#16A34A] tabular-nums mt-2">
            {formatVND(kpis.totalPaid)}
          </p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#16A34A] h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, kpis.rate)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Số tiền còn nợ</span>
            <div className="p-2 rounded-xl bg-red-50 text-[#DC2626]">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#DC2626] tabular-nums mt-2">
            {formatVND(kpis.totalRemaining)}
          </p>
          <p className="text-xs text-slate-500 mt-1.5 tabular-nums">
            {unpaidList.length} căn hộ chưa hoàn thành
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tỷ lệ hoàn thành thu phí</span>
            <div className="p-2 rounded-xl bg-sky-50 text-[#2563EB]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1E3A8A] tabular-nums mt-2">
            {kpis.rate}%
          </p>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 tabular-nums">
            <HeartHandshake className="w-3.5 h-3.5 text-[#0284C7]" />
            Quỹ từ thiện: <strong className="text-slate-700">{formatVND(kpis.donationTotal)}</strong>
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Biểu đồ Tiến độ Thu phí theo Kỳ (Triệu VNĐ)
              </h2>
              <p className="text-xs text-slate-500">
                So sánh số tiền Đã thu và Còn nợ theo bộ lọc căn hộ đang chọn.
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 12, fill: '#475569' }} unit="tr" />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)} triệu đ`, '']}
                  contentStyle={{ borderRadius: 12, borderColor: '#E2E8F0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Đã thu" fill="#16A34A" radius={[6, 6, 0, 0]} maxBarSize={42} />
                <Bar dataKey="Còn nợ" fill="#DC2626" radius={[6, 6, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-slate-900">Tỷ lệ Căn hộ hoàn thành</h2>
          <p className="text-xs text-slate-500 mb-3">Phân bố trạng thái đóng phí ({periodCaption})</p>
          <div className="h-52 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {pieData.map((d, idx) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx] }}
                  />
                  {d.name}
                </span>
                <strong className="tabular-nums text-slate-900">{d.value} căn</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Quick Stats + Unpaid Apartments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Danh sách Căn hộ Chưa hoàn thành phí ({unpaidList.length} căn)
            </h2>
            <p className="text-xs text-slate-500">
              Cập nhật tức thì ngay khi lập phiếu thu hoặc chốt bảng kê mới.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
              {state.apartments.length} căn hộ
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#2563EB]" />
              {state.residents.length} cư dân
            </span>
          </div>
        </div>

        {unpaidList.length === 0 ? (
          <div className="p-10 text-center text-sm text-emerald-700 font-medium">
            Tất cả căn hộ trong bộ lọc đã thanh toán đủ 100% phí cho {periodCaption}!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="px-4 py-3 text-left">Mã căn</th>
                  <th className="px-4 py-3 text-left">Tầng / Loại</th>
                  <th className="px-4 py-3 text-left">Chủ hộ / Đại diện</th>
                  <th className="px-4 py-3 text-right">Phải thu</th>
                  <th className="px-4 py-3 text-right">Đã nộp</th>
                  <th className="px-4 py-3 text-right">Còn nợ</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  {canCollect && <th className="px-4 py-3 text-right">Hành động</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unpaidList.map((row) => (
                  <tr key={row.apt.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-[#1E3A8A]">{row.apt.code}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      Tầng {row.apt.floor} • {row.apt.type} ({row.apt.area} m²)
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {row.rep?.residentName || 'Chưa cập nhật'}
                      </p>
                      <p className="text-[11px] text-slate-500">{row.rep?.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {formatVND(row.due)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#16A34A] font-medium">
                      {formatVND(row.paid)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-extrabold text-[#DC2626]">
                      {formatVND(row.rem)}
                    </td>
                    <td className="px-4 py-3">
                      {row.status === 'PARTIAL' ? (
                        <Badge variant="warning">Nộp một phần</Badge>
                      ) : (
                        <Badge variant="danger">Chưa nộp</Badge>
                      )}
                    </td>
                    {canCollect && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            onNavigate('collection', { apartmentCode: row.apt.code })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition"
                        >
                          Thu ngay
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
