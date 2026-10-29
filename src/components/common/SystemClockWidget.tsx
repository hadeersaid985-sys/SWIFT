import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';
import {
  formatSystemTimeEn,
  formatSystemTimeAr,
  getSystemFullDateAr,
  getSystemDateString
} from '../../utils/timeUtils';

export const SystemClockWidget: React.FC = () => {
  const [timeEn, setTimeEn] = useState(() => formatSystemTimeEn(undefined, true));
  const [timeAr, setTimeAr] = useState(() => formatSystemTimeAr(undefined, false));
  const [dateStr, setDateStr] = useState(() => getSystemFullDateAr());
  const [showFullTime, setShowFullTime] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeEn(formatSystemTimeEn(undefined, true));
      setTimeAr(formatSystemTimeAr(undefined, false));
      setDateStr(getSystemFullDateAr());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      onClick={() => setShowFullTime(!showFullTime)}
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 cursor-pointer transition-all shadow-2xs select-none"
      title={`ساعة وتوقيت المنظومة: ${dateStr} - اضغط لتبديل العرض`}
    >
      <div className="relative flex items-center justify-center">
        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse" />
      </div>

      <div className="flex items-center gap-1 font-mono tracking-tight font-bold text-slate-800 text-[11px] sm:text-xs">
        <span className="text-blue-700">{showFullTime ? timeEn : timeEn.replace(/:\d\d\s/, ' ')}</span>
        <span className="text-slate-400 text-[10px] hidden md:inline">({timeAr})</span>
      </div>
    </div>
  );
};
