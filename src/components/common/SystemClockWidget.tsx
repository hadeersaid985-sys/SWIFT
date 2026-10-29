import React, { useState, useEffect, useRef } from 'react';
import { Clock, Check, RefreshCw, Minus, Plus, Moon } from 'lucide-react';
import {
  formatSystemTimeEn,
  getSystemFullDateAr,
  adjustSystemTimeOffset,
  resetSystemTimeToDevice,
  TIME_EVENT_NAME
} from '../../utils/timeUtils';

export const SystemClockWidget: React.FC = () => {
  const [timeStr, setTimeStr] = useState(() => formatSystemTimeEn(undefined, false));
  const [dateStr, setDateStr] = useState(() => getSystemFullDateAr());
  const [showPopover, setShowPopover] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const updateDisplay = () => {
    setTimeStr(formatSystemTimeEn(undefined, false));
    setDateStr(getSystemFullDateAr());
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

  // Close when clicking outside
  useEffect(() => {
    if (!showPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  return (
    <div className="relative shrink-0 select-none" ref={widgetRef}>
      <button
        onClick={() => setShowPopover(!showPopover)}
        className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200/90 active:bg-slate-200 border border-slate-200/90 rounded-lg text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer group"
        title="ساعة المنظومة - انقر للتفاصيل والتزامن"
      >
        <div className="relative flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse" />
        </div>
        <span className="font-mono font-bold text-blue-700 text-xs whitespace-nowrap">
          {timeStr}
        </span>
      </button>

      {/* Popover - High z-index with fixed/proper positioning so it never gets clipped */}
      {showPopover && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-right text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium">{dateStr}</span>
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>ساعة المنظومة</span>
            </div>
          </div>

          <div className="my-2 p-2 bg-blue-50/80 border border-blue-100 rounded-lg text-center">
            <div className="font-mono text-xl font-black text-blue-800">
              {timeStr}
            </div>
            <div className="text-[11px] text-emerald-700 flex items-center justify-center gap-1 mt-1 font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>توقيت مصر الرسمي (توقيت شتوي 6:xx)</span>
            </div>
          </div>

          {/* Quick Adjustment Controls */}
          <div className="grid grid-cols-2 gap-1.5 my-2">
            <button
              onClick={() => {
                adjustSystemTimeOffset(-60);
                updateDisplay();
              }}
              className="flex items-center justify-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Minus className="w-3 h-3 text-slate-600" />
              <span>-1 ساعة</span>
            </button>
            <button
              onClick={() => {
                adjustSystemTimeOffset(60);
                updateDisplay();
              }}
              className="flex items-center justify-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3 text-slate-600" />
              <span>+1 ساعة</span>
            </button>
          </div>

          <button
            onClick={() => {
              resetSystemTimeToDevice();
              updateDisplay();
              setShowPopover(false);
            }}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>إعادة ضبط للتوقيت الشتوي الرسمي (6)</span>
          </button>

          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Moon className="w-3 h-3 text-indigo-500" />
            <span>معتمد تلقائياً لجميع الموظفين والأدمن</span>
          </div>
        </div>
      )}
    </div>
  );
};
