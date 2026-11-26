import React, { useState } from 'react';
import { Printer, QrCode, Building2, CheckCircle2 } from 'lucide-react';
import { Receipt } from '../../types';
import { Modal } from '../ui/Modal';
import { formatDateTimeVN, formatVND, numberToVietnameseWords } from '../../utils/format';

interface ReceiptPrintModalProps {
  receipt: Receipt | null;
  onClose: () => void;
  isReprint?: boolean;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  receipt,
  onClose,
  isReprint = false,
}) => {
  const [paperSize, setPaperSize] = useState<'A5' | 'A4'>('A5');

  if (!receipt) return null;

  const mandatoryItems = receipt.items.filter(
    (i) => i.category === 'MANDATORY_FEE' || i.category === 'PARKING_FEE'
  );
  const utilityItems = receipt.items.filter((i) => i.category === 'UTILITY_COLLECTION');
  const donationItems = receipt.items.filter((i) => i.category === 'VOLUNTARY_DONATION');

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={Boolean(receipt)}
      onClose={onClose}
      title={`Biên nhận Phiếu thu • ${receipt.receiptNo}`}
      subtitle={
        isReprint
          ? 'In lại từ lịch sử chứng từ — giữ nguyên mã phiếu thu gốc, không phát sinh giao dịch mới.'
          : 'Mẫu biên lai chuẩn Ban Quản trị Chung cư BlueMoon.'
      }
      size="lg"
      footer={
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Khổ giấy in:</span>
            <button
              type="button"
              onClick={() => setPaperSize('A5')}
              className={`px-2.5 py-1 rounded-lg border font-semibold ${
                paperSize === 'A5'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              Khổ A5 (Chuẩn biên lai)
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('A4')}
              className={`px-2.5 py-1 rounded-lg border font-semibold ${
                paperSize === 'A4'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              Khổ A4
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg shadow-sm"
            >
              <Printer className="w-4 h-4" />
              In phiếu thu / Lưu PDF
            </button>
          </div>
        </div>
      }
    >
      {/* Printable Receipt Sheet */}
      <div
        className={`print-container ${
          paperSize === 'A5' ? 'print-a5' : 'print-a4'
        } bg-white border border-slate-300 rounded-xl p-6 text-slate-900`}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#1E3A8A] pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#1E3A8A]">
                Ban Quản trị Chung cư BlueMoon
              </p>
              <p className="text-[11px] text-slate-500">
                KĐT BlueMoon, Quận Cầu Giấy, TP. Hà Nội • Hotline: 1900 6868
              </p>
              <p className="text-[11px] text-slate-500">MST: 0108889999 • Mẫu số: 01-TT/BM</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Số chứng từ</p>
            <p className="text-base font-extrabold font-mono text-[#1E3A8A]">
              {receipt.receiptNo}
            </p>
            {isReprint && (
              <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                BẢN SAO / IN LẠI
              </span>
            )}
          </div>
        </div>

        {/* Receipt Title */}
        <div className="text-center my-4">
          <h2 className="text-xl font-extrabold tracking-wide text-slate-900 uppercase">
            Phiếu Thu Tiền
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ngày lập: {formatDateTimeVN(receipt.paymentDate)}
          </p>
        </div>

        {/* Payer Info */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-4">
          <div>
            <span className="text-slate-500">Mã căn hộ:</span>{' '}
            <strong className="text-[#1E3A8A] text-sm">{receipt.apartmentCode}</strong>
          </div>
          <div>
            <span className="text-slate-500">Hình thức thanh toán:</span>{' '}
            <strong className="text-slate-900">
              {receipt.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản ngân hàng'}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Họ tên người nộp:</span>{' '}
            <strong className="text-slate-900">{receipt.payerName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Cán bộ thu:</span>{' '}
            <strong className="text-slate-900">{receipt.cashierName}</strong>
          </div>
          {receipt.note && (
            <div className="col-span-2">
              <span className="text-slate-500">Ghi chú:</span>{' '}
              <span className="text-slate-800 italic">{receipt.note}</span>
            </div>
          )}
        </div>

        {/* Items Table separated by category (US-13, US-15, US-18) */}
        <table className="w-full text-xs border border-slate-300 border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="border border-slate-300 px-2.5 py-2 text-center w-10">STT</th>
              <th className="border border-slate-300 px-3 py-2 text-left">Nội dung khoản thu</th>
              <th className="border border-slate-300 px-2.5 py-2 text-center w-20">Kỳ thu</th>
              <th className="border border-slate-300 px-3 py-2 text-right w-32">Số tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {mandatoryItems.length > 0 && (
              <>
                <tr className="bg-blue-50/70">
                  <td
                    colSpan={4}
                    className="border border-slate-300 px-3 py-1.5 font-bold text-[#1E3A8A]"
                  >
                    A. Phí dịch vụ, quản lý & gửi xe chung cư BlueMoon
                  </td>
                </tr>
                {mandatoryItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5">{item.description}</td>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center tabular-nums">
                      {item.period || '—'}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-semibold tabular-nums">
                      {formatVND(item.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {utilityItems.length > 0 && (
              <>
                <tr className="bg-amber-50/70">
                  <td
                    colSpan={4}
                    className="border border-slate-300 px-3 py-1.5 font-bold text-amber-900"
                  >
                    B. Khoản thu hộ nhà cung cấp ngoài (Điện • Nước • Internet)
                  </td>
                </tr>
                {utilityItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5">{item.description}</td>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center tabular-nums">
                      {item.period || '—'}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-semibold tabular-nums">
                      {formatVND(item.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {donationItems.length > 0 && (
              <>
                <tr className="bg-sky-50/70">
                  <td
                    colSpan={4}
                    className="border border-slate-300 px-3 py-1.5 font-bold text-sky-900"
                  >
                    C. Đóng góp các quỹ tự nguyện (Không bắt buộc)
                  </td>
                </tr>
                {donationItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5">{item.description}</td>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-center tabular-nums">
                      {item.period || '—'}
                    </td>
                    <td className="border border-slate-300 px-3 py-1.5 text-right font-semibold tabular-nums">
                      {formatVND(item.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Total Row */}
            <tr className="bg-slate-100 font-extrabold text-sm">
              <td colSpan={3} className="border border-slate-300 px-3 py-2.5 text-right uppercase">
                Tổng cộng số tiền đã thu
              </td>
              <td className="border border-slate-300 px-3 py-2.5 text-right text-[#1E3A8A] tabular-nums">
                {formatVND(receipt.totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="mt-3 p-3 rounded-lg bg-blue-50/60 border border-blue-200/80 text-xs">
          <span className="text-slate-600">Bằng chữ: </span>
          <strong className="italic text-[#1E3A8A]">
            {numberToVietnameseWords(receipt.totalAmount)}.
          </strong>
        </div>

        {/* Signatures & QR Verification */}
        <div className="mt-6 grid grid-cols-3 gap-4 items-start text-center text-xs">
          <div>
            <p className="font-bold text-slate-800">Người nộp tiền</p>
            <p className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
            <div className="h-14" />
            <p className="font-semibold text-slate-800">{receipt.payerName}</p>
          </div>

          <div className="flex flex-col items-center justify-center pt-1">
            <div className="p-2 rounded-lg border border-slate-200 bg-slate-50">
              <QrCode className="w-12 h-12 text-[#1E3A8A]" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Đối soát: {receipt.receiptNo}
            </p>
          </div>

          <div>
            <p className="font-bold text-slate-800">Kế toán / Thủ quỹ</p>
            <p className="text-[11px] text-slate-500 italic">(Ký, đóng dấu BQT)</p>
            <div className="h-14" />
            <p className="font-semibold text-slate-800">{receipt.cashierName}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
