import { useMemo } from 'react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

/**
 * Day / Month / Year dropdowns for date of birth. Far easier than a native
 * <input type="date"> on mobile (no scrolling the calendar back decades) and
 * consistent on desktop. Emits an ISO `YYYY-MM-DD` string (or '' until complete).
 */
export function DateOfBirthPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [y, m, d] = value ? value.split('-') : ['', '', ''];

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const arr: number[] = [];
    for (let yr = now; yr >= 1920; yr--) arr.push(yr);
    return arr;
  }, []);

  const cls =
    className ||
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

  const emit = (ny: string, nm: string, nd: string) => {
    let day = nd;
    if (ny && nm && nd) {
      const maxD = daysInMonth(Number(ny), Number(nm));
      if (Number(nd) > maxD) day = String(maxD).padStart(2, '0');
    }
    onChange(ny && nm && day ? `${ny}-${nm}-${day}` : '');
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <select className={cls} value={d} onChange={(e) => emit(y, m, e.target.value)} aria-label="Day of birth">
        <option value="">Day</option>
        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((dd) => (
          <option key={dd} value={dd}>{Number(dd)}</option>
        ))}
      </select>
      <select className={cls} value={m} onChange={(e) => emit(y, e.target.value, d)} aria-label="Month of birth">
        <option value="">Month</option>
        {MONTHS.map((mn, i) => {
          const mm = String(i + 1).padStart(2, '0');
          return <option key={mm} value={mm}>{mn}</option>;
        })}
      </select>
      <select className={cls} value={y} onChange={(e) => emit(e.target.value, m, d)} aria-label="Year of birth">
        <option value="">Year</option>
        {years.map((yr) => (
          <option key={yr} value={String(yr)}>{yr}</option>
        ))}
      </select>
    </div>
  );
}
