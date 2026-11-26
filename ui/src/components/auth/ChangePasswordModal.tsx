import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useBlueMoonStore } from '../../store/useBlueMoonStore';
import { useToast } from '../ui/Toast';
import { getPasswordStrength, validatePassword } from '../../utils/validators';

export const ChangePasswordModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { changePassword } = useBlueMoonStore();
  const toast = useToast();

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = getPasswordStrength(newPwd);
  const newPwdErr = newPwd ? validatePassword(newPwd) : null;

  const resetForm = () => {
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPwd) {
      setError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    const validationErr = validatePassword(newPwd);
    if (validationErr) {
      setError(validationErr);
      return;
    }
    if (newPwd !== confirmPwd) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    const res = changePassword(currentPwd, newPwd);
    if (!res.ok) {
      setError(res.message);
      return;
    }

    toast.success('Đã đổi mật khẩu', res.message);
    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Đổi mật khẩu tài khoản"
      subtitle="US-02 • Mật khẩu mới tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số."
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="change-password-form"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-sm"
          >
            Cập nhật mật khẩu
          </button>
        </>
      }
    >
      <form id="change-password-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mật khẩu hiện tại <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mật khẩu mới <span className="text-red-600">*</span>
          </label>
          <input
            type={showPwd ? 'text' : 'password'}
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Ít nhất 8 ký tự, gồm chữ và số"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          />
          {/* Strength Meter */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500">Độ mạnh mật khẩu:</span>
              <span className="font-semibold text-slate-700">{strength.label}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-colors ${
                    idx <= strength.score ? strength.color : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            {newPwdErr ? (
              <p className="text-[11px] text-amber-700 mt-1.5">{newPwdErr}</p>
            ) : newPwd ? (
              <p className="text-[11px] text-emerald-700 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đáp ứng yêu cầu bảo mật tối thiểu
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Xác nhận mật khẩu mới <span className="text-red-600">*</span>
          </label>
          <input
            type={showPwd ? 'text' : 'password'}
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          />
        </div>
      </form>
    </Modal>
  );
};
