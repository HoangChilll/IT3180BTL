import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  ArrowLeftRight,
  SlidersHorizontal,
  FileSpreadsheet,
  Wallet,
  Receipt,
  BarChart3,
  HeartHandshake,
  Car,
  Zap,
  ShieldCheck,
  Settings,
  Search,
  LogOut,
  KeyRound,
  Calendar,
  Menu,
  X,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { PageKey, Role } from '../../types';
import { useBlueMoonStore } from '../../store/useBlueMoonStore';
import { canAccessPage, ROLE_META } from '../../utils/permissions';
import { formatPeriodLabel } from '../../utils/format';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { useToast } from '../ui/Toast';

interface NavGroup {
  title: string;
  items: Array<{
    key: PageKey;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Tổng quan',
    items: [{ key: 'dashboard', label: 'Dashboard tổng quan', icon: LayoutDashboard }],
  },
  {
    title: 'Căn hộ & Dân cư',
    items: [
      { key: 'apartments', label: 'Hồ sơ căn hộ & Chủ hộ', icon: Building2 },
      { key: 'residents', label: 'Danh sách nhân khẩu', icon: Users },
      { key: 'residency-events', label: 'Biến động cư trú', icon: ArrowLeftRight },
    ],
  },
  {
    title: 'Khoản thu & Thu phí',
    items: [
      { key: 'fee-config', label: 'Đơn giá & Quỹ tự nguyện', icon: SlidersHorizontal },
      { key: 'billing', label: 'Lập bảng kê phí tháng', icon: FileSpreadsheet },
      { key: 'collection', label: 'Tra cứu & Thu phí', icon: Wallet },
      { key: 'receipts', label: 'Lịch sử Phiếu thu', icon: Receipt },
    ],
  },
  {
    title: 'Dịch vụ mở rộng (v2.0)',
    items: [
      { key: 'vehicles', label: 'Phương tiện & Gửi xe', icon: Car, badge: 'v2.0' },
      { key: 'utilities', label: 'Thu hộ Điện • Nước • Net', icon: Zap, badge: 'v2.0' },
    ],
  },
  {
    title: 'Thống kê & Báo cáo',
    items: [
      { key: 'reports', label: 'Báo cáo tài chính', icon: BarChart3 },
      { key: 'donations-report', label: 'Danh sách ủng hộ quỹ', icon: HeartHandshake },
    ],
  },
  {
    title: 'Quản trị hệ thống',
    items: [
      { key: 'users', label: 'Tài khoản cán bộ', icon: ShieldCheck },
      { key: 'settings', label: 'Cài đặt & Dữ liệu mẫu', icon: Settings },
    ],
  },
];

interface AppShellProps {
  activePage: PageKey;
  onNavigate: (page: PageKey, extra?: { apartmentCode?: string }) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ activePage, onNavigate, children }) => {
  const { state, currentUser, logout, demoSwitchRole, setSelectedPeriod, getCurrentRepresentative } =
    useBlueMoonStore();
  const toast = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  // Available periods from invoices + current & upcoming month
  const availablePeriods = useMemo(() => {
    const set = new Set<string>(['2026-09', '2026-10', '2026-11', '2026-12']);
    state.invoices.forEach((i) => set.add(i.period));
    return Array.from(set).sort().reverse();
  }, [state.invoices]);

  // Ctrl+K Quick Search Shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!currentUser) return null;
  const roleMeta = ROLE_META[currentUser.role];

  const handleNavClick = (key: PageKey) => {
    if (!canAccessPage(currentUser.role, key)) {
      toast.warning(
        'Không đủ quyền truy cập',
        `Vai trò ${roleMeta.label} không được phân quyền truy cập phân hệ này.`
      );
      return;
    }
    onNavigate(key);
    setMobileMenuOpen(false);
  };

  // Command palette filtered items
  const cmdResults = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    const pages = NAV_GROUPS.flatMap((g) => g.items)
      .filter((it) => canAccessPage(currentUser.role, it.key))
      .filter((it) => !q || it.label.toLowerCase().includes(q));

    const apts = state.apartments
      .filter((a) => {
        if (!q) return false;
        const rep = getCurrentRepresentative(a.id);
        return (
          a.code.toLowerCase().includes(q) ||
          (rep && rep.residentName.toLowerCase().includes(q))
        );
      })
      .slice(0, 6);

    const residents = state.residents
      .filter(
        (r) =>
          q.length >= 2 &&
          (r.fullName.toLowerCase().includes(q) || r.cccd.includes(q))
      )
      .slice(0, 5);

    return { pages, apts, residents };
  }, [cmdQuery, currentUser.role, getCurrentRepresentative, state.apartments, state.residents]);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-200 select-none">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] text-white flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-white leading-none">
              BLUEMOON
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Admin Portal v2.0</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const allowed = canAccessPage(currentUser.role, item.key);
                const active = activePage === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    title={
                      allowed
                        ? item.label
                        : `Yêu cầu phân quyền cao hơn (${roleMeta.shortLabel} không có quyền)`
                    }
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition ${
                      active
                        ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-900/30'
                        : allowed
                          ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          : 'text-slate-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {!allowed ? (
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    ) : item.badge ? (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          active ? 'bg-white/20 text-white' : 'bg-sky-500/15 text-sky-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Demo Role Switcher */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/70">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Chuyển vai trò nhanh (Demo)
        </label>
        <select
          aria-label="Chuyển vai trò demo"
          value={currentUser.role}
          onChange={(e) => {
            const nextRole = e.target.value as Role;
            demoSwitchRole(nextRole);
            toast.info('Đã chuyển vai trò', `Đang xem với quyền ${ROLE_META[nextRole].label}`);
            if (!canAccessPage(nextRole, activePage)) {
              onNavigate('dashboard');
            }
          }}
          className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-[#2563EB]"
        >
          <option value="ADMIN">Trưởng BQT (Admin)</option>
          <option value="ACCOUNTANT">Kế toán BQT</option>
          <option value="CASHIER">Thủ quỹ</option>
          <option value="RESIDENT_OFFICER">Cán bộ dân cư</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 h-full">{SidebarContent}</div>
          <div className="flex-1 bg-slate-900/50" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="no-print sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Ctrl+K Search trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center justify-between gap-2 w-full max-w-[260px] xl:max-w-sm min-w-0 px-3 py-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              <span className="flex items-center gap-2 min-w-0 truncate">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Tìm nhanh căn hộ (P101), cư dân...</span>
              </span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shrink-0">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Working Period Selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50/70 border border-blue-200/80 rounded-xl shrink-0">
              <Calendar className="w-4 h-4 text-[#1E3A8A] shrink-0" />
              <span className="hidden xl:inline text-xs font-medium text-slate-600 whitespace-nowrap">
                Kỳ làm việc:
              </span>
              <select
                aria-label="Chọn kỳ làm việc"
                value={state.selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-xs font-bold text-[#1E3A8A] bg-transparent focus:outline-none cursor-pointer"
              >
                {availablePeriods.map((p) => (
                  <option key={p} value={p}>
                    {formatPeriodLabel(p)}
                  </option>
                ))}
              </select>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center">
                  {currentUser.fullName
                    .split(' ')
                    .slice(-2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-bold text-slate-800">{currentUser.fullName}</p>
                  <p className="text-[11px] text-slate-500">{roleMeta.shortLabel}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{currentUser.fullName}</p>
                    <p className="text-xs text-slate-500">@{currentUser.username}</p>
                    <span
                      className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleMeta.badgeClass}`}
                    >
                      {roleMeta.label}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setPwdModalOpen(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      toast.info('Đã đăng xuất', 'Phiên làm việc đã kết thúc an toàn.');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>

      {/* Ctrl+K Command Palette */}
      {cmdOpen && (
        <div
          className="no-print fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-start justify-center pt-[12vh] p-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Nhập mã căn hộ (VD: P101, P205), tên cư dân hoặc tên chức năng..."
                className="flex-1 text-sm focus:outline-none"
              />
              <button
                onClick={() => setCmdOpen(false)}
                className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-500"
              >
                ESC
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
              {cmdResults.apts.length > 0 && (
                <div className="py-1.5">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Tra cứu nhanh công nợ căn hộ
                  </p>
                  {cmdResults.apts.map((apt) => {
                    const rep = getCurrentRepresentative(apt.id);
                    return (
                      <button
                        key={apt.id}
                        onClick={() => {
                          setCmdOpen(false);
                          setCmdQuery('');
                          const targetPage = canAccessPage(currentUser.role, 'collection')
                            ? 'collection'
                            : 'apartments';
                          onNavigate(targetPage, { apartmentCode: apt.code });
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-blue-50 flex items-center justify-between text-left"
                      >
                        <div>
                          <span className="text-sm font-bold text-[#1E3A8A]">{apt.code}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            Tầng {apt.floor} • {apt.area} m² • {rep?.residentName || 'Chưa có đại diện'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#2563EB] font-medium">Mở hồ sơ →</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {cmdResults.residents.length > 0 && (
                <div className="py-1.5">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Cư dân
                  </p>
                  {cmdResults.residents.map((r) => {
                    const apt = state.apartments.find((a) => a.id === r.apartmentId);
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setCmdOpen(false);
                          setCmdQuery('');
                          if (canAccessPage(currentUser.role, 'residents')) {
                            onNavigate('residents');
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-left text-xs"
                      >
                        <span className="font-semibold text-slate-800">{r.fullName}</span>
                        <span className="text-slate-500">
                          {apt?.code} • CCCD: {r.cccd}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="py-1.5">
                <p className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                  Điều hướng nhanh
                </p>
                {cmdResults.pages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.key}
                      onClick={() => {
                        setCmdOpen(false);
                        setCmdQuery('');
                        onNavigate(p.key);
                      }}
                      className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2.5 text-sm text-slate-700"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* US-02 Change Password Modal */}
      <ChangePasswordModal open={pwdModalOpen} onClose={() => setPwdModalOpen(false)} />
    </div>
  );
};
