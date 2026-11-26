import {
  Apartment,
  DonationCampaign,
  FeeInvoice,
  FeeRate,
  FeeRateHistory,
  Receipt,
  RepresentativeHistory,
  ResidencyEvent,
  Resident,
  User,
  UtilityBill,
  Vehicle,
} from '../types';

export interface BlueMoonState {
  users: User[];
  apartments: Apartment[];
  representativeHistories: RepresentativeHistory[];
  residents: Resident[];
  residencyEvents: ResidencyEvent[];
  feeRate: FeeRate;
  feeRateHistories: FeeRateHistory[];
  donationCampaigns: DonationCampaign[];
  invoices: FeeInvoice[];
  receipts: Receipt[];
  vehicles: Vehicle[];
  utilityBills: UtilityBill[];
  selectedPeriod: string;
}

export function createSeedData(): BlueMoonState {
  const users: User[] = [
    {
      id: 'usr-admin',
      username: 'admin',
      fullName: 'Nguyễn Minh Quân',
      password: 'Password123',
      role: 'ADMIN',
      status: 'ACTIVE',
      failedAttempts: 0,
      email: 'quan.nm@bluemoon.vn',
      phone: '0901234501',
      createdAt: '2025-01-10T08:00:00Z',
      lastLoginAt: '2026-11-26T08:15:00Z',
    },
    {
      id: 'usr-ketoan',
      username: 'ketoan',
      fullName: 'Trần Thị Thu Hương',
      password: 'Password123',
      role: 'ACCOUNTANT',
      status: 'ACTIVE',
      failedAttempts: 0,
      email: 'huong.ttt@bluemoon.vn',
      phone: '0901234502',
      createdAt: '2025-01-15T08:00:00Z',
      lastLoginAt: '2026-11-26T09:00:00Z',
    },
    {
      id: 'usr-thuquy',
      username: 'thuquy',
      fullName: 'Lê Hoàng Nam',
      password: 'Password123',
      role: 'CASHIER',
      status: 'ACTIVE',
      failedAttempts: 0,
      email: 'nam.lh@bluemoon.vn',
      phone: '0901234503',
      createdAt: '2025-03-01T08:00:00Z',
      lastLoginAt: '2026-11-25T16:40:00Z',
    },
    {
      id: 'usr-dancu',
      username: 'dancu',
      fullName: 'Phạm Ngọc Lan',
      password: 'Password123',
      role: 'RESIDENT_OFFICER',
      status: 'ACTIVE',
      failedAttempts: 0,
      email: 'lan.pn@bluemoon.vn',
      phone: '0901234504',
      createdAt: '2025-04-12T08:00:00Z',
      lastLoginAt: '2026-11-25T14:20:00Z',
    },
    {
      id: 'usr-locked',
      username: 'cuong.nv',
      fullName: 'Nguyễn Văn Cường',
      password: 'Password123',
      role: 'CASHIER',
      status: 'LOCKED',
      failedAttempts: 0,
      lockedReason: 'Đã nghỉ việc từ 10/2026',
      email: 'cuong.nv@bluemoon.vn',
      phone: '0901234509',
      createdAt: '2025-02-01T08:00:00Z',
    },
  ];

  const apartments: Apartment[] = [
    { id: 'apt-101', code: 'P101', floor: 1, area: 58, type: '1PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-102', code: 'P102', floor: 1, area: 76, type: '2PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-103', code: 'P103', floor: 1, area: 82, type: '2PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-201', code: 'P201', floor: 2, area: 74, type: '2PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-202', code: 'P202', floor: 2, area: 96, type: '3PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-205', code: 'P205', floor: 2, area: 55, type: '1PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-301', code: 'P301', floor: 3, area: 78, type: '2PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-302', code: 'P302', floor: 3, area: 105, type: '3PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-401', code: 'P401', floor: 4, area: 80, type: '2PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-402', code: 'P402', floor: 4, area: 112, type: '3PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-501', code: 'P501', floor: 5, area: 62, type: '1PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-502', code: 'P502', floor: 5, area: 85, type: '2PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-601', code: 'P601', floor: 6, area: 98, type: '3PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-801', code: 'P801', floor: 8, area: 84, type: '2PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-802', code: 'P802', floor: 8, area: 118, type: '3PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-1001', code: 'P1001', floor: 10, area: 92, type: '3PN', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-1201', code: 'P1201', floor: 12, area: 165, type: 'Penthouse', status: 'OCCUPIED', createdAt: '2024-06-01' },
    { id: 'apt-1205', code: 'P1205', floor: 12, area: 195, type: 'Penthouse', status: 'OCCUPIED', createdAt: '2024-06-01' },
  ];

  const owners: Array<{ aptId: string; name: string; cccd: string; phone: string; dob: string; gender: 'Nam' | 'Nữ' }> = [
    { aptId: 'apt-101', name: 'Nguyễn Văn An', cccd: '001085012341', phone: '0912345601', dob: '1985-04-12', gender: 'Nam' },
    { aptId: 'apt-102', name: 'Trần Thị Bích Ngọc', cccd: '001188023452', phone: '0912345602', dob: '1988-09-21', gender: 'Nữ' },
    { aptId: 'apt-103', name: 'Lê Đức Mạnh', cccd: '001082034563', phone: '0912345603', dob: '1982-11-05', gender: 'Nam' },
    { aptId: 'apt-201', name: 'Phạm Quốc Huy', cccd: '001090045674', phone: '0912345604', dob: '1990-02-18', gender: 'Nam' },
    { aptId: 'apt-202', name: 'Hoàng Thị Minh Châu', cccd: '001184056785', phone: '0912345605', dob: '1984-07-30', gender: 'Nữ' },
    { aptId: 'apt-205', name: 'Đỗ Thanh Tùng', cccd: '001093067896', phone: '0912345606', dob: '1993-01-14', gender: 'Nam' },
    { aptId: 'apt-301', name: 'Vũ Thị Mai Phương', cccd: '001187078907', phone: '0912345607', dob: '1987-06-08', gender: 'Nữ' },
    { aptId: 'apt-302', name: 'Bùi Quang Vinh', cccd: '001079089018', phone: '0912345608', dob: '1979-12-25', gender: 'Nam' },
    { aptId: 'apt-401', name: 'Đặng Xuân Trường', cccd: '001086090129', phone: '0912345609', dob: '1986-03-19', gender: 'Nam' },
    { aptId: 'apt-402', name: 'Ngô Thị Hồng Hạnh', cccd: '001181101230', phone: '0912345610', dob: '1981-08-11', gender: 'Nữ' },
    { aptId: 'apt-501', name: 'Dương Minh Đức', cccd: '001094112341', phone: '0912345611', dob: '1994-10-03', gender: 'Nam' },
    { aptId: 'apt-502', name: 'Lý Thị Thanh Hà', cccd: '001189123452', phone: '0912345612', dob: '1989-05-27', gender: 'Nữ' },
    { aptId: 'apt-601', name: 'Trịnh Văn Kiên', cccd: '001080134563', phone: '0912345613', dob: '1980-09-15', gender: 'Nam' },
    { aptId: 'apt-801', name: 'Mai Tuấn Anh', cccd: '001091145674', phone: '0912345614', dob: '1991-04-02', gender: 'Nam' },
    { aptId: 'apt-802', name: 'Cao Thị Thu Trang', cccd: '001183156785', phone: '0912345615', dob: '1983-11-22', gender: 'Nữ' },
    { aptId: 'apt-1001', name: 'Phan Đình Tùng', cccd: '001078167896', phone: '0912345616', dob: '1978-06-17', gender: 'Nam' },
    { aptId: 'apt-1201', name: 'Nguyễn Hữu Thắng', cccd: '001075178907', phone: '0912345617', dob: '1975-03-09', gender: 'Nam' },
    { aptId: 'apt-1205', name: 'Võ Thị Kim Oanh', cccd: '001177189018', phone: '0912345618', dob: '1977-12-01', gender: 'Nữ' },
  ];

  const representativeHistories: RepresentativeHistory[] = [
    // Historical previous representative for P101 & P302 to showcase US-05 timeline
    {
      id: 'rep-hist-old-1',
      apartmentId: 'apt-101',
      residentName: 'Nguyễn Văn Hùng',
      cccd: '001060000111',
      phone: '0903111222',
      effectiveDate: '2024-06-01',
      endDate: '2025-08-31',
      note: 'Chủ sở hữu ban đầu, đã chuyển nhượng cho con trai',
      updatedBy: 'Phạm Ngọc Lan',
    },
    {
      id: 'rep-hist-old-2',
      apartmentId: 'apt-302',
      residentName: 'Lê Thị Phương Thảo',
      cccd: '001182000333',
      phone: '0903444555',
      effectiveDate: '2024-06-15',
      endDate: '2026-01-14',
      note: 'Hết hạn hợp đồng ủy quyền đại diện căn hộ',
      updatedBy: 'Phạm Ngọc Lan',
    },
    ...owners.map((o, idx) => ({
      id: `rep-${idx + 1}`,
      apartmentId: o.aptId,
      residentName: o.name,
      cccd: o.cccd,
      phone: o.phone,
      effectiveDate:
        o.aptId === 'apt-101' ? '2025-09-01' : o.aptId === 'apt-302' ? '2026-01-15' : '2024-06-15',
      note: 'Người đại diện căn hộ hiện tại',
      updatedBy: 'Phạm Ngọc Lan',
    })),
  ];

  const residents: Resident[] = [
    ...owners.map((o, idx) => ({
      id: `res-owner-${idx + 1}`,
      apartmentId: o.aptId,
      fullName: o.name,
      cccd: o.cccd,
      dob: o.dob,
      gender: o.gender,
      relationship: 'Chủ hộ' as const,
      phone: o.phone,
      occupation: idx % 3 === 0 ? 'Kỹ sư CNTT' : idx % 3 === 1 ? 'Kinh doanh' : 'Giảng viên / Bác sĩ',
      residencyStatus: 'Thường trú' as const,
      createdAt: '2024-06-15',
    })),
    // Family members across apartments
    {
      id: 'res-fam-1',
      apartmentId: 'apt-101',
      fullName: 'Lê Thị Thu Thảo',
      cccd: '001188099101',
      dob: '1988-05-14',
      gender: 'Nữ',
      relationship: 'Vợ/Chồng',
      phone: '0912000101',
      occupation: 'Kế toán viên',
      residencyStatus: 'Thường trú',
      createdAt: '2025-09-01',
    },
    {
      id: 'res-fam-2',
      apartmentId: 'apt-102',
      fullName: 'Phạm Minh Tuấn',
      cccd: '001086099102',
      dob: '1986-03-22',
      gender: 'Nam',
      relationship: 'Vợ/Chồng',
      phone: '0912000102',
      occupation: 'Kiến trúc sư',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-3',
      apartmentId: 'apt-102',
      fullName: 'Phạm Gia Bảo',
      cccd: '001215099103',
      dob: '2015-08-10',
      gender: 'Nam',
      relationship: 'Con',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-4',
      apartmentId: 'apt-103',
      fullName: 'Nguyễn Thị Kim Anh',
      cccd: '001185099104',
      dob: '1985-10-19',
      gender: 'Nữ',
      relationship: 'Vợ/Chồng',
      phone: '0912000104',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-5',
      apartmentId: 'apt-201',
      fullName: 'Trần Ngọc Diệp',
      cccd: '001192099105',
      dob: '1992-07-04',
      gender: 'Nữ',
      relationship: 'Vợ/Chồng',
      phone: '0912000105',
      residencyStatus: 'Tạm vắng',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-6',
      apartmentId: 'apt-202',
      fullName: 'Nguyễn Thanh Hải',
      cccd: '001082099106',
      dob: '1982-01-12',
      gender: 'Nam',
      relationship: 'Vợ/Chồng',
      phone: '0912000106',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-7',
      apartmentId: 'apt-202',
      fullName: 'Nguyễn Hoàng Minh Anh',
      cccd: '001312099107',
      dob: '2012-11-28',
      gender: 'Nữ',
      relationship: 'Con',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-8',
      apartmentId: 'apt-205',
      fullName: 'Đỗ Khánh Linh',
      cccd: '001199099108',
      dob: '1999-09-09',
      gender: 'Nữ',
      relationship: 'Khác',
      phone: '0912000108',
      occupation: 'Sinh viên cao học',
      residencyStatus: 'Tạm trú',
      createdAt: '2026-09-01',
    },
    {
      id: 'res-fam-9',
      apartmentId: 'apt-301',
      fullName: 'Lê Trọng Nghĩa',
      cccd: '001085099109',
      dob: '1985-04-30',
      gender: 'Nam',
      relationship: 'Vợ/Chồng',
      phone: '0912000109',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-10',
      apartmentId: 'apt-302',
      fullName: 'Nguyễn Thị Lan Hương',
      cccd: '001181099110',
      dob: '1981-02-20',
      gender: 'Nữ',
      relationship: 'Vợ/Chồng',
      phone: '0912000110',
      residencyStatus: 'Thường trú',
      createdAt: '2026-01-15',
    },
    {
      id: 'res-fam-11',
      apartmentId: 'apt-302',
      fullName: 'Bùi Minh Khôi',
      cccd: '001210099111',
      dob: '2010-06-15',
      gender: 'Nam',
      relationship: 'Con',
      residencyStatus: 'Thường trú',
      createdAt: '2026-01-15',
    },
    {
      id: 'res-fam-12',
      apartmentId: 'apt-402',
      fullName: 'Ngô Văn Hòa',
      cccd: '001055099112',
      dob: '1955-03-11',
      gender: 'Nam',
      relationship: 'Bố/Mẹ',
      residencyStatus: 'Thường trú',
      createdAt: '2024-07-01',
    },
    {
      id: 'res-fam-13',
      apartmentId: 'apt-601',
      fullName: 'Phạm Thị Yến',
      cccd: '001183099113',
      dob: '1983-08-25',
      gender: 'Nữ',
      relationship: 'Vợ/Chồng',
      phone: '0912000113',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-14',
      apartmentId: 'apt-802',
      fullName: 'Trần Quốc Bảo',
      cccd: '001081099114',
      dob: '1981-05-03',
      gender: 'Nam',
      relationship: 'Vợ/Chồng',
      phone: '0912000114',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-15',
      apartmentId: 'apt-1201',
      fullName: 'Đào Thị Phương Anh',
      cccd: '001178099115',
      dob: '1978-11-12',
      gender: 'Nữ',
      relationship: 'Vợ/Chồng',
      phone: '0912000115',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
    {
      id: 'res-fam-16',
      apartmentId: 'apt-1205',
      fullName: 'Trương Hoàng Long',
      cccd: '001074099116',
      dob: '1974-09-18',
      gender: 'Nam',
      relationship: 'Vợ/Chồng',
      phone: '0912000116',
      residencyStatus: 'Thường trú',
      createdAt: '2024-06-15',
    },
  ];

  const residencyEvents: ResidencyEvent[] = [
    {
      id: 'evt-1',
      residentId: 'res-fam-8',
      residentName: 'Đỗ Khánh Linh',
      apartmentId: 'apt-205',
      apartmentCode: 'P205',
      type: 'Tạm trú',
      fromDate: '2026-09-01',
      toDate: '2027-06-30',
      reason: 'Em gái chủ hộ đến ở học cao học tại ĐHBK Hà Nội',
      recordedBy: 'Phạm Ngọc Lan',
      createdAt: '2026-09-01T09:30:00Z',
    },
    {
      id: 'evt-2',
      residentId: 'res-fam-5',
      residentName: 'Trần Ngọc Diệp',
      apartmentId: 'apt-201',
      apartmentCode: 'P201',
      type: 'Tạm vắng',
      fromDate: '2026-10-15',
      toDate: '2026-12-20',
      reason: 'Đi công tác dài hạn tại TP. Hồ Chí Minh',
      recordedBy: 'Phạm Ngọc Lan',
      createdAt: '2026-10-14T14:15:00Z',
    },
    {
      id: 'evt-3',
      residentId: 'res-owner-1',
      residentName: 'Nguyễn Văn An',
      apartmentId: 'apt-101',
      apartmentCode: 'P101',
      type: 'Thay đổi nơi cư trú',
      fromDate: '2025-09-01',
      reason: 'Chuyển khẩu thường trú về căn hộ P101 sau khi nhận chuyển nhượng',
      recordedBy: 'Nguyễn Minh Quân',
      createdAt: '2025-09-02T10:00:00Z',
    },
    {
      id: 'evt-4',
      residentId: 'res-fam-12',
      residentName: 'Ngô Văn Hòa',
      apartmentId: 'apt-402',
      apartmentCode: 'P402',
      type: 'Tạm trú',
      fromDate: '2026-11-01',
      toDate: '2027-02-28',
      reason: 'Bố chủ hộ từ quê lên ở chăm cháu mùa đông',
      recordedBy: 'Phạm Ngọc Lan',
      createdAt: '2026-11-02T08:45:00Z',
    },
  ];

  const feeRate: FeeRate = {
    serviceFeePerM2: 6500,
    managementFeePerM2: 8000,
    motorbikeFee: 70000,
    carFee: 1200000,
    effectiveDate: '2026-01-01',
    updatedBy: 'Trần Thị Thu Hương',
    updatedAt: '2025-12-20T10:00:00Z',
  };

  const feeRateHistories: FeeRateHistory[] = [
    {
      id: 'frh-1',
      category: 'Phí dịch vụ chung cư',
      oldPrice: 5500,
      newPrice: 6500,
      effectiveDate: '2026-01-01',
      decisionNo: 'QĐ-12/2025/BQT-BM',
      note: 'Điều chỉnh theo Nghị quyết Hội nghị Nhà chung cư cuối năm 2025',
      updatedBy: 'Trần Thị Thu Hương',
      updatedAt: '2025-12-20T10:00:00Z',
    },
    {
      id: 'frh-2',
      category: 'Phí quản lý chung cư',
      oldPrice: 7000,
      newPrice: 8000,
      effectiveDate: '2026-01-01',
      decisionNo: 'QĐ-12/2025/BQT-BM',
      note: 'Nâng cấp dịch vụ an ninh 24/7 và bảo trì thang máy',
      updatedBy: 'Trần Thị Thu Hương',
      updatedAt: '2025-12-20T10:00:00Z',
    },
  ];

  const donationCampaigns: DonationCampaign[] = [
    {
      id: 'camp-1',
      name: 'Quỹ Vì người nghèo năm 2026',
      purpose: 'Hỗ trợ hộ nghèo, gia đình khó khăn dịp cuối năm tại địa bàn phường',
      organizer: 'Ủy ban MTTQ Phường & BQT BlueMoon',
      startDate: '2026-10-01',
      endDate: '2026-12-15',
      status: 'ACTIVE',
      createdBy: 'Trần Thị Thu Hương',
      createdAt: '2026-09-28T08:00:00Z',
    },
    {
      id: 'camp-2',
      name: 'Quỹ Vì biển đảo Việt Nam',
      purpose: 'Đóng góp ủng hộ cán bộ, chiến sĩ và nhân dân quần đảo Trường Sa',
      organizer: 'BQT Chung cư BlueMoon',
      startDate: '2026-09-15',
      endDate: '2026-11-30',
      status: 'ACTIVE',
      createdBy: 'Trần Thị Thu Hương',
      createdAt: '2026-09-10T09:00:00Z',
    },
    {
      id: 'camp-3',
      name: 'Quỹ Khuyến học & Tết Trung thu 2026',
      purpose: 'Tặng quà học sinh giỏi và tổ chức đêm hội Trung thu cho thiếu nhi tòa nhà',
      organizer: 'Ban đại diện cư dân BlueMoon',
      startDate: '2026-08-15',
      endDate: '2026-09-30',
      status: 'CLOSED',
      createdBy: 'Nguyễn Minh Quân',
      createdAt: '2026-08-10T10:00:00Z',
    },
  ];

  const vehicles: Vehicle[] = [
    { id: 'veh-1', apartmentId: 'apt-101', apartmentCode: 'P101', type: 'MOTORBIKE', licensePlate: '29B1-452.18', brandModel: 'Honda AirBlade', ownerName: 'Nguyễn Văn An', registeredDate: '2025-09-05', status: 'ACTIVE' },
    { id: 'veh-2', apartmentId: 'apt-101', apartmentCode: 'P101', type: 'MOTORBIKE', licensePlate: '29B1-889.22', brandModel: 'Honda Vision', ownerName: 'Lê Thị Thu Thảo', registeredDate: '2025-09-05', status: 'ACTIVE' },
    { id: 'veh-3', apartmentId: 'apt-102', apartmentCode: 'P102', type: 'CAR', licensePlate: '30G-512.88', brandModel: 'Mazda CX-5', ownerName: 'Trần Thị Bích Ngọc', registeredDate: '2024-07-01', status: 'ACTIVE' },
    { id: 'veh-4', apartmentId: 'apt-102', apartmentCode: 'P102', type: 'MOTORBIKE', licensePlate: '29D2-120.45', brandModel: 'Honda SH Mode', ownerName: 'Phạm Minh Tuấn', registeredDate: '2024-07-01', status: 'ACTIVE' },
    { id: 'veh-5', apartmentId: 'apt-103', apartmentCode: 'P103', type: 'MOTORBIKE', licensePlate: '29E1-334.11', brandModel: 'Honda Lead', ownerName: 'Lê Đức Mạnh', registeredDate: '2024-06-20', status: 'ACTIVE' },
    { id: 'veh-6', apartmentId: 'apt-201', apartmentCode: 'P201', type: 'CAR', licensePlate: '30H-778.19', brandModel: 'Toyota Corolla Cross', ownerName: 'Phạm Quốc Huy', registeredDate: '2024-08-10', status: 'ACTIVE' },
    { id: 'veh-7', apartmentId: 'apt-202', apartmentCode: 'P202', type: 'CAR', licensePlate: '30K-104.55', brandModel: 'Hyundai Tucson', ownerName: 'Hoàng Thị Minh Châu', registeredDate: '2024-06-25', status: 'ACTIVE' },
    { id: 'veh-8', apartmentId: 'apt-202', apartmentCode: 'P202', type: 'MOTORBIKE', licensePlate: '29C1-765.09', brandModel: 'Vespa Primavera', ownerName: 'Hoàng Thị Minh Châu', registeredDate: '2024-06-25', status: 'ACTIVE' },
    { id: 'veh-9', apartmentId: 'apt-205', apartmentCode: 'P205', type: 'MOTORBIKE', licensePlate: '29F1-902.31', brandModel: 'Yamaha Exciter', ownerName: 'Đỗ Thanh Tùng', registeredDate: '2024-07-12', status: 'ACTIVE' },
    { id: 'veh-10', apartmentId: 'apt-301', apartmentCode: 'P301', type: 'MOTORBIKE', licensePlate: '29H1-612.84', brandModel: 'Honda SH 150i', ownerName: 'Vũ Thị Mai Phương', registeredDate: '2024-06-28', status: 'ACTIVE' },
    { id: 'veh-11', apartmentId: 'apt-302', apartmentCode: 'P302', type: 'CAR', licensePlate: '30E-992.40', brandModel: 'VinFast VF8', ownerName: 'Bùi Quang Vinh', registeredDate: '2026-01-20', status: 'ACTIVE' },
    { id: 'veh-12', apartmentId: 'apt-302', apartmentCode: 'P302', type: 'MOTORBIKE', licensePlate: '29P1-443.10', brandModel: 'VinFast Klara S', ownerName: 'Nguyễn Thị Lan Hương', registeredDate: '2026-01-20', status: 'ACTIVE' },
    { id: 'veh-13', apartmentId: 'apt-401', apartmentCode: 'P401', type: 'MOTORBIKE', licensePlate: '29L1-551.72', brandModel: 'Honda Winner X', ownerName: 'Đặng Xuân Trường', registeredDate: '2024-07-15', status: 'ACTIVE' },
    { id: 'veh-14', apartmentId: 'apt-402', apartmentCode: 'P402', type: 'CAR', licensePlate: '30F-321.66', brandModel: 'Honda CR-V', ownerName: 'Ngô Thị Hồng Hạnh', registeredDate: '2024-06-18', status: 'ACTIVE' },
    { id: 'veh-15', apartmentId: 'apt-501', apartmentCode: 'P501', type: 'MOTORBIKE', licensePlate: '29M1-208.64', brandModel: 'Honda Vision', ownerName: 'Dương Minh Đức', registeredDate: '2024-08-01', status: 'ACTIVE' },
    { id: 'veh-16', apartmentId: 'apt-502', apartmentCode: 'P502', type: 'MOTORBIKE', licensePlate: '29N1-776.29', brandModel: 'Honda Lead', ownerName: 'Lý Thị Thanh Hà', registeredDate: '2024-07-20', status: 'ACTIVE' },
    { id: 'veh-17', apartmentId: 'apt-601', apartmentCode: 'P601', type: 'CAR', licensePlate: '30K-819.05', brandModel: 'Kia Carnival', ownerName: 'Trịnh Văn Kiên', registeredDate: '2024-06-22', status: 'ACTIVE' },
    { id: 'veh-18', apartmentId: 'apt-801', apartmentCode: 'P801', type: 'MOTORBIKE', licensePlate: '29S1-345.90', brandModel: 'Yamaha Grande', ownerName: 'Mai Tuấn Anh', registeredDate: '2024-09-01', status: 'ACTIVE' },
    { id: 'veh-19', apartmentId: 'apt-802', apartmentCode: 'P802', type: 'CAR', licensePlate: '30H-441.23', brandModel: 'Mercedes GLC 200', ownerName: 'Cao Thị Thu Trang', registeredDate: '2024-06-19', status: 'ACTIVE' },
    { id: 'veh-20', apartmentId: 'apt-1001', apartmentCode: 'P1001', type: 'CAR', licensePlate: '30G-663.12', brandModel: 'Ford Everest', ownerName: 'Phan Đình Tùng', registeredDate: '2024-06-30', status: 'ACTIVE' },
    { id: 'veh-21', apartmentId: 'apt-1201', apartmentCode: 'P1201', type: 'CAR', licensePlate: '30K-999.01', brandModel: 'Lexus RX350', ownerName: 'Nguyễn Hữu Thắng', registeredDate: '2024-06-15', status: 'ACTIVE' },
    { id: 'veh-22', apartmentId: 'apt-1201', apartmentCode: 'P1201', type: 'CAR', licensePlate: '30H-224.88', brandModel: 'VinFast VF9', ownerName: 'Đào Thị Phương Anh', registeredDate: '2025-02-10', status: 'ACTIVE' },
    { id: 'veh-23', apartmentId: 'apt-1205', apartmentCode: 'P1205', type: 'CAR', licensePlate: '30K-888.68', brandModel: 'BMW X5', ownerName: 'Võ Thị Kim Oanh', registeredDate: '2024-06-15', status: 'ACTIVE' },
  ];

  // Generate invoices for 2026-09, 2026-10, 2026-11
  const periods = ['2026-09', '2026-10', '2026-11'];
  const invoices: FeeInvoice[] = [];
  const receipts: Receipt[] = [];
  let receiptSeq = 1;

  const ownerMap = new Map(owners.map((o) => [o.aptId, o.name]));

  for (const period of periods) {
    apartments.forEach((apt, idx) => {
      const aptVehicles = vehicles.filter((v) => v.apartmentId === apt.id && v.status === 'ACTIVE');
      const motoCount = aptVehicles.filter((v) => v.type === 'MOTORBIKE').length;
      const carCount = aptVehicles.filter((v) => v.type === 'CAR').length;
      const parkingTotal = motoCount * feeRate.motorbikeFee + carCount * feeRate.carFee;

      const serviceAmt = apt.area * feeRate.serviceFeePerM2;
      const mgmtAmt = apt.area * feeRate.managementFeePerM2;

      // Determine payment status pattern realistically:
      // 2026-09: almost all paid except 2 apartments (idx 5, 11) unpaid
      // 2026-10: most paid, 3 unpaid (idx 3, 8, 14), 1 partial (idx 5)
      // 2026-11 (current): 10 paid, 3 partial (idx 2, 7, 13), 5 unpaid (idx 3, 5, 8, 11, 14)
      let payMode: 'PAID' | 'PARTIAL' | 'UNPAID' = 'PAID';
      if (period === '2026-09') {
        if (idx === 5 || idx === 11) payMode = 'UNPAID';
      } else if (period === '2026-10') {
        if (idx === 3 || idx === 8 || idx === 14) payMode = 'UNPAID';
        else if (idx === 5) payMode = 'PARTIAL';
      } else if (period === '2026-11') {
        if ([3, 5, 8, 11, 14].includes(idx)) payMode = 'UNPAID';
        else if ([2, 7, 13].includes(idx)) payMode = 'PARTIAL';
      }

      const svcId = `inv-${period}-${apt.code}-SVC`;
      const mgtId = `inv-${period}-${apt.code}-MGT`;
      const prkId = `inv-${period}-${apt.code}-PRK`;

      const svcPaid = payMode === 'PAID' ? serviceAmt : payMode === 'PARTIAL' ? serviceAmt : 0;
      const mgtPaid = payMode === 'PAID' ? mgmtAmt : payMode === 'PARTIAL' ? Math.round(mgmtAmt * 0.4) : 0;
      const prkPaid = payMode === 'PAID' ? parkingTotal : 0;

      const svcInv: FeeInvoice = {
        id: svcId,
        apartmentId: apt.id,
        apartmentCode: apt.code,
        period,
        feeType: 'SERVICE',
        title: `Phí dịch vụ chung cư ${period}`,
        quantity: apt.area,
        unitPrice: feeRate.serviceFeePerM2,
        unitLabel: 'm²',
        amount: serviceAmt,
        paidAmount: svcPaid,
        status: svcPaid >= serviceAmt ? 'PAID' : svcPaid > 0 ? 'PARTIAL' : 'UNPAID',
        generatedAt: `${period}-01T07:00:00Z`,
        generatedBy: 'Trần Thị Thu Hương',
        areaSnapshot: apt.area,
      };

      const mgtInv: FeeInvoice = {
        id: mgtId,
        apartmentId: apt.id,
        apartmentCode: apt.code,
        period,
        feeType: 'MANAGEMENT',
        title: `Phí quản lý chung cư ${period}`,
        quantity: apt.area,
        unitPrice: feeRate.managementFeePerM2,
        unitLabel: 'm²',
        amount: mgmtAmt,
        paidAmount: mgtPaid,
        status: mgtPaid >= mgmtAmt ? 'PAID' : mgtPaid > 0 ? 'PARTIAL' : 'UNPAID',
        generatedAt: `${period}-01T07:00:00Z`,
        generatedBy: 'Trần Thị Thu Hương',
        areaSnapshot: apt.area,
      };

      invoices.push(svcInv, mgtInv);

      let prkInv: FeeInvoice | null = null;
      if (parkingTotal > 0) {
        const descParts: string[] = [];
        if (motoCount > 0) descParts.push(`${motoCount} xe máy`);
        if (carCount > 0) descParts.push(`${carCount} ô tô`);
        prkInv = {
          id: prkId,
          apartmentId: apt.id,
          apartmentCode: apt.code,
          period,
          feeType: 'PARKING',
          title: `Phí gửi xe ${period} (${descParts.join(', ')})`,
          quantity: motoCount + carCount,
          unitPrice: parkingTotal,
          unitLabel: 'gói/tháng',
          amount: parkingTotal,
          paidAmount: prkPaid,
          status: prkPaid >= parkingTotal ? 'PAID' : prkPaid > 0 ? 'PARTIAL' : 'UNPAID',
          generatedAt: `${period}-01T07:00:00Z`,
          generatedBy: 'Trần Thị Thu Hương',
          areaSnapshot: apt.area,
        };
        invoices.push(prkInv);
      }

      if (payMode === 'PAID' || payMode === 'PARTIAL') {
        const items: Receipt['items'] = [];
        if (svcPaid > 0) {
          items.push({
            id: `ri-${svcId}`,
            category: 'MANDATORY_FEE',
            refId: svcId,
            description: svcInv.title,
            period,
            amount: svcPaid,
          });
        }
        if (mgtPaid > 0) {
          items.push({
            id: `ri-${mgtId}`,
            category: 'MANDATORY_FEE',
            refId: mgtId,
            description: mgtInv.title + (payMode === 'PARTIAL' ? ' (Nộp một phần)' : ''),
            period,
            amount: mgtPaid,
          });
        }
        if (prkInv && prkPaid > 0) {
          items.push({
            id: `ri-${prkId}`,
            category: 'PARKING_FEE',
            refId: prkId,
            description: prkInv.title,
            period,
            amount: prkPaid,
          });
        }

        // Add voluntary donations on selected receipts
        let allowPublic = true;
        if (period === '2026-11' && [0, 1, 4, 6, 9, 12, 16, 17].includes(idx)) {
          const donationAmt = idx >= 16 ? 1000000 : idx % 2 === 0 ? 500000 : 300000;
          items.push({
            id: `ri-don1-${period}-${apt.code}`,
            category: 'VOLUNTARY_DONATION',
            refId: 'camp-1',
            description: 'Ủng hộ Quỹ Vì người nghèo năm 2026',
            period,
            amount: donationAmt,
          });
          if (idx === 9) allowPublic = false; // showcase privacy consent on US-15
        }
        if (period === '2026-10' && [0, 2, 6, 10, 15, 16].includes(idx)) {
          const donationAmt = idx >= 15 ? 500000 : 200000;
          items.push({
            id: `ri-don2-${period}-${apt.code}`,
            category: 'VOLUNTARY_DONATION',
            refId: 'camp-2',
            description: 'Ủng hộ Quỹ Vì biển đảo Việt Nam',
            period,
            amount: donationAmt,
          });
        }
        if (period === '2026-09' && [1, 4, 7, 12, 16, 17].includes(idx)) {
          items.push({
            id: `ri-don3-${period}-${apt.code}`,
            category: 'VOLUNTARY_DONATION',
            refId: 'camp-3',
            description: 'Ủng hộ Quỹ Khuyến học & Tết Trung thu 2026',
            period,
            amount: 200000,
          });
        }

        const totalAmount = items.reduce((sum, it) => sum + it.amount, 0);
        const day = String(Math.min(25, 4 + (idx % 18))).padStart(2, '0');
        const periodCompact = period.replace('-', '');
        receipts.push({
          id: `rcpt-${receiptSeq}`,
          receiptNo: `PT-${periodCompact}-${String(receiptSeq).padStart(4, '0')}`,
          apartmentId: apt.id,
          apartmentCode: apt.code,
          payerName: ownerMap.get(apt.id) || 'Cư dân',
          paymentMethod: idx % 3 === 0 ? 'CASH' : 'BANK_TRANSFER',
          paymentDate: `${period}-${day}T09:${String((idx * 7) % 60).padStart(2, '0')}:00Z`,
          totalAmount,
          items,
          cashierId: idx % 2 === 0 ? 'usr-ketoan' : 'usr-thuquy',
          cashierName: idx % 2 === 0 ? 'Trần Thị Thu Hương' : 'Lê Hoàng Nam',
          note: payMode === 'PARTIAL' ? 'Cư dân thanh toán trước một phần, hẹn đóng nốt cuối tháng' : '',
          allowPublicDisclosure: allowPublic,
        });
        receiptSeq++;
      }
    });
  }

  // Utility bills (v2.0 US-18) for 2026-11
  const utilityBills: UtilityBill[] = [
    { id: 'utl-1', apartmentId: 'apt-201', apartmentCode: 'P201', period: '2026-11', utilityType: 'ELECTRICITY', provider: 'EVN Hà Nội', amount: 1185000, paidAmount: 0, status: 'UNPAID', note: 'Chỉ số: 412 kWh', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-2', apartmentId: 'apt-201', apartmentCode: 'P201', period: '2026-11', utilityType: 'WATER', provider: 'Viwaco', amount: 215000, paidAmount: 0, status: 'UNPAID', note: '18 m³ nước sinh hoạt', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-3', apartmentId: 'apt-205', apartmentCode: 'P205', period: '2026-11', utilityType: 'ELECTRICITY', provider: 'EVN Hà Nội', amount: 740000, paidAmount: 0, status: 'UNPAID', note: '275 kWh', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-4', apartmentId: 'apt-205', apartmentCode: 'P205', period: '2026-11', utilityType: 'INTERNET', provider: 'VNPT FiberVNN', amount: 220000, paidAmount: 0, status: 'UNPAID', note: 'Gói Home Net 200Mbps', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-5', apartmentId: 'apt-401', apartmentCode: 'P401', period: '2026-11', utilityType: 'ELECTRICITY', provider: 'EVN Hà Nội', amount: 1420000, paidAmount: 0, status: 'UNPAID', note: '485 kWh', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-6', apartmentId: 'apt-401', apartmentCode: 'P401', period: '2026-11', utilityType: 'WATER', provider: 'Viwaco', amount: 265000, paidAmount: 0, status: 'UNPAID', note: '22 m³', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-7', apartmentId: 'apt-502', apartmentCode: 'P502', period: '2026-11', utilityType: 'ELECTRICITY', provider: 'EVN Hà Nội', amount: 960000, paidAmount: 0, status: 'UNPAID', note: '340 kWh', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-8', apartmentId: 'apt-802', apartmentCode: 'P802', period: '2026-11', utilityType: 'ELECTRICITY', provider: 'EVN Hà Nội', amount: 1850000, paidAmount: 0, status: 'UNPAID', note: '610 kWh', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-9', apartmentId: 'apt-802', apartmentCode: 'P802', period: '2026-11', utilityType: 'INTERNET', provider: 'FPT Telecom', amount: 280000, paidAmount: 0, status: 'UNPAID', note: 'Gói Giga 300Mbps', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-10', apartmentId: 'apt-101', apartmentCode: 'P101', period: '2026-11', utilityType: 'ELECTRICITY', provider: 'EVN Hà Nội', amount: 890000, paidAmount: 890000, status: 'PAID', note: '310 kWh', createdAt: '2026-11-03T08:00:00Z' },
    { id: 'utl-11', apartmentId: 'apt-101', apartmentCode: 'P101', period: '2026-11', utilityType: 'WATER', provider: 'Viwaco', amount: 180000, paidAmount: 180000, status: 'PAID', note: '15 m³', createdAt: '2026-11-03T08:00:00Z' },
  ];

  return {
    users,
    apartments,
    representativeHistories,
    residents,
    residencyEvents,
    feeRate,
    feeRateHistories,
    donationCampaigns,
    invoices,
    receipts,
    vehicles,
    utilityBills,
    selectedPeriod: '2026-11',
  };
}
