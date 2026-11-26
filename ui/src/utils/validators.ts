export function validateCCCD(cccd: string): string | null {
  const trimmed = cccd.trim();
  if (!trimmed) return 'Vui lòng nhập số CCCD.';
  if (!/^\d{12}$/.test(trimmed)) {
    return 'Số CCCD phải gồm đúng 12 chữ số hợp lệ.';
  }
  return null;
}

export function validateApartmentArea(area: number): string | null {
  if (Number.isNaN(area) || area <= 0) {
    return 'Diện tích sử dụng phải lớn hơn 0 m².';
  }
  if (area < 30 || area > 250) {
    return 'Diện tích căn hộ phải nằm trong khoảng từ 30 m² đến 250 m².';
  }
  return null;
}

export function validateServiceFee(price: number): string | null {
  if (Number.isNaN(price) || price < 0) {
    return 'Không cho phép nhập đơn giá âm.';
  }
  if (price < 2500 || price > 16500) {
    return 'Đơn giá Phí dịch vụ chung cư phải nằm trong khoảng 2.500 – 16.500 đ/m²/tháng.';
  }
  return null;
}

export function validateManagementFee(price: number): string | null {
  if (Number.isNaN(price) || price < 0) {
    return 'Không cho phép nhập đơn giá âm.';
  }
  if (price < 7000) {
    return 'Đơn giá Phí quản lý chung cư phải tối thiểu từ 7.000 đ/m²/tháng trở lên.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Mật khẩu mới phải có tối thiểu 8 ký tự.';
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return 'Mật khẩu mới phải bao gồm cả chữ cái và chữ số.';
  }
  return null;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: 'Chưa nhập', color: 'bg-slate-200' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password) || password.length >= 12) score++;

  if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-red-500' };
  if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
  if (score === 3) return { score: 3, label: 'Khá mạnh', color: 'bg-blue-500' };
  return { score: 4, label: 'Rất mạnh', color: 'bg-emerald-600' };
}

export function validateDateRange(fromDate: string, toDate?: string): string | null {
  if (!fromDate) return 'Vui lòng chọn ngày bắt đầu.';
  if (toDate && toDate < fromDate) {
    return 'Ngày kết thúc không được trước ngày bắt đầu.';
  }
  return null;
}
