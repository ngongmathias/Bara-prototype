import { useMemo, useState } from 'react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

/**
 * Day / Month / Year dropdowns for date of birth. Far easier than a native
 * <input type="date"> on mobile (no scrolling the calendar back decades) and
 * consistent on desktop. Emits an ISO `YYYY-MM-DD` string (or '' until all three
 * are chosen). Holds its own day/month/year state so partial selections persist
 * (deriving them from the composed value would deadlock — value stays empty
 * until complete, so each select would read the others as empty).
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
  const initial = value ? value.split('-') : ['', '', ''];
  const [year, setYear] = useState(initial[0] || '');
  const [month, setMonth] = useState(initial[1] || '');
  const [day, setDay] = useState(initial[2] || '');

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const arr: number[] = [];
    for (let yr = now; yr >= 1920; yr--) arr.push(yr);
    return arr;
  }, []);

  const cls =
    className ||
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

  const commit = (ny: string, nm: string, nd: string) => {
    // Clamp the day to the chosen month/year (e.g. 31 → 30/28).
    if (ny && nm && nd) {
      const maxD = daysInMonth(Number(ny), Number(nm));
      if (Number(nd) > maxD) nd = String(maxD).padStart(2, '0');
    }
    setYear(ny);
    setMonth(nm);
    setDay(nd);
    onChange(ny && nm && nd ? `${ny}-${nm}-${nd}` : '');
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <select className={cls} value={day} onChange={(e) => commit(year, month, e.target.value)} aria-label="Day of birth">
        <option value="">Day</option>
        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((dd) => (
          <option key={dd} value={dd}>{Number(dd)}</option>
        ))}
      </select>
      <select className={cls} value={month} onChange={(e) => commit(year, e.target.value, day)} aria-label="Month of birth">
        <option value="">Month</option>
        {MONTHS.map((mn, i) => {
          const mm = String(i + 1).padStart(2, '0');
          return <option key={mm} value={mm}>{mn}</option>;
        })}
      </select>
      <select className={cls} value={year} onChange={(e) => commit(e.target.value, month, day)} aria-label="Year of birth">
        <option value="">Year</option>
        {years.map((yr) => (
          <option key={yr} value={String(yr)}>{yr}</option>
        ))}
      </select>
    </div>
  );
}
