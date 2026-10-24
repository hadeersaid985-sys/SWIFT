import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldAlert, KeyRound, Check, X, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const AdminPinModal: React.FC = () => {
  const {
    isAdminPinModalOpen,
    setIsAdminPinModalOpen,
    returnToAdminWithPin,
    brandConfig,
    currentUser
  } = useCRM();

  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdminPinModalOpen) {
      setPinInput('');
      setErrorMessage(null);
      setIsSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isAdminPinModalOpen]);

  if (!isAdminPinModalOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMessage('يرجى كتابة رمز الأمان (PIN)');
      return;
    }

    const success = returnToAdminWithPin(pinInput);
    if (success) {
      setIsSuccess(true);
      setErrorMessage(null);
      setTimeout(() => {
        setIsAdminPinModalOpen(false);
      }, 700);
    } else {
      setErrorMessage('رمز الأمان غير صحيح! يرجى إدخال الرمز الصحيح للمتابعة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-400/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  التحقق من هوية المدير العام (الأدمن)
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  🔒 أمان مقيد
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                حساب الموظف ({currentUser.name}) منفصل تماماً عن حساب المدير
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminPinModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>فصل تام بين حسابات الموظفين والمدير:</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              وفقاً لقواعد النظام، لا يُسمح للموظف بالوصول إلى بيانات الإدارة، تجديدات العملاء، المرتبات أو الصفقات. للدخول لحساب الأدمن، يجب إدخال رمز الأمان (Admin PIN).
            </p>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
              أدخل رمز أمان الأدمن (PIN Code):
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="أدخل رمز الأدمن (الافتراضي 8899)"
                maxLength={10}
                className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none transition-all ${
                  errorMessage
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                    : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                title={showPin ? 'إخفاء الرمز' : 'إظهار الرمز'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick keypad suggestions for testing */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
              <span>الرمز السري الافتراضي للأدمن: <strong className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">8899</strong></span>
              <button
                type="button"
                onClick={() => setPinInput(brandConfig.adminPin || '8899')}
                className="text-blue-600 hover:underline font-bold cursor-pointer"
              >
                ملء الرمز
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 animate-in slide-in-from-top">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold">{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">تم التحقق بنجاح! جاري الانتقال لحساب المدير العام...</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdminPinModalOpen(false)}
              className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-bold cursor-pointer transition-colors"
            >
              البقاء في حساب الموظف
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>تأكيد الدخول للأدمن 👑</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
