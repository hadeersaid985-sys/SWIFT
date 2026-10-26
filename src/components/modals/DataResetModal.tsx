import React, { useState } from 'react';
import {
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  ShieldAlert,
  Database
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { SwiftMyndLogo } from '../common/SwiftMyndLogo';

export const DataResetModal: React.FC = () => {
  const {
    isResetModalOpen,
    setIsResetModalOpen,
    resetToDemoData,
    clearUserAddedData,
    clearAllDataFresh
  } = useCRM();

  const [selectedOption, setSelectedOption] = useState<'demo' | 'user_added' | 'blank'>('demo');
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isResetModalOpen) return null;

  const handleExecuteReset = () => {
    if (selectedOption === 'demo') {
      resetToDemoData();
      setSuccessMessage('تمت استعادة البيانات التوضيحية الأصلية لمنظومة SwiftMynd بنجاح 🔄');
    } else if (selectedOption === 'user_added') {
      clearUserAddedData();
      setSuccessMessage('تم مسح جميع البيانات والمهام التي أضفتها بنجاح 🧹');
    } else if (selectedOption === 'blank') {
      clearAllDataFresh();
      setSuccessMessage('تم تفريغ المنظومة بنجاح، يمكنك الآن البدء بإدخال بياناتك من الصفر ✨');
    }

    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
      setIsResetModalOpen(false);
    }, 1400);
  };

  return (
    <div
      onClick={() => setIsResetModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col cursor-default"
      >
        {/* Header */}
        <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SwiftMyndLogo variant="icon" size="sm" isDark={true} />
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-white">
                <RotateCcw className="w-4 h-4 text-blue-400" />
                <span>إعادة ضبط ومسح البيانات (Reset Data)</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                اختر نوع المسح المطلوب لتنظيف المنظومة أو البدء من جديد
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsResetModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Options */}
          <div className="space-y-2.5">
            {/* Option 1: Clear User Added Data */}
            <div
              onClick={() => setSelectedOption('user_added')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                selectedOption === 'user_added'
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="resetOption"
                checked={selectedOption === 'user_added'}
                onChange={() => setSelectedOption('user_added')}
                className="mt-1 cursor-pointer accent-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <span>🧹 مسح البيانات والمهام المضافة فقط</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                      الأكثر أماناً
                    </span>
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  يقوم بحذف جميع المهام، صفقات المبيعات، والتعليقات التي قمت بإضافتها أثناء تجربتك، مع الإبقاء على الهيكل الأساسي للتيم.
                </p>
              </div>
            </div>

            {/* Option 2: Reset to default demo data */}
            <div
              onClick={() => setSelectedOption('demo')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                selectedOption === 'demo'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="resetOption"
                checked={selectedOption === 'demo'}
                onChange={() => setSelectedOption('demo')}
                className="mt-1 cursor-pointer accent-emerald-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <span>🔄 استعادة البيانات التوضيحية الافتراضية كاملة (Demo Data)</span>
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  يعيد المنظومة فوراً إلى حالة البيانات التوضيحية الرسمية لـ SwiftMynd مع مهام نموذجية، مؤقتات جاهزة للتجربة، وإشعارات المنشن.
                </p>
              </div>
            </div>

            {/* Option 3: Completely Blank Slate */}
            <div
              onClick={() => setSelectedOption('blank')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                selectedOption === 'blank'
                  ? 'border-rose-600 bg-rose-50/60 shadow-xs ring-1 ring-rose-500'
                  : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="resetOption"
                checked={selectedOption === 'blank'}
                onChange={() => setSelectedOption('blank')}
                className="mt-1 cursor-pointer accent-rose-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <span>🗑️ مسح شامل والبدء من الصفر تماماً (Blank Canvas)</span>
                    <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                      بداية جديدة
                    </span>
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  يفرغ قائمة المهام وسجلات العمل تماماً لتصبح الجداول فارغة (0 تاسكات)، وتتمكن من إضافة مهام شركتك الفعلية من الصفر.
                </p>
              </div>
            </div>
          </div>

          {/* Warning banner */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong>تنبيه:</strong> سيتم تطبيق الإجراء فوراً وحفظ الحالة في متصفحك. لن تفقد حسابات تسجيل الدخول الخاصة بأعضاء التيم.
            </div>
          </div>

          {/* Success Toast */}
          {isSuccessToast && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs shadow-md animate-in slide-in-from-bottom">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(false)}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            إلغاء التراجع
          </button>

          <button
            type="button"
            onClick={handleExecuteReset}
            className={`px-5 py-2.5 rounded-xl font-black text-xs text-white shadow-xs transition-all cursor-pointer flex items-center gap-2 ${
              selectedOption === 'blank'
                ? 'bg-rose-600 hover:bg-rose-700'
                : selectedOption === 'demo'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تأكيد مسح البيانات وتنفيذ الضبط</span>
          </button>
        </div>
      </div>
    </div>
  );
};
