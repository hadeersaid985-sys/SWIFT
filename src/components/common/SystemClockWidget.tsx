import React, { useState, useEffect, useRef } from 'react';
import { Clock, Minus, Plus, RefreshCw, Moon, Check, ChevronDown } from 'lucide-react';
import {
  formatSystemTimeEn,
  getSystemFullDateAr,
  adjustSystemTimeOffset,
  resetSystemTimeToDevice,
  getSystemTimeOffsetMinutes,
  TIME_EVENT_NAME
} from '../../utils/timeUtils';

export const SystemClockWidget: React.FC = () => {
  const [timeStr, setTimeStr] = useState(() => formatSystemTimeEn(undefined, false));
  const [dateStr, setDateStr] = useState(() => getSystemFullDateAr());
  const [offsetMinutes, setOffsetMinutes] = useState(() => getSystemTimeOffsetMinutes());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateDisplay = () => {
    setTimeStr(formatSystemTimeEn(undefined, false));
    setDateStr(getSystemFullDateAr());
    setOffsetMinutes(getSystemTimeOffsetMinutes());
  };

  useEffect(() => {
    updateDisplay();
    const timer = setInterval(updateDisplay, 1000);

    const handleCustomChange = () => {
      updateDisplay();
    };

    window.addEventListener(TIME_EVENT_NAME, handleCustomChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener(TIME_EVENT_NAME, handleCustomChange);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAdjust = (deltaMinutes: number) => {
    adjustSystemTimeOffset(deltaMinutes);
    updateDisplay();
  };

  const handleReset = () => {
    resetSystemTimeToDevice();
    updateDisplay();
  };

  return (
    <div className="relative shrink-0 select-none" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer group"
        title="انقر لضبط وتزامن الساعة أو ترجيعها للتوقيت الشتوي"
      >
        <div className="relative flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0 group-hover:rotate-12 transition-transform" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse" />
        </div>
        <span className="font-mono font-bold text-blue-700 text-xs whitespace-nowrap">
          {timeStr}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3 text-right text-xs animation-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[11px] font-medium text-slate-500">{dateStr}</span>
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>ساعة المنظومة</span>
            </div>
          </div>

          {/* Current display */}
          <div className="my-2.5 p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-center">
            <div className="font-mono text-xl font-black text-blue-800 tracking-wider">
              {timeStr}
            </div>
            <div className="text-[11px] text-blue-600 flex items-center justify-center gap-1 mt-1 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {offsetMinutes === 0
                  ? 'متزامنة تلقائياً مع ساعتك'
                  : `معدلة يدوياً (${offsetMinutes > 0 ? `+${offsetMinutes}` : offsetMinutes} دقيقة)`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1.5 pt-1">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAdjust(-60)}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                title="تقليل الساعة 60 دقيقة"
              >
                <Minus className="w-3.5 h-3.5 text-amber-600" />
                <span>قلل ساعة (-1 س)</span>
              </button>

              <button
                onClick={() => handleAdjust(60)}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                title="زيادة الساعة 60 دقيقة"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>زود ساعة (+1 س)</span>
              </button>
            </div>

            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>مزامنة فورية مع جهازك (إعادة ضبط)</span>
            </button>
          </div>

          {/* Winter time info banner */}
          <div className="mt-2.5 p-2 bg-indigo-50/80 border border-indigo-100 rounded-lg text-[10px] text-indigo-900 leading-relaxed flex items-start gap-1.5">
            <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">التوقيت الشتوي في مصر:</span>
              <p className="text-indigo-700 mt-0.5">
                بعد الساعة 12 منتصف الليل الليلة، يمكنك النقر على &quot;قلل ساعة&quot; أو إعادة الضبط لترجيع الساعة 60 دقيقة للتوقيت الشتوي.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
