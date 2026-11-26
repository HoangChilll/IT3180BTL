import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BlueMoonState, createSeedData } from '../data/seedData';
import {
  Apartment,
  DonationCampaign,
  FeeInvoice,
  FeeRate,
  FeeRateCategory,
  PaymentMethod,
  Receipt,
  ReceiptItem,
  RepresentativeHistory,
  ResidencyEvent,
  Resident,
  Role,
  User,
  UtilityBill,
  Vehicle,
} from '../types';
import {
  validateApartmentArea,
  validateCCCD,
  validateDateRange,
  validateManagementFee,
  validatePassword,
  validateServiceFee,
} from '../utils/validators';

const STORAGE_KEY = 'bluemoon_admin_store_v1';
const SESSION_KEY = 'bluemoon_session_user_id';
const MAX_FAILED_LOGIN = 5;

export interface ActionResult<T = undefined> {
  ok: boolean;
  message: string;
  data?: T;
}

export interface PaymentInput {
  apartmentId: string;
  payerName: string;
  paymentMethod: PaymentMethod;
  note?: string;
  allowPublicDisclosure?: boolean;
  invoicePayments: Array<{ invoiceId: string; amount: number }>;
  utilityPayments: Array<{ utilityId: string; amount: number }>;
  donations: Array<{ campaignId: string; amount: number }>;
}

interface BlueMoonContextValue {
  state: BlueMoonState;
  currentUser: User | null;
  // Auth (US-01, US-02, US-03)
  login: (username: string, password: string) => ActionResult<User>;
  logout: () => void;
  demoSwitchRole: (role: Role) => void;
  changePassword: (currentPassword: string, newPassword: string) => ActionResult;
  createUser: (payload: {
    username: string;
    fullName: string;
    password: string;
    role: Role;
    email?: string;
    phone?: string;
  }) => ActionResult<User>;
  updateUser: (
    userId: string,
    payload: { fullName: string; role: Role; email?: string; phone?: string }
  ) => ActionResult;
  toggleUserStatus: (userId: string, reason?: string) => ActionResult;
  // Working period
  setSelectedPeriod: (period: string) => void;
  // Apartments & Representatives (US-04, US-05)
  addApartment: (payload: Omit<Apartment, 'id' | 'createdAt'>) => ActionResult<Apartment>;
  updateApartment: (id: string, payload: Partial<Omit<Apartment, 'id' | 'createdAt'>>) => ActionResult;
  deleteApartment: (id: string) => ActionResult;
  getCurrentRepresentative: (apartmentId: string) => RepresentativeHistory | undefined;
  assignRepresentative: (
    apartmentId: string,
    payload: { residentName: string; cccd: string; phone: string; effectiveDate: string; note?: string }
  ) => ActionResult;
  // Residents & Residency Events (US-06, US-07)
  addResident: (payload: Omit<Resident, 'id' | 'createdAt'>) => ActionResult<Resident>;
  updateResident: (id: string, payload: Partial<Omit<Resident, 'id' | 'createdAt'>>) => ActionResult;
  deleteResident: (id: string) => ActionResult;
  addResidencyEvent: (payload: {
    residentId: string;
    type: ResidencyEvent['type'];
    fromDate: string;
    toDate?: string;
    reason: string;
  }) => ActionResult<ResidencyEvent>;
  // Fee Rates & Donations & Billing (US-08, US-09, US-10)
  updateFeeRates: (payload: {
    serviceFeePerM2: number;
    managementFeePerM2: number;
    motorbikeFee: number;
    carFee: number;
    effectiveDate: string;
    decisionNo: string;
    note?: string;
  }) => ActionResult;
  createDonationCampaign: (payload: {
    name: string;
    purpose: string;
    organizer: string;
    startDate: string;
    endDate: string;
  }) => ActionResult<DonationCampaign>;
  toggleDonationCampaignStatus: (id: string) => ActionResult;
  generateMonthlyBilling: (period: string) => ActionResult<{
    createdCount: number;
    skippedCount: number;
    totalAmount: number;
    elapsedMs: number;
  }>;
  // Payment & Receipts (US-11, US-12, US-13)
  recordPayment: (input: PaymentInput) => ActionResult<Receipt>;
  // Vehicles & Utilities v2.0 (US-17, US-18)
  addVehicle: (payload: Omit<Vehicle, 'id' | 'apartmentCode'>) => ActionResult<Vehicle>;
  toggleVehicleStatus: (id: string) => ActionResult;
  deleteVehicle: (id: string) => ActionResult;
  addUtilityBill: (payload: {
    apartmentId: string;
    period: string;
    utilityType: UtilityBill['utilityType'];
    provider: string;
    amount: number;
    note?: string;
  }) => ActionResult<UtilityBill>;
  deleteUtilityBill: (id: string) => ActionResult;
  // Reset seed data
  resetDemoData: () => void;
}

const BlueMoonContext = createContext<BlueMoonContextValue | null>(null);

function loadInitialState(): BlueMoonState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BlueMoonState;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.apartments)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed data
  }
  return createSeedData();
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const BlueMoonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BlueMoonState>(loadInitialState);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    try {
      if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
  }, [currentUserId]);

  const currentUser =
    currentUserId ? state.users.find((u) => u.id === currentUserId) || null : null;

  // If current user gets locked while logged in, keep check explicit on next login
  const login = useCallback(
    (username: string, password: string): ActionResult<User> => {
      const normalized = username.trim().toLowerCase();
      const target = state.users.find((u) => u.username.toLowerCase() === normalized);

      if (!target) {
        return {
          ok: false,
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác',
        };
      }

      if (target.status === 'LOCKED') {
        return {
          ok: false,
          message: `Tài khoản "${target.username}" hiện đang bị khóa${
            target.lockedReason ? ` (${target.lockedReason})` : ''
          }. Vui lòng liên hệ Trưởng Ban Quản trị để mở khóa.`,
        };
      }

      if (target.password !== password) {
        const nextAttempts = target.failedAttempts + 1;
        const shouldLock = nextAttempts >= MAX_FAILED_LOGIN;

        setState((prev) => ({
          ...prev,
          users: prev.users.map((u) =>
            u.id === target.id
              ? {
                  ...u,
                  failedAttempts: nextAttempts,
                  status: shouldLock ? 'LOCKED' : u.status,
                  lockedReason: shouldLock
                    ? 'Tự động khóa sau 5 lần đăng nhập sai liên tiếp'
                    : u.lockedReason,
                }
              : u
          ),
        }));

        if (shouldLock) {
          return {
            ok: false,
            message:
              'Tài khoản đã bị khóa tự động do nhập sai mật khẩu 5 lần liên tiếp. Vui lòng liên hệ Trưởng Ban Quản trị để mở khóa.',
          };
        }

        return {
          ok: false,
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác',
        };
      }

      const now = new Date().toISOString();
      const updatedUser: User = { ...target, failedAttempts: 0, lastLoginAt: now };
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === target.id ? updatedUser : u)),
      }));
      setCurrentUserId(target.id);
      return { ok: true, message: `Chào mừng ${target.fullName}!`, data: updatedUser };
    },
    [state.users]
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
  }, []);

  const demoSwitchRole = useCallback(
    (role: Role) => {
      const match = state.users.find((u) => u.role === role && u.status === 'ACTIVE');
      if (match) {
        setCurrentUserId(match.id);
      }
    },
    [state.users]
  );

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string): ActionResult => {
      if (!currentUser) return { ok: false, message: 'Phiên đăng nhập không hợp lệ.' };
      if (currentUser.password !== currentPassword) {
        return { ok: false, message: 'Mật khẩu hiện tại không chính xác.' };
      }
      const err = validatePassword(newPassword);
      if (err) return { ok: false, message: err };
      if (newPassword === currentPassword) {
        return { ok: false, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' };
      }

      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === currentUser.id ? { ...u, password: newPassword } : u
        ),
      }));
      return {
        ok: true,
        message: 'Đổi mật khẩu thành công. Mật khẩu cũ đã được vô hiệu hóa ngay lập tức.',
      };
    },
    [currentUser]
  );

  const createUser = useCallback(
    (payload: {
      username: string;
      fullName: string;
      password: string;
      role: Role;
      email?: string;
      phone?: string;
    }): ActionResult<User> => {
      if (currentUser?.role !== 'ADMIN') {
        return { ok: false, message: 'Chỉ Trưởng Ban Quản trị mới có quyền tạo tài khoản.' };
      }
      const uname = payload.username.trim().toLowerCase();
      if (!uname || uname.length < 3) {
        return { ok: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
      }
      if (state.users.some((u) => u.username.toLowerCase() === uname)) {
        return { ok: false, message: `Tên đăng nhập "${uname}" đã tồn tại trong hệ thống.` };
      }
      const pwdErr = validatePassword(payload.password);
      if (pwdErr) return { ok: false, message: pwdErr };
      if (!payload.fullName.trim()) {
        return { ok: false, message: 'Vui lòng nhập họ tên cán bộ.' };
      }

      const newUser: User = {
        id: genId('usr'),
        username: uname,
        fullName: payload.fullName.trim(),
        password: payload.password,
        role: payload.role,
        status: 'ACTIVE',
        failedAttempts: 0,
        email: payload.email?.trim() || '',
        phone: payload.phone?.trim() || '',
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, users: [newUser, ...prev.users] }));
      return { ok: true, message: `Đã tạo tài khoản "${newUser.username}" thành công.`, data: newUser };
    },
    [currentUser, state.users]
  );

  const updateUser = useCallback(
    (
      userId: string,
      payload: { fullName: string; role: Role; email?: string; phone?: string }
    ): ActionResult => {
      if (currentUser?.role !== 'ADMIN') {
        return { ok: false, message: 'Chỉ Trưởng Ban Quản trị mới có quyền cập nhật tài khoản.' };
      }
      if (!payload.fullName.trim()) {
        return { ok: false, message: 'Họ tên cán bộ không được để trống.' };
      }
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId
            ? {
                ...u,
                fullName: payload.fullName.trim(),
                role: payload.role,
                email: payload.email?.trim() || '',
                phone: payload.phone?.trim() || '',
              }
            : u
        ),
      }));
      return { ok: true, message: 'Đã cập nhật thông tin tài khoản cán bộ.' };
    },
    [currentUser]
  );

  const toggleUserStatus = useCallback(
    (userId: string, reason?: string): ActionResult => {
      if (currentUser?.role !== 'ADMIN') {
        return { ok: false, message: 'Chỉ Trưởng Ban Quản trị mới có quyền khóa/mở khóa tài khoản.' };
      }
      if (userId === currentUser.id) {
        return { ok: false, message: 'Không thể tự khóa tài khoản đang đăng nhập.' };
      }
      const target = state.users.find((u) => u.id === userId);
      if (!target) return { ok: false, message: 'Không tìm thấy tài khoản.' };
      const nextStatus = target.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: nextStatus,
                failedAttempts: nextStatus === 'ACTIVE' ? 0 : u.failedAttempts,
                lockedReason:
                  nextStatus === 'LOCKED'
                    ? reason || 'Khóa bởi Trưởng Ban Quản trị'
                    : undefined,
              }
            : u
        ),
      }));
      return {
        ok: true,
        message:
          nextStatus === 'LOCKED'
            ? `Đã khóa tài khoản "${target.username}" ngay lập tức.`
            : `Đã kích hoạt mở khóa tài khoản "${target.username}".`,
      };
    },
    [currentUser, state.users]
  );

  const setSelectedPeriod = useCallback((period: string) => {
    setState((prev) => ({ ...prev, selectedPeriod: period }));
  }, []);

  const addApartment = useCallback(
    (payload: Omit<Apartment, 'id' | 'createdAt'>): ActionResult<Apartment> => {
      const code = payload.code.trim().toUpperCase();
      if (!code) return { ok: false, message: 'Vui lòng nhập mã căn hộ.' };
      if (state.apartments.some((a) => a.code.toUpperCase() === code)) {
        return { ok: false, message: `Mã căn hộ "${code}" đã tồn tại trong hệ thống.` };
      }
      const areaErr = validateApartmentArea(payload.area);
      if (areaErr) return { ok: false, message: areaErr };
      if (payload.floor < 1 || payload.floor > 50) {
        return { ok: false, message: 'Số tầng phải từ 1 đến 50.' };
      }

      const apt: Apartment = {
        ...payload,
        code,
        id: genId('apt'),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setState((prev) => ({
        ...prev,
        apartments: [...prev.apartments, apt].sort(
          (a, b) => a.floor - b.floor || a.code.localeCompare(b.code, 'vi')
        ),
      }));
      return { ok: true, message: `Đã thêm căn hộ ${apt.code} thành công.`, data: apt };
    },
    [state.apartments]
  );

  const updateApartment = useCallback(
    (id: string, payload: Partial<Omit<Apartment, 'id' | 'createdAt'>>): ActionResult => {
      const target = state.apartments.find((a) => a.id === id);
      if (!target) return { ok: false, message: 'Không tìm thấy căn hộ.' };
      if (payload.code) {
        const nextCode = payload.code.trim().toUpperCase();
        if (state.apartments.some((a) => a.id !== id && a.code.toUpperCase() === nextCode)) {
          return { ok: false, message: `Mã căn hộ "${nextCode}" đã tồn tại.` };
        }
        payload.code = nextCode;
      }
      if (payload.area !== undefined) {
        const areaErr = validateApartmentArea(payload.area);
        if (areaErr) return { ok: false, message: areaErr };
      }

      // IMPORTANT (US-04 AC5): Updating area NEVER alters existing finalized invoices
      setState((prev) => ({
        ...prev,
        apartments: prev.apartments.map((a) => (a.id === id ? { ...a, ...payload } : a)),
      }));
      return {
        ok: true,
        message:
          'Đã cập nhật hồ sơ căn hộ. Các kỳ phí đã chốt trước đó được giữ nguyên số tiền.',
      };
    },
    [state.apartments]
  );

  const deleteApartment = useCallback(
    (id: string): ActionResult => {
      const hasInvoices = state.invoices.some((inv) => inv.apartmentId === id);
      const hasResidents = state.residents.some((r) => r.apartmentId === id);
      if (hasInvoices || hasResidents) {
        return {
          ok: false,
          message: 'Không thể xóa căn hộ đã phát sinh cư dân hoặc hóa đơn công nợ.',
        };
      }
      setState((prev) => ({
        ...prev,
        apartments: prev.apartments.filter((a) => a.id !== id),
      }));
      return { ok: true, message: 'Đã xóa căn hộ khỏi hệ thống.' };
    },
    [state.invoices, state.residents]
  );

  const getCurrentRepresentative = useCallback(
    (apartmentId: string) => {
      return state.representativeHistories.find(
        (h) => h.apartmentId === apartmentId && !h.endDate
      );
    },
    [state.representativeHistories]
  );

  const assignRepresentative = useCallback(
    (
      apartmentId: string,
      payload: { residentName: string; cccd: string; phone: string; effectiveDate: string; note?: string }
    ): ActionResult => {
      if (!state.apartments.some((a) => a.id === apartmentId)) {
        return { ok: false, message: 'Căn hộ không tồn tại trong hệ thống.' };
      }
      if (!payload.residentName.trim()) {
        return { ok: false, message: 'Vui lòng nhập họ tên người đại diện.' };
      }
      const cccdErr = validateCCCD(payload.cccd);
      if (cccdErr) return { ok: false, message: cccdErr };
      if (!payload.effectiveDate) {
        return { ok: false, message: 'Vui lòng chọn ngày hiệu lực.' };
      }

      const newRep: RepresentativeHistory = {
        id: genId('rep'),
        apartmentId,
        residentName: payload.residentName.trim(),
        cccd: payload.cccd.trim(),
        phone: payload.phone.trim(),
        effectiveDate: payload.effectiveDate,
        note: payload.note?.trim() || 'Cập nhật người đại diện căn hộ',
        updatedBy: currentUser?.fullName || 'Hệ thống',
      };

      // Close previous active representative (keep full history, never delete)
      setState((prev) => ({
        ...prev,
        representativeHistories: [
          ...prev.representativeHistories.map((h) =>
            h.apartmentId === apartmentId && !h.endDate
              ? { ...h, endDate: payload.effectiveDate }
              : h
          ),
          newRep,
        ],
      }));

      return {
        ok: true,
        message: 'Đã cập nhật người đại diện mới và lưu lịch sử thay đổi thành công.',
      };
    },
    [currentUser, state.apartments]
  );

  const addResident = useCallback(
    (payload: Omit<Resident, 'id' | 'createdAt'>): ActionResult<Resident> => {
      if (!state.apartments.some((a) => a.id === payload.apartmentId)) {
        return { ok: false, message: 'Vui lòng chọn căn hộ hợp lệ.' };
      }
      if (!payload.fullName.trim()) {
        return { ok: false, message: 'Vui lòng nhập họ tên nhân khẩu.' };
      }
      const cccdErr = validateCCCD(payload.cccd);
      if (cccdErr) return { ok: false, message: cccdErr };
      if (!payload.dob) return { ok: false, message: 'Vui lòng chọn ngày sinh.' };

      const resident: Resident = {
        ...payload,
        id: genId('res'),
        fullName: payload.fullName.trim(),
        cccd: payload.cccd.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setState((prev) => ({ ...prev, residents: [resident, ...prev.residents] }));
      return { ok: true, message: `Đã thêm nhân khẩu ${resident.fullName}.`, data: resident };
    },
    [state.apartments]
  );

  const updateResident = useCallback(
    (id: string, payload: Partial<Omit<Resident, 'id' | 'createdAt'>>): ActionResult => {
      if (payload.cccd !== undefined) {
        const cccdErr = validateCCCD(payload.cccd);
        if (cccdErr) return { ok: false, message: cccdErr };
      }
      setState((prev) => ({
        ...prev,
        residents: prev.residents.map((r) => (r.id === id ? { ...r, ...payload } : r)),
      }));
      return { ok: true, message: 'Đã cập nhật thông tin nhân khẩu.' };
    },
    []
  );

  const deleteResident = useCallback((id: string): ActionResult => {
    setState((prev) => ({
      ...prev,
      residents: prev.residents.filter((r) => r.id !== id),
    }));
    return { ok: true, message: 'Đã xóa hồ sơ nhân khẩu.' };
  }, []);

  const addResidencyEvent = useCallback(
    (payload: {
      residentId: string;
      type: ResidencyEvent['type'];
      fromDate: string;
      toDate?: string;
      reason: string;
    }): ActionResult<ResidencyEvent> => {
      const resident = state.residents.find((r) => r.id === payload.residentId);
      if (!resident) return { ok: false, message: 'Không tìm thấy nhân khẩu.' };
      const apt = state.apartments.find((a) => a.id === resident.apartmentId);
      if (!apt) return { ok: false, message: 'Không tìm thấy căn hộ tương ứng.' };
      const dateErr = validateDateRange(payload.fromDate, payload.toDate);
      if (dateErr) return { ok: false, message: dateErr };
      if (!payload.reason.trim()) return { ok: false, message: 'Vui lòng nhập lý do biến động.' };

      const event: ResidencyEvent = {
        id: genId('evt'),
        residentId: resident.id,
        residentName: resident.fullName,
        apartmentId: apt.id,
        apartmentCode: apt.code,
        type: payload.type,
        fromDate: payload.fromDate,
        toDate: payload.toDate || undefined,
        reason: payload.reason.trim(),
        recordedBy: currentUser?.fullName || 'Cán bộ BQT',
        createdAt: new Date().toISOString(),
      };

      const nextStatus: Resident['residencyStatus'] =
        payload.type === 'Tạm trú'
          ? 'Tạm trú'
          : payload.type === 'Tạm vắng'
            ? 'Tạm vắng'
            : 'Đã chuyển đi';

      setState((prev) => ({
        ...prev,
        residencyEvents: [event, ...prev.residencyEvents],
        residents: prev.residents.map((r) =>
          r.id === resident.id ? { ...r, residencyStatus: nextStatus } : r
        ),
      }));

      return {
        ok: true,
        message: `Đã ghi nhận biến động "${payload.type}" cho cư dân ${resident.fullName}.`,
        data: event,
      };
    },
    [currentUser, state.apartments, state.residents]
  );

  const updateFeeRates = useCallback(
    (payload: {
      serviceFeePerM2: number;
      managementFeePerM2: number;
      motorbikeFee: number;
      carFee: number;
      effectiveDate: string;
      decisionNo: string;
      note?: string;
    }): ActionResult => {
      const svcErr = validateServiceFee(payload.serviceFeePerM2);
      if (svcErr) return { ok: false, message: svcErr };
      const mgtErr = validateManagementFee(payload.managementFeePerM2);
      if (mgtErr) return { ok: false, message: mgtErr };
      if (payload.motorbikeFee < 0 || payload.carFee < 0) {
        return { ok: false, message: 'Đơn giá gửi xe không được là số âm.' };
      }
      if (!payload.effectiveDate) {
        return { ok: false, message: 'Vui lòng chọn ngày áp dụng đơn giá mới.' };
      }

      const now = new Date().toISOString();
      const actor = currentUser?.fullName || 'Kế toán BQT';
      const old = state.feeRate;
      const newHistories: BlueMoonState['feeRateHistories'] = [];

      const pushIfChanged = (category: FeeRateCategory, oldPrice: number, newPrice: number) => {
        if (oldPrice !== newPrice) {
          newHistories.push({
            id: genId('frh'),
            category,
            oldPrice,
            newPrice,
            effectiveDate: payload.effectiveDate,
            decisionNo: payload.decisionNo.trim() || 'QĐ-BQT',
            note: payload.note?.trim(),
            updatedBy: actor,
            updatedAt: now,
          });
        }
      };

      pushIfChanged('Phí dịch vụ chung cư', old.serviceFeePerM2, payload.serviceFeePerM2);
      pushIfChanged('Phí quản lý chung cư', old.managementFeePerM2, payload.managementFeePerM2);
      pushIfChanged('Phí gửi xe máy', old.motorbikeFee, payload.motorbikeFee);
      pushIfChanged('Phí gửi ô tô', old.carFee, payload.carFee);

      if (newHistories.length === 0) {
        return { ok: false, message: 'Không có đơn giá nào thay đổi so với cấu hình hiện tại.' };
      }

      const updatedRate: FeeRate = {
        serviceFeePerM2: payload.serviceFeePerM2,
        managementFeePerM2: payload.managementFeePerM2,
        motorbikeFee: payload.motorbikeFee,
        carFee: payload.carFee,
        effectiveDate: payload.effectiveDate,
        updatedBy: actor,
        updatedAt: now,
      };

      setState((prev) => ({
        ...prev,
        feeRate: updatedRate,
        feeRateHistories: [...newHistories, ...prev.feeRateHistories],
      }));

      return {
        ok: true,
        message:
          'Đã lưu cấu hình đơn giá mới và ghi nhận lịch sử thay đổi. Các kỳ phí đã phát hành giữ nguyên đơn giá cũ.',
      };
    },
    [currentUser, state.feeRate]
  );

  const createDonationCampaign = useCallback(
    (payload: {
      name: string;
      purpose: string;
      organizer: string;
      startDate: string;
      endDate: string;
    }): ActionResult<DonationCampaign> => {
      if (!payload.name.trim()) return { ok: false, message: 'Vui lòng nhập tên đợt đóng góp.' };
      if (!payload.purpose.trim()) return { ok: false, message: 'Vui lòng nhập mục đích vận động.' };
      if (!payload.organizer.trim()) return { ok: false, message: 'Vui lòng nhập đơn vị phát động.' };
      const dateErr = validateDateRange(payload.startDate, payload.endDate);
      if (dateErr) return { ok: false, message: dateErr };

      const campaign: DonationCampaign = {
        id: genId('camp'),
        name: payload.name.trim(),
        purpose: payload.purpose.trim(),
        organizer: payload.organizer.trim(),
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: 'ACTIVE',
        createdBy: currentUser?.fullName || 'Kế toán BQT',
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        donationCampaigns: [campaign, ...prev.donationCampaigns],
      }));
      return {
        ok: true,
        message: `Đã khởi tạo đợt đóng góp tự nguyện "${campaign.name}".`,
        data: campaign,
      };
    },
    [currentUser]
  );

  const toggleDonationCampaignStatus = useCallback((id: string): ActionResult => {
    setState((prev) => ({
      ...prev,
      donationCampaigns: prev.donationCampaigns.map((c) =>
        c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE' } : c
      ),
    }));
    return { ok: true, message: 'Đã cập nhật trạng thái đợt vận động.' };
  }, []);

  // US-10: Auto-generate monthly fee ledger with anti-duplicate check & timing
  const generateMonthlyBilling = useCallback(
    (period: string) => {
      const startPerf = performance.now();
      if (!/^\d{4}-\d{2}$/.test(period)) {
        return { ok: false, message: 'Kỳ thu không đúng định dạng YYYY-MM.' };
      }

      const existingKeys = new Set(
        state.invoices
          .filter((inv) => inv.period === period)
          .map((inv) => `${inv.apartmentId}::${inv.feeType}`)
      );

      const created: FeeInvoice[] = [];
      let skippedCount = 0;
      const now = new Date().toISOString();
      const actor = currentUser?.fullName || 'Kế toán BQT';

      for (const apt of state.apartments) {
        // 1. Service fee
        if (existingKeys.has(`${apt.id}::SERVICE`)) {
          skippedCount++;
        } else {
          const amount = Math.round(apt.area * state.feeRate.serviceFeePerM2);
          created.push({
            id: genId(`inv-${period}-${apt.code}-SVC`),
            apartmentId: apt.id,
            apartmentCode: apt.code,
            period,
            feeType: 'SERVICE',
            title: `Phí dịch vụ chung cư ${period}`,
            quantity: apt.area,
            unitPrice: state.feeRate.serviceFeePerM2,
            unitLabel: 'm²',
            amount,
            paidAmount: 0,
            status: 'UNPAID',
            generatedAt: now,
            generatedBy: actor,
            areaSnapshot: apt.area,
          });
        }

        // 2. Management fee
        if (existingKeys.has(`${apt.id}::MANAGEMENT`)) {
          skippedCount++;
        } else {
          const amount = Math.round(apt.area * state.feeRate.managementFeePerM2);
          created.push({
            id: genId(`inv-${period}-${apt.code}-MGT`),
            apartmentId: apt.id,
            apartmentCode: apt.code,
            period,
            feeType: 'MANAGEMENT',
            title: `Phí quản lý chung cư ${period}`,
            quantity: apt.area,
            unitPrice: state.feeRate.managementFeePerM2,
            unitLabel: 'm²',
            amount,
            paidAmount: 0,
            status: 'UNPAID',
            generatedAt: now,
            generatedBy: actor,
            areaSnapshot: apt.area,
          });
        }

        // 3. Parking fee (v2.0 US-17)
        const activeVehicles = state.vehicles.filter(
          (v) => v.apartmentId === apt.id && v.status === 'ACTIVE'
        );
        if (activeVehicles.length > 0) {
          if (existingKeys.has(`${apt.id}::PARKING`)) {
            skippedCount++;
          } else {
            const moto = activeVehicles.filter((v) => v.type === 'MOTORBIKE').length;
            const car = activeVehicles.filter((v) => v.type === 'CAR').length;
            const parkingAmount =
              moto * state.feeRate.motorbikeFee + car * state.feeRate.carFee;
            const parts: string[] = [];
            if (moto > 0) parts.push(`${moto} xe máy`);
            if (car > 0) parts.push(`${car} ô tô`);
            created.push({
              id: genId(`inv-${period}-${apt.code}-PRK`),
              apartmentId: apt.id,
              apartmentCode: apt.code,
              period,
              feeType: 'PARKING',
              title: `Phí gửi xe ${period} (${parts.join(', ')})`,
              quantity: activeVehicles.length,
              unitPrice: parkingAmount,
              unitLabel: 'gói/tháng',
              amount: parkingAmount,
              paidAmount: 0,
              status: 'UNPAID',
              generatedAt: now,
              generatedBy: actor,
              areaSnapshot: apt.area,
            });
          }
        }
      }

      const elapsedMs = Math.max(1, Math.round(performance.now() - startPerf));

      if (created.length === 0) {
        return {
          ok: false,
          message: `Kỳ ${period} đã được lập bảng kê đầy đủ trước đó (${skippedCount} khoản thu đã tồn tại — hệ thống chặn sinh trùng).`,
          data: { createdCount: 0, skippedCount, totalAmount: 0, elapsedMs },
        };
      }

      const totalAmount = created.reduce((sum, i) => sum + i.amount, 0);
      setState((prev) => ({
        ...prev,
        invoices: [...prev.invoices, ...created],
        selectedPeriod: period,
      }));

      return {
        ok: true,
        message: `Đã lập thành công ${created.length} khoản thu cho kỳ ${period} trong ${elapsedMs}ms${
          skippedCount > 0 ? ` (bỏ qua ${skippedCount} khoản đã tồn tại)` : ''
        }.`,
        data: { createdCount: created.length, skippedCount, totalAmount, elapsedMs },
      };
    },
    [currentUser, state.apartments, state.feeRate, state.invoices, state.vehicles]
  );

  // US-12: Atomic payment recording & receipt creation
  const recordPayment = useCallback(
    (input: PaymentInput): ActionResult<Receipt> => {
      const apt = state.apartments.find((a) => a.id === input.apartmentId);
      if (!apt) return { ok: false, message: 'Không tìm thấy căn hộ.' };
      if (!input.payerName.trim()) {
        return { ok: false, message: 'Vui lòng nhập họ tên người nộp tiền.' };
      }

      const items: ReceiptItem[] = [];
      const invoiceUpdates = new Map<string, number>();
      const utilityUpdates = new Map<string, number>();

      // Validate all invoice payments atomically before mutating anything
      for (const ip of input.invoicePayments) {
        if (ip.amount <= 0) continue;
        const inv = state.invoices.find(
          (i) => i.id === ip.invoiceId && i.apartmentId === apt.id
        );
        if (!inv) {
          return { ok: false, message: 'Giao dịch thất bại: khoản công nợ không tồn tại.' };
        }
        const remaining = inv.amount - inv.paidAmount;
        if (ip.amount > remaining) {
          return {
            ok: false,
            message: `Số tiền nộp cho "${inv.title}" vượt quá dư nợ còn lại (${remaining.toLocaleString('vi-VN')} đ).`,
          };
        }
        invoiceUpdates.set(inv.id, ip.amount);
        const isPartial = ip.amount < remaining;
        items.push({
          id: genId('ri'),
          category: inv.feeType === 'PARKING' ? 'PARKING_FEE' : 'MANDATORY_FEE',
          refId: inv.id,
          description: inv.title + (isPartial ? ' (Nộp một phần)' : ''),
          period: inv.period,
          amount: ip.amount,
        });
      }

      // Validate utility collections (v2.0 US-18)
      for (const up of input.utilityPayments) {
        if (up.amount <= 0) continue;
        const bill = state.utilityBills.find(
          (b) => b.id === up.utilityId && b.apartmentId === apt.id
        );
        if (!bill) {
          return { ok: false, message: 'Giao dịch thất bại: hóa đơn thu hộ không tồn tại.' };
        }
        const remaining = bill.amount - bill.paidAmount;
        if (up.amount > remaining) {
          return {
            ok: false,
            message: `Số tiền thu hộ (${bill.provider}) vượt quá dư nợ còn lại.`,
          };
        }
        utilityUpdates.set(bill.id, up.amount);
        const typeLabel =
          bill.utilityType === 'ELECTRICITY'
            ? 'Tiền điện'
            : bill.utilityType === 'WATER'
              ? 'Tiền nước'
              : 'Internet';
        items.push({
          id: genId('ri'),
          category: 'UTILITY_COLLECTION',
          refId: bill.id,
          description: `Thu hộ ${typeLabel} kỳ ${bill.period} (${bill.provider})`,
          period: bill.period,
          provider: bill.provider,
          amount: up.amount,
        });
      }

      // Validate voluntary donations (US-09)
      for (const don of input.donations) {
        if (don.amount <= 0) continue;
        const camp = state.donationCampaigns.find((c) => c.id === don.campaignId);
        if (!camp) {
          return { ok: false, message: 'Giao dịch thất bại: quỹ vận động không tồn tại.' };
        }
        items.push({
          id: genId('ri'),
          category: 'VOLUNTARY_DONATION',
          refId: camp.id,
          description: `Ủng hộ ${camp.name}`,
          period: state.selectedPeriod,
          amount: don.amount,
        });
      }

      if (items.length === 0) {
        return {
          ok: false,
          message: 'Vui lòng chọn ít nhất một khoản thu hoặc nhập số tiền đóng góp > 0.',
        };
      }

      const totalAmount = items.reduce((s, it) => s + it.amount, 0);
      const now = new Date();
      const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      // Guarantee unique receiptNo
      let seq = state.receipts.length + 1;
      let receiptNo = `PT-${ym}-${String(seq).padStart(4, '0')}`;
      const existingNos = new Set(state.receipts.map((r) => r.receiptNo));
      while (existingNos.has(receiptNo)) {
        seq++;
        receiptNo = `PT-${ym}-${String(seq).padStart(4, '0')}`;
      }

      const newReceipt: Receipt = {
        id: genId('rcpt'),
        receiptNo,
        apartmentId: apt.id,
        apartmentCode: apt.code,
        payerName: input.payerName.trim(),
        paymentMethod: input.paymentMethod,
        paymentDate: now.toISOString(),
        totalAmount,
        items,
        cashierId: currentUser?.id || 'usr-admin',
        cashierName: currentUser?.fullName || 'Kế toán BQT',
        note: input.note?.trim() || '',
        allowPublicDisclosure: input.allowPublicDisclosure ?? true,
      };

      // Atomic state update: update invoices + utilityBills + append receipt together
      setState((prev) => ({
        ...prev,
        invoices: prev.invoices.map((inv) => {
          const paidAdd = invoiceUpdates.get(inv.id);
          if (!paidAdd) return inv;
          const nextPaid = inv.paidAmount + paidAdd;
          const nextStatus = nextPaid >= inv.amount ? 'PAID' : 'PARTIAL';
          return { ...inv, paidAmount: nextPaid, status: nextStatus };
        }),
        utilityBills: prev.utilityBills.map((bill) => {
          const paidAdd = utilityUpdates.get(bill.id);
          if (!paidAdd) return bill;
          const nextPaid = bill.paidAmount + paidAdd;
          const nextStatus = nextPaid >= bill.amount ? 'PAID' : 'PARTIAL';
          return { ...bill, paidAmount: nextPaid, status: nextStatus };
        }),
        receipts: [newReceipt, ...prev.receipts],
      }));

      return {
        ok: true,
        message: `Đã ghi nhận thanh toán và lập phiếu thu ${newReceipt.receiptNo} thành công!`,
        data: newReceipt,
      };
    },
    [
      currentUser,
      state.apartments,
      state.donationCampaigns,
      state.invoices,
      state.receipts,
      state.selectedPeriod,
      state.utilityBills,
    ]
  );

  // Vehicles (v2.0 US-17)
  const addVehicle = useCallback(
    (payload: Omit<Vehicle, 'id' | 'apartmentCode'>): ActionResult<Vehicle> => {
      const apt = state.apartments.find((a) => a.id === payload.apartmentId);
      if (!apt) return { ok: false, message: 'Vui lòng chọn căn hộ hợp lệ.' };
      const plate = payload.licensePlate.trim().toUpperCase();
      if (!plate) return { ok: false, message: 'Vui lòng nhập biển số xe.' };
      if (state.vehicles.some((v) => v.licensePlate.toUpperCase() === plate && v.status === 'ACTIVE')) {
        return { ok: false, message: `Biển số "${plate}" đã được đăng ký đang hoạt động.` };
      }

      const vehicle: Vehicle = {
        ...payload,
        id: genId('veh'),
        apartmentCode: apt.code,
        licensePlate: plate,
      };
      setState((prev) => ({ ...prev, vehicles: [vehicle, ...prev.vehicles] }));
      return {
        ok: true,
        message: `Đã đăng ký ${vehicle.type === 'CAR' ? 'ô tô' : 'xe máy'} ${plate} cho căn hộ ${apt.code}.`,
        data: vehicle,
      };
    },
    [state.apartments, state.vehicles]
  );

  const toggleVehicleStatus = useCallback((id: string): ActionResult => {
    setState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === id ? { ...v, status: v.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : v
      ),
    }));
    return { ok: true, message: 'Đã cập nhật trạng thái gửi xe.' };
  }, []);

  const deleteVehicle = useCallback((id: string): ActionResult => {
    setState((prev) => ({ ...prev, vehicles: prev.vehicles.filter((v) => v.id !== id) }));
    return { ok: true, message: 'Đã xóa phương tiện khỏi danh sách.' };
  }, []);

  // Utility Bills (v2.0 US-18)
  const addUtilityBill = useCallback(
    (payload: {
      apartmentId: string;
      period: string;
      utilityType: UtilityBill['utilityType'];
      provider: string;
      amount: number;
      note?: string;
    }): ActionResult<UtilityBill> => {
      const apt = state.apartments.find((a) => a.id === payload.apartmentId);
      if (!apt) return { ok: false, message: 'Vui lòng chọn căn hộ.' };
      if (!payload.provider.trim()) return { ok: false, message: 'Vui lòng nhập đơn vị cung cấp.' };
      if (payload.amount <= 0) return { ok: false, message: 'Số tiền hóa đơn phải lớn hơn 0.' };

      const bill: UtilityBill = {
        id: genId('utl'),
        apartmentId: apt.id,
        apartmentCode: apt.code,
        period: payload.period,
        utilityType: payload.utilityType,
        provider: payload.provider.trim(),
        amount: Math.round(payload.amount),
        paidAmount: 0,
        status: 'UNPAID',
        note: payload.note?.trim(),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, utilityBills: [bill, ...prev.utilityBills] }));
      return { ok: true, message: `Đã nhập khoản thu hộ cho căn hộ ${apt.code}.`, data: bill };
    },
    [state.apartments]
  );

  const deleteUtilityBill = useCallback(
    (id: string): ActionResult => {
      const bill = state.utilityBills.find((b) => b.id === id);
      if (bill && bill.paidAmount > 0) {
        return { ok: false, message: 'Không thể xóa khoản thu hộ đã phát sinh thanh toán.' };
      }
      setState((prev) => ({
        ...prev,
        utilityBills: prev.utilityBills.filter((b) => b.id !== id),
      }));
      return { ok: true, message: 'Đã xóa khoản thu hộ.' };
    },
    [state.utilityBills]
  );

  const resetDemoData = useCallback(() => {
    const fresh = createSeedData();
    setState(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore
    }
    setCurrentUserId('usr-admin');
  }, []);

  return (
    <BlueMoonContext.Provider
      value={{
        state,
        currentUser,
        login,
        logout,
        demoSwitchRole,
        changePassword,
        createUser,
        updateUser,
        toggleUserStatus,
        setSelectedPeriod,
        addApartment,
        updateApartment,
        deleteApartment,
        getCurrentRepresentative,
        assignRepresentative,
        addResident,
        updateResident,
        deleteResident,
        addResidencyEvent,
        updateFeeRates,
        createDonationCampaign,
        toggleDonationCampaignStatus,
        generateMonthlyBilling,
        recordPayment,
        addVehicle,
        toggleVehicleStatus,
        deleteVehicle,
        addUtilityBill,
        deleteUtilityBill,
        resetDemoData,
      }}
    >
      {children}
    </BlueMoonContext.Provider>
  );
};

export function useBlueMoonStore(): BlueMoonContextValue {
  const ctx = useContext(BlueMoonContext);
  if (!ctx) throw new Error('useBlueMoonStore must be used inside BlueMoonProvider');
  return ctx;
}
