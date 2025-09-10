import { sxAssetTransferReport } from '../styles/sx';

export const isFiniteNum = (n: any) => typeof n === "number" && Number.isFinite(n);

export const formatMoney = (n?: number | null) => {
  if (n == null || !isFiniteNum(n)) return "-";
  const abs = Math.abs(n);
  const base = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n < 0) return `(${base})`;
  if (n === 0) return "-";
  return base;
};

export const moneySx = (n?: number | null) => sxAssetTransferReport.moneyText(n != null && n < 0);

export const formatLifeYear = (n?: number | null) => {
  if (n == null || !isFiniteNum(n)) return "-";
  const s = n.toFixed(2);
  return s.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

export const parseDate = (d?: string | null) => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(+dt) ? null : dt;
};

export const formatDateEng = (d?: string | null) => {
  const dt = parseDate(d);
  if (!dt) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(dt);
};

export const formatDateThaiLong = (d?: string | null) => {
  const dt = parseDate(d);
  if (!dt) return "-";
  // Thai Buddhist year
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dt);
};