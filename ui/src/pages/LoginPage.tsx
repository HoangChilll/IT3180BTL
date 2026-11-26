import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { useBlueMoonStore } from '../store/useBlueMoonStore';
import { useToast } from '../components/ui/Toast';

const DEMO_ACCOUNTS = [
  {
    username: 'admin',
    password: 'Password123',
    roleLabel: 'Trưởng BQT (Admin)',
    desc: 'Toàn quyền quản trị & tài khoản',
  },
  {
    username: 'ketoan',
    password: 'Password123',
    roleLabel: 'Kế toán BQT',
    desc: 'Đơn giá, bảng kê, thu phí, báo cáo',
  },
  {
    username: 'dancu',
    password: 'Password123',
    roleLabel: 'Cán bộ dân cư',
    desc: 'Căn hộ, chủ hộ, nhân khẩu, tạm trú',
  },
  {
    username: 'thuquy',
    password: 'Password123',
    roleLabel: 'Thủ quỹ',
    desc: 'Tra cứu công nợ, thu tiền & in phiếu thu',
  },
];

export const LoginPage: React.FC = () => {
  const { login, state } = useBlueMoonStore();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!username.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    const res = login(username, password);
    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    toast.success('Đăng nhập thành công', res.message);
  };

  const quickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F8FAFC]">
      {/* Left Brand Showcase */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #60A5FA 0%, transparent 45%), radial-gradient(circle at 80% 75%, #93C5FD 0%, transparent 40%)',
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight leading-none">BLUEMOON</p>
            <p className="text-xs text-blue-200 mt-0.5">Apartment Admin Portal • v2.0</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-blue-100 mb-6">
            <ShieldCheck className="w-4 h-4 text-sky-300" />
            Hệ thống Quản trị & Tài chính Chung cư chuẩn Enterprise
          </div>
          <h1 className="text-4xl xl:text-[42px] font-extrabold leading-tight tracking-tight">
            Quản lý Chung cư BlueMoon minh bạch, chính xác & thời gian thực.
          </h1>
          <p className="mt-4 text-blue-100/90 text-sm leading-relaxed">
            Nền tảng tập trung dành cho Ban Quản trị Chung cư BlueMoon — tự động hóa lập bảng kê phí
            định kỳ, quản lý hồ sơ căn hộ & nhân khẩu, phát hành phiếu thu chuẩn kế toán và tổng hợp
            báo cáo tài chính tức thì.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="rounded-xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
              <p className="text-2xl font-extrabold tabular-nums">{state.apartments.length}</p>
              <p className="text-xs text-blue-200 mt-1">Căn hộ đang quản lý</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
              <p className="text-2xl font-extrabold tabular-nums">{state.residents.length}</p>
              <p className="text-xs text-blue-200 mt-1">Nhân khẩu cư trú</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
              <p className="text-2xl font-extrabold tabular-nums">100%</p>
              <p className="text-xs text-blue-200 mt-1">Đối soát thời gian thực</p>
            </div>
          </div>

          <div className="mt-8 space-y-2.5 text-xs text-blue-100/85">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Phân quyền chi tiết 4 vai trò: Trưởng BQT, Kế toán, Thủ quỹ, Cán bộ dân cư</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Chống sinh trùng bảng kê, hỗ trợ thu tiền một phần/toàn phần & in phiếu thu A5</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Tích hợp phân hệ v2.0: Phí gửi xe phương tiện & Thu hộ Điện, Nước, Internet</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200/75 flex items-center justify-between">
          <span>© 2026 Ban Quản trị Chung cư BlueMoon — Hà Nội</span>
          <span>Bảo mật phiên đăng nhập • Khóa tự động sau 5 lần sai</span>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base font-extrabold text-[#1E3A8A]">BLUEMOON</p>
              <p className="text-xs text-slate-500">Quản lý & Thu phí Chung cư</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-7 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Đăng nhập hệ thống</h2>
              <p className="text-sm text-slate-500 mt-1">
                Nhập tài khoản cán bộ Ban Quản trị để truy cập cổng quản trị.
              </p>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-snug">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Tên đăng nhập <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: admin, ketoan, dancu..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Mật khẩu <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-sm shadow-md shadow-blue-900/15 transition flex items-center justify-center gap-2"
              >
                Đăng nhập vào Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-7 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-3">
                <KeyRound className="w-3.5 h-3.5 text-[#2563EB]" />
                Tài khoản demo theo vai trò (nhấn để điền nhanh)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const userObj = state.users.find((u) => u.username === acc.username);
                  const isLocked = userObj?.status === 'LOCKED';
                  return (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => quickFill(acc.username, acc.password)}
                      className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/40 transition group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#1E3A8A]">
                          {acc.roleLabel}
                        </span>
                        {isLocked && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                            Đã khóa
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {acc.username} / {acc.password}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{acc.desc}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                Lưu ý kiểm thử US-01: Nhập sai mật khẩu <strong>5 lần liên tiếp</strong> sẽ tự động
                khóa tài khoản.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
