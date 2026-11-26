export type Role = 'ADMIN' | 'ACCOUNTANT' | 'CASHIER' | 'RESIDENT_OFFICER';

export type UserStatus = 'ACTIVE' | 'LOCKED';

export interface User {
  id: string;
  username: string;
  fullName: string;
  password: string;
  role: Role;
  status: UserStatus;
  failedAttempts: number;
  lockedReason?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type ApartmentType = '1PN' | '2PN' | '3PN' | 'Penthouse';

export interface Apartment {
  id: string;
  code: string;
  floor: number;
  area: number; // m2, 30 - 250
  type: ApartmentType;
  status: 'OCCUPIED' | 'VACANT';
  notes?: string;
  createdAt: string;
}

export interface RepresentativeHistory {
  id: string;
  apartmentId: string;
  residentName: string;
  cccd: string;
  phone: string;
  effectiveDate: string; // YYYY-MM-DD
  endDate?: string; // undefined = currently active
  note?: string;
  updatedBy: string;
}

export type Relationship = 'Chủ hộ' | 'Vợ/Chồng' | 'Con' | 'Bố/Mẹ' | 'Khác';
export type ResidencyStatus = 'Thường trú' | 'Tạm trú' | 'Tạm vắng' | 'Đã chuyển đi';

export interface Resident {
  id: string;
  apartmentId: string;
  fullName: string;
  cccd: string; // exactly 12 digits
  dob: string; // YYYY-MM-DD
  gender: 'Nam' | 'Nữ' | 'Khác';
  relationship: Relationship;
  phone?: string;
  occupation?: string;
  residencyStatus: ResidencyStatus;
  createdAt: string;
}

export type ResidencyEventType = 'Tạm trú' | 'Tạm vắng' | 'Thay đổi nơi cư trú';

export interface ResidencyEvent {
  id: string;
  residentId: string;
  residentName: string;
  apartmentId: string;
  apartmentCode: string;
  type: ResidencyEventType;
  fromDate: string;
  toDate?: string;
  reason: string;
  recordedBy: string;
  createdAt: string;
}

export interface FeeRate {
  serviceFeePerM2: number; // 2,500 - 16,500 VND/m2
  managementFeePerM2: number; // >= 7,000 VND/m2
  motorbikeFee: number; // 70,000 VND/month
  carFee: number; // 1,200,000 VND/month
  effectiveDate: string;
  updatedBy: string;
  updatedAt: string;
}

export type FeeRateCategory =
  | 'Phí dịch vụ chung cư'
  | 'Phí quản lý chung cư'
  | 'Phí gửi xe máy'
  | 'Phí gửi ô tô';

export interface FeeRateHistory {
  id: string;
  category: FeeRateCategory;
  oldPrice: number;
  newPrice: number;
  effectiveDate: string;
  decisionNo: string;
  note?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface DonationCampaign {
  id: string;
  name: string;
  purpose: string;
  organizer: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLOSED';
  createdBy: string;
  createdAt: string;
}

export type FeeType = 'SERVICE' | 'MANAGEMENT' | 'PARKING';
export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface FeeInvoice {
  id: string;
  apartmentId: string;
  apartmentCode: string;
  period: string; // YYYY-MM
  feeType: FeeType;
  title: string;
  quantity: number; // area (m2) or vehicle count / breakdown
  unitPrice: number;
  unitLabel: string;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
  generatedAt: string;
  generatedBy: string;
  areaSnapshot: number;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';

export type ReceiptItemCategory =
  | 'MANDATORY_FEE'
  | 'PARKING_FEE'
  | 'UTILITY_COLLECTION'
  | 'VOLUNTARY_DONATION';

export interface ReceiptItem {
  id: string;
  category: ReceiptItemCategory;
  refId?: string; // FeeInvoice id, UtilityBill id, or DonationCampaign id
  description: string;
  period?: string;
  provider?: string;
  amount: number;
}

export interface Receipt {
  id: string;
  receiptNo: string; // unique PT-YYYYMM-XXXX
  apartmentId: string;
  apartmentCode: string;
  payerName: string;
  paymentMethod: PaymentMethod;
  paymentDate: string; // ISO string
  totalAmount: number;
  items: ReceiptItem[];
  cashierId: string;
  cashierName: string;
  note?: string;
  allowPublicDisclosure?: boolean; // for US-15 voluntary donations public board
}

export type VehicleType = 'MOTORBIKE' | 'CAR';

export interface Vehicle {
  id: string;
  apartmentId: string;
  apartmentCode: string;
  type: VehicleType;
  licensePlate: string;
  brandModel?: string;
  ownerName: string;
  registeredDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type UtilityType = 'ELECTRICITY' | 'WATER' | 'INTERNET';

export interface UtilityBill {
  id: string;
  apartmentId: string;
  apartmentCode: string;
  period: string; // YYYY-MM
  utilityType: UtilityType;
  provider: string;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
  note?: string;
  createdAt: string;
}

export type PageKey =
  | 'dashboard'
  | 'apartments'
  | 'residents'
  | 'residency-events'
  | 'fee-config'
  | 'billing'
  | 'collection'
  | 'receipts'
  | 'reports'
  | 'donations-report'
  | 'vehicles'
  | 'utilities'
  | 'users'
  | 'settings';
