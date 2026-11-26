import * as XLSX from 'xlsx';
import { formatDateVN, formatPeriodLabel } from './format';

export interface FinancialReportRow {
  apartmentCode: string;
  floor: number;
  area: number;
  type: string;
  ownerName: string;
  serviceFee: number;
  managementFee: number;
  parkingFee: number;
  totalDue: number;
  totalPaid: number;
  remaining: number;
  statusLabel: string;
}

export function exportFinancialReportExcel(
  rows: FinancialReportRow[],
  period: string,
  filterSummary: string
): void {
  const wb = XLSX.utils.book_new();
  const titleRows: (string | number)[][] = [
    ['BAN QUẢN TRỊ CHUNG CƯ BLUEMOON'],
    [`BÁO CÁO TỔNG HỢP THU PHÍ ĐỊNH KỲ — ${formatPeriodLabel(period).toUpperCase()}`],
    [`Bộ lọc áp dụng: ${filterSummary} | Ngày xuất: ${formatDateVN(new Date().toISOString())}`],
    [],
    [
      'STT',
      'Mã căn hộ',
      'Tầng',
      'Diện tích (m²)',
      'Loại hình',
      'Chủ hộ / Đại diện',
      'Phí dịch vụ (đ)',
      'Phí quản lý (đ)',
      'Phí gửi xe (đ)',
      'Tổng phải thu (đ)',
      'Đã thu (đ)',
      'Còn nợ (đ)',
      'Trạng thái',
    ],
  ];

  const dataRows = rows.map((r, idx) => [
    idx + 1,
    r.apartmentCode,
    r.floor,
    r.area,
    r.type,
    r.ownerName,
    r.serviceFee,
    r.managementFee,
    r.parkingFee,
    r.totalDue,
    r.totalPaid,
    r.remaining,
    r.statusLabel,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, ...dataRows]);

  const startRow = 6; // 1-indexed Excel row where data starts
  const endRow = startRow + rows.length - 1;
  const totalRowIdx = endRow + 1;

  // Add Total row with real Excel SUM formulas
  ws[`A${totalRowIdx}`] = { t: 's', v: 'TỔNG CỘNG' };
  ws[`D${totalRowIdx}`] =
    rows.length > 0 ? { t: 'n', f: `SUM(D${startRow}:D${endRow})` } : { t: 'n', v: 0 };

  const sumCols = ['G', 'H', 'I', 'J', 'K', 'L'];
  for (const col of sumCols) {
    ws[`${col}${totalRowIdx}`] =
      rows.length > 0
        ? { t: 'n', f: `SUM(${col}${startRow}:${col}${endRow})`, z: '#,##0' }
        : { t: 'n', v: 0, z: '#,##0' };
  }

  // Apply number format to currency columns in data rows
  for (let r = startRow; r <= endRow; r++) {
    for (const col of sumCols) {
      const cell = ws[`${col}${r}`];
      if (cell) cell.z = '#,##0';
    }
  }

  ws['!ref'] = `A1:M${totalRowIdx}`;
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 12 } },
    { s: { r: totalRowIdx - 1, c: 0 }, e: { r: totalRowIdx - 1, c: 2 } },
  ];
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 7 },
    { wch: 14 },
    { wch: 12 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'BaoCaoThuPhi');
  XLSX.writeFile(wb, `BlueMoon_BaoCaoTaiChinh_${period}.xlsx`);
}

export interface DonationReportRow {
  apartmentCode: string;
  donorName: string;
  campaignName: string;
  amount: number;
  paymentDate: string;
  receiptNo: string;
  paymentMethod: string;
}

export function exportDonationsExcel(
  rows: DonationReportRow[],
  campaignTitle: string
): void {
  const wb = XLSX.utils.book_new();
  const headerRows: (string | number)[][] = [
    ['BAN QUẢN TRỊ CHUNG CƯ BLUEMOON'],
    [`DANH SÁCH ĐÓNG GÓP TỰ NGUYỆN — ${campaignTitle.toUpperCase()}`],
    [`Ngày lập báo cáo: ${formatDateVN(new Date().toISOString())}`],
    [],
    ['STT', 'Mã căn hộ', 'Họ tên người ủng hộ', 'Quỹ vận động', 'Số tiền ủng hộ (đ)', 'Ngày nộp', 'Số phiếu thu', 'Hình thức'],
  ];

  const dataRows = rows.map((r, idx) => [
    idx + 1,
    r.apartmentCode,
    r.donorName,
    r.campaignName,
    r.amount,
    formatDateVN(r.paymentDate),
    r.receiptNo,
    r.paymentMethod,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...dataRows]);
  const startRow = 6;
  const endRow = startRow + rows.length - 1;
  const totalRowIdx = endRow + 1;

  ws[`A${totalRowIdx}`] = { t: 's', v: 'TỔNG LŨY KẾ' };
  ws[`E${totalRowIdx}`] =
    rows.length > 0
      ? { t: 'n', f: `SUM(E${startRow}:E${endRow})`, z: '#,##0' }
      : { t: 'n', v: 0, z: '#,##0' };

  for (let r = startRow; r <= endRow; r++) {
    const cell = ws[`E${r}`];
    if (cell) cell.z = '#,##0';
  }

  ws['!ref'] = `A1:H${totalRowIdx}`;
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
    { s: { r: totalRowIdx - 1, c: 0 }, e: { r: totalRowIdx - 1, c: 3 } },
  ];
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 26 },
    { wch: 30 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'DongGopTuNguyen');
  XLSX.writeFile(wb, `BlueMoon_DongGopTuNguyen_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export interface ResidencyEventExportRow {
  apartmentCode: string;
  residentName: string;
  type: string;
  fromDate: string;
  toDate: string;
  reason: string;
  recordedBy: string;
}

export function exportResidencyEventsExcel(rows: ResidencyEventExportRow[]): void {
  const wb = XLSX.utils.book_new();
  const headerRows: (string | number)[][] = [
    ['BAN QUẢN TRỊ CHUNG CƯ BLUEMOON'],
    ['DANH SÁCH BIẾN ĐỘNG CƯ TRÚ (TẠM TRÚ / TẠM VẮNG / THAY ĐỔI NƠI CƯ TRÚ)'],
    [`Ngày trích xuất: ${formatDateVN(new Date().toISOString())}`],
    [],
    ['STT', 'Mã căn hộ', 'Họ tên cư dân', 'Loại biến động', 'Từ ngày', 'Đến ngày', 'Lý do', 'Cán bộ ghi nhận'],
  ];

  const dataRows = rows.map((r, idx) => [
    idx + 1,
    r.apartmentCode,
    r.residentName,
    r.type,
    formatDateVN(r.fromDate),
    r.toDate ? formatDateVN(r.toDate) : 'Không xác định',
    r.reason,
    r.recordedBy,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...dataRows]);
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
  ];
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 24 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 36 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'BienDongCuTru');
  XLSX.writeFile(wb, `BlueMoon_BienDongCuTru_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
