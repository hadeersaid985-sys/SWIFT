import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatSystemTimeEn, getSystemFullDateAr } from '../../utils/timeUtils';

export const SystemClockWidget: React.FC = () => {
  const [timeStr, setTimeStr] = useState(() => formatSystemTimeEn(undefined, false));
  const [dateStr, setDateStr] = useState(() => getSystemFullDateAr());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(formatSystemTimeEn(undefined, false));
      setDateStr(getSystemFullDateAr());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all shadow-2xs select-none shrink-0"
      title={`ساعة المنظومة: ${dateStr}`}
    >
      <div className="relative flex items-center justify-center">
        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse" />
      </div>
      <span className="font-mono font-bold text-blue-700 text-xs whitespace-nowrap">
        {timeStr}
      </span>
    </div>
  );
};
