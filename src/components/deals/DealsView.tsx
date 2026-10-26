import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  DollarSign,
  TrendingUp,
  Building,
  User,
  Calendar,
  CheckCircle2,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Deal, DealStage } from '../../types/crm';

export const DealsView: React.FC = () => {
  const {
    deals,
    team,
    updateDealStage,
    deleteDeal,
    setOpenQuickModal,
    brandConfig
  } = useCRM();

  const currency = brandConfig?.systemCurrency || 'ج.م';
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const stages: { id: DealStage; label: string; color: string; border: string; bg: string }[] = [
    { id: 'مؤهل', label: 'مؤهل مبدئياً', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50/60' },
    { id: 'عرض سعر', label: 'تقديم عرض سعر', color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50/60' },
    { id: 'تفاوض', label: 'التفاوض والعقود', color: 'text-purple-700', border: 'border-purple-200', bg: 'bg-purple-50/60' },
    { id: 'مغلقة ناجحة', label: 'مغلقة ناجحة 🏆', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50/60' },
    { id: 'ملغاة', label: 'صفقات خاسرة/ملغاة', color: 'text-slate-600', border: 'border-slate-200', bg: 'bg-slate-100/70' }
  ];

  // Pipeline Metrics
  const activeDeals = deals.filter(d => d.stage !== 'ملغاة');
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const wonDeals = deals.filter(d => d.stage === 'مغلقة ناجحة');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              مسار صفقات المبيعات (Sales Deals & Pipeline)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة مراحل الفرص البيعية، قيم الصفقات وتواريخ الإغلاق المتوقعة
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpenQuickModal('deal')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صفقة مبيعات</span>
        </button>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-semibold">إجمالي قيمة الصفقات الجارية:</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalPipelineValue.toLocaleString()} {currency}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-semibold">الصفقات المغلقة والرابحة:</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {wonValue.toLocaleString()} {currency}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-semibold">معدل نجاح إغلاق الصفقات (Win Rate):</span>
            <div className="text-2xl font-black text-purple-600 mt-1">{winRate}%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {stages.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.id);
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border ${stage.border} ${stage.bg} p-3.5 space-y-3 min-h-[500px] flex flex-col`}
            >
              {/* Stage Header */}
              <div className="border-b border-slate-200/70 pb-2">
                <div className="flex items-center justify-between">
                  <span className={`font-black text-xs sm:text-sm ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-700">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-600 mt-1">
                  {stageValue.toLocaleString()} {currency}
                </div>
              </div>

              {/* Deal Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageDeals.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                    لا توجد صفقات حالياً
                  </div>
                ) : (
                  stageDeals.map(deal => {
                    const assigned = team.find(m => m.id === deal.assignedToId);

                    return (
                      <div
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 relative"
                      >
                        <div className="font-extrabold text-xs text-slate-900 leading-snug">
                          {deal.title}
                        </div>

                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{deal.company}</span>
                        </div>

                        <div className="text-sm font-black text-emerald-600">
                          {deal.value.toLocaleString()} {deal.currency}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {deal.expectedCloseDate}
                          </span>
                          <span className="font-bold text-slate-600">
                            احتمالية {deal.probability}%
                          </span>
                        </div>

                        {/* Stage Mover Selector */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          {assigned ? (
                            <div className="flex items-center gap-1.5" title={assigned.name}>
                              <img
                                src={assigned.avatar}
                                alt={assigned.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="text-[10px] text-slate-600 truncate max-w-[80px]">
                                {assigned.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">غير محدد</span>
                          )}

                          <select
                            value={deal.stage}
                            onClick={e => e.stopPropagation()}
                            onChange={e => updateDealStage(deal.id, e.target.value as DealStage)}
                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 hover:border-emerald-500 focus:outline-none cursor-pointer"
                          >
                            <option value="مؤهل">مؤهل</option>
                            <option value="عرض سعر">عرض سعر</option>
                            <option value="تفاوض">تفاوض</option>
                            <option value="مغلقة ناجحة">مغلقة ناجحة</option>
                            <option value="ملغاة">ملغاة</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Deal Details Modal */}
      {selectedDeal && (
        <div
          onClick={() => setSelectedDeal(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 cursor-default"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  المرحلة: {selectedDeal.stage}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1.5">
                  {selectedDeal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الشركة:</span>
                <strong className="text-slate-900">{selectedDeal.company}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الشخص المسؤول للعميل:</span>
                <strong className="text-slate-900">{selectedDeal.contactName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">البريد الإلكتروني:</span>
                <span className="font-mono text-slate-800">{selectedDeal.contactEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-mono text-slate-800 dir-ltr">{selectedDeal.contactPhone}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">القيمة المالية:</span>
                <span className="text-base font-black text-emerald-600">
                  {selectedDeal.value.toLocaleString()} {selectedDeal.currency}
                </span>
              </div>
            </div>

            {selectedDeal.notes && (
              <div className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900">ملاحظات الصفقة: </span>
                {selectedDeal.notes}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  if (confirm('هل تريد حذف هذه الصفقة؟')) {
                    deleteDeal(selectedDeal.id);
                    setSelectedDeal(null);
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف الصفقة
              </button>

              <button
                onClick={() => setSelectedDeal(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
