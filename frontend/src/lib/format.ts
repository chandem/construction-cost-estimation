export function fmtNum(n: number | string | null | undefined, digits = 2): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtMoney(
  n: number | string | null | undefined,
  currency = "ETB",
): string {
  return `${fmtNum(n)} ${currency}`;
}

export function fmtInt(n: number | string | null | undefined): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
