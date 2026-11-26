import { PageKey, Role } from '../types';

export const ROLE_META: Record<
  Role,
  { label: string; shortLabel: string; badgeClass: string; description: string }
> = {
  ADMIN: {
    label: 'Trưởng BQT (Admin)',
    shortLabel: 'Trưởng BQT',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    description: 'Toàn quyền quản trị hệ thống, tài khoản cán bộ, dân cư, tài chính và báo cáo.',
  },
  ACCOUNTANT: {
    label: 'Kế toán BQT',
    shortLabel: 'Kế toán',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    description: 'Cấu hình đơn giá phí, lập bảng kê, thu phí, quản lý xe/thu hộ và xuất báo cáo tài chính.',
  },
  CASHIER: {
    label: 'Thủ quỹ',
    shortLabel: 'Thủ quỹ',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Tra cứu công nợ căn hộ, ghi nhận thanh toán, lập và in phiếu thu.',
  },
  RESIDENT_OFFICER: {
    label: 'Cán bộ dân cư',
    shortLabel: 'CB Dân cư',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Quản lý hồ sơ căn hộ, người đại diện, nhân khẩu và biến động tạm trú/tạm vắng.',
  },
};

export const ROLE_ALLOWED_PAGES: Record<Role, PageKey[]> = {
  ADMIN: [
    'dashboard',
    'apartments',
    'residents',
    'residency-events',
    'fee-config',
    'billing',
    'collection',
    'receipts',
    'reports',
    'donations-report',
    'vehicles',
    'utilities',
    'users',
    'settings',
  ],
  ACCOUNTANT: [
    'dashboard',
    'apartments',
    'fee-config',
    'billing',
    'collection',
    'receipts',
    'reports',
    'donations-report',
    'vehicles',
    'utilities',
    'settings',
  ],
  CASHIER: [
    'dashboard',
    'collection',
    'receipts',
    'donations-report',
    'settings',
  ],
  RESIDENT_OFFICER: [
    'dashboard',
    'apartments',
    'residents',
    'residency-events',
    'settings',
  ],
};

export function canAccessPage(role: Role, page: PageKey): boolean {
  return ROLE_ALLOWED_PAGES[role].includes(page);
}

export function canExportResidencyEvents(role: Role): boolean {
  return role === 'ADMIN' || role === 'RESIDENT_OFFICER';
}

export function canEditApartmentsAndResidents(role: Role): boolean {
  return role === 'ADMIN' || role === 'RESIDENT_OFFICER';
}

export function canManageFeesAndBilling(role: Role): boolean {
  return role === 'ADMIN' || role === 'ACCOUNTANT';
}

export function canCollectPayments(role: Role): boolean {
  return role === 'ADMIN' || role === 'ACCOUNTANT' || role === 'CASHIER';
}
