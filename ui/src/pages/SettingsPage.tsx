import React, { useState } from 'react';
import { RotateCcw, Database, ShieldCheck, Check, Minus } from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { ROLE_META } from '../utils/permissions';
import { Role } from '../types';

const MATRIX_ROWS: Array<{ feature: string; roles: Role[] }> = [
  { feature: 'Dashboard & Thống kê tình hình thu phí (US-14)', roles: ['ADMIN', 'ACCOUNTANT', 'CASHIER', 'RESIDENT_OFFICER'] },
  { feature: 'Quản lý Tài khoản cán bộ & Phân quyền (US-03)', roles: ['ADMIN'] },
  { feature: 'Quản lý Hồ sơ căn hộ, Chủ hộ, Nhân khẩu (US-04, 05, 06)', roles: ['ADMIN', 'RESIDENT_OFFICER'] },
  { feature: 'Ghi nhận & Xuất lịch sử Biến động cư trú (US-07)', roles: ['ADMIN', 'RESIDENT_OFFICER'] },
  { feature: 'Cấu hình đơn giá phí & Tạo đợt quyên góp (US-08, 09)', roles: ['ADMIN', 'ACCOUNTANT'] },
  { feature: 'Tự động lập bảng kê phí tháng (US-10)', roles: ['ADMIN', 'ACCOUNTANT'] },
  { feature: 'Tra cứu công nợ, Thu tiền & In Phiếu thu (US-11, 12, 13)', roles: ['ADMIN', 'ACCOUNTANT', 'CASHIER'] },
  { feature: 'Quản lý Phương tiện gửi xe & Thu hộ Điện/Nước v2.0 (US-17, 18)', roles: ['ADMIN', 'ACCOUNTANT'] },
  { feature: 'Xuất Báo cáo tài chính Excel/PDF (US-15, 16)', roles: ['ADMIN', 'ACCOUNTANT'] },
];

export const SettingsPage: React.FC = () => {
  const { state, resetDemoData } = useBlueMoonStore();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt Hệ thống & Dữ liệu mẫu</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Quản lý lưu trữ cục bộ (localStorage), khôi phục dữ liệu kiểm thử và ma trận phân quyền vai trò.
        </p>
      </div>

      {/* Persistence Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Lưu trữ dữ liệu bền vững (localStorage)</h2>
            <p className="text-sm text-slate-600 mt-1">
              Mọi thao tác thêm căn hộ, nhân khẩu, lập bảng kê và thu phí được lưu tự động trên trình duyệt.
            </p>
            <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-slate-500 tabular-nums">
              <span>• {state.apartments.length} căn hộ</span>
              <span>• {state.residents.length} nhân khẩu</span>
              <span>• {state.invoices.length} bản ghi công nợ</span>
              <span>• {state.receipts.length} phiếu thu</span>
              <span>• {state.vehicles.length} phương tiện</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setConfirmReset(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-sm shrink-0 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Khôi phục dữ liệu mẫu
        </button>
      </div>

      {/* Role Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#1E3A8A]" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Ma trận Phân quyền Vai trò (RBAC)</h2>
            <p className="text-xs text-slate-500">
              Áp dụng đồng bộ trên Sidebar, route và thao tác chức năng theo US-03.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="px-6 py-3.5 text-left">Chức năng / Nghiệp vụ</th>
                {(['ADMIN', 'ACCOUNTANT', 'CASHIER', 'RESIDENT_OFFICER'] as Role[]).map((r) => (
                  <th key={r} className="px-4 py-3.5 text-center">
                    {ROLE_META[r].shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MATRIX_ROWS.map((row) => (
                <tr key={row.feature} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3 font-medium text-slate-800">{row.feature}</td>
                  {(['ADMIN', 'ACCOUNTANT', 'CASHIER', 'RESIDENT_OFFICER'] as Role[]).map((r) => {
                    const ok = row.roles.includes(r);
                    return (
                      <td key={r} className="px-4 py-3 text-center">
                        {ok ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex w-6 h-6 rounded-full bg-slate-100 text-slate-400 items-center justify-center">
                            <Minus className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          toast.success(
            'Đã khôi phục dữ liệu mẫu',
            'Toàn bộ dữ liệu chung cư BlueMoon đã được đưa về trạng thái chuẩn ban đầu.'
          );
        }}
        variant="warning"
        title="Khôi phục toàn bộ dữ liệu mẫu?"
        description="Mọi thay đổi bạn đã thêm/sửa/thu tiền trong trình duyệt sẽ bị ghi đè bằng bộ dữ liệu mẫu chuẩn BlueMoon (18 căn hộ, 3 kỳ phí, phiếu thu, xe và điện nước)."
        confirmLabel="Khôi phục ngay"
      />
    </div>
  );
};
