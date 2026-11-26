export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatDateVN(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateTimeVN(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function formatPeriodLabel(period: string): string {
  const [y, m] = period.split('-');
  if (!y || !m) return period;
  return `Tháng ${Number(m)}/${y}`;
}

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readThreeDigits(num: number, showZeroHundred: boolean): string {
  const hundred = Math.floor(num / 100);
  const ten = Math.floor((num % 100) / 10);
  const unit = num % 10;
  let result = '';

  if (hundred > 0 || showZeroHundred) {
    result += DIGITS[hundred] + ' trăm';
    if (ten === 0 && unit > 0) {
      result += ' linh';
    }
  }

  if (ten > 1) {
    result += (result ? ' ' : '') + DIGITS[ten] + ' mươi';
    if (unit === 1) {
      result += ' mốt';
    } else if (unit === 4) {
      result += ' tư';
    } else if (unit === 5) {
      result += ' lăm';
    } else if (unit > 0) {
      result += ' ' + DIGITS[unit];
    }
  } else if (ten === 1) {
    result += (result ? ' ' : '') + 'mười';
    if (unit === 5) {
      result += ' lăm';
    } else if (unit > 0) {
      result += ' ' + DIGITS[unit];
    }
  } else if (unit > 0) {
    result += (result ? ' ' : '') + DIGITS[unit];
  }

  return result;
}

export function numberToVietnameseWords(amount: number): string {
  const n = Math.round(Math.abs(amount));
  if (n === 0) return 'Không đồng';

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const groups: number[] = [];
  let temp = n;
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const grp = groups[i];
    if (grp > 0) {
      const showZeroHundred = i < groups.length - 1;
      const text = readThreeDigits(grp, showZeroHundred);
      parts.push(text + (units[i] ? ' ' + units[i] : ''));
    }
  }

  const sentence = parts.join(' ').trim();
  const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return `${amount < 0 ? 'Âm ' : ''}${capitalized} đồng chẵn`;
}

export function maskSensitiveName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return parts
    .map((p, idx) => (idx === 0 || idx === parts.length - 1 ? p : p[0] + '.'))
    .join(' ');
}
