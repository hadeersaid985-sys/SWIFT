import React, { useState } from 'react';
import {
  X,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Trophy,
  Copy,
  Check,
  Printer,
  Sparkles,
  Users,
  CheckSquare,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { SwiftMyndLogo } from '../common/SwiftMyndLogo';

interface WeeklyExecutiveModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const WeeklyExecutiveModal: React.FC<WeeklyExecutiveModalProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;

  const { tasks, team, clientRenewals, brandConfig } = useCRM();
  const [copied, setCopied] = useState(false);

  // Statistics Calculation
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const pendingTasks = tasks.filter(t => t.status === 'todo');

  const totalLoggedMinutes = tasks.reduce((sum, t) => sum + (t.totalLoggedMinutes || 0), 0);
  const totalLoggedHours = (totalLoggedMinutes / 60).toFixed(1);

  // Active Renewals Revenue
  const totalRenewalsAmount = clientRenewals.reduce((sum, r) => sum + r.amount, 0);
  const dueSoonRenewals = clientRenewals.filter(r => r.status === 'renewing_soon' || r.status === 'overdue');
  const dueSoonAmount = dueSoonRenewals.reduce((sum, r) => sum + r.amount, 0);

  // Top Performer by completed tasks & logged minutes
  const teamPerformance = team.map(member => {
    const memberTasks = tasks.filter(t => t.assignedToId === member.id);
    const memberCompleted = memberTasks.filter(t => t.status === 'completed').length;
    const memberMinutes = memberTasks.reduce((acc, t) => acc + (t.totalLoggedMinutes || 0), 0);
    const score = (memberCompleted * 10) + Math.round(memberMinutes / 60 * 2);
    return {
      member,
      completedCount: memberCompleted,
      loggedHours: (memberMinutes / 60).toFixed(1),
      score
    };
  }).sort((a, b) => b.score - a.score);

  const topMember = teamPerformance[0];

  const todayStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Summary Text for WhatsApp / Telegram
  const summaryText = `📊 تقرير الإنجاز التنفيذي الأسبوعي - ${brandConfig?.brandName || 'سويفت مايند'}
تاريخ: ${todayStr}

🔹 ملخص إنجاز المهام:
• المهام المكتملة: ${completedTasks.length} مهمة ✅
• المهام قيد التنفيذ: ${inProgressTasks.length} مهمة ⏳
• المهام المنتظرة: ${pendingTasks.length} مهمة

⏱️ إجمالي ساعات العمل المسجلة: ${totalLoggedHours} ساعة عمل

👑 موظف الأسبوع المتصدر: ${topMember?.member.name || '-'} (${topMember?.completedCount || 0} مهمة مكتملة • ${topMember?.loggedHours || 0} ساعة عمل)

💼 متابعة اشتراكات العملاء والتجديدات:
• إجمالي قيمة الاشتراكات: ${totalRenewalsAmount.toLocaleString()} ${brandConfig?.systemCurrency || 'ج.م'}
• اشتراكات مستحقة المتابعة والتجديد: ${dueSoonRenewals.length} عملاء (بقيمة ${dueSoonAmount.toLocaleString()} ${brandConfig?.systemCurrency || 'ج.م'})

تقبلوا وافر التحية والتقدير،
إدارة المنظومة 🚀`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-auto">
        {/* Header (Hidden in Print) */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10">
              <BarChart3 className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">
                  تقرير الإنجاز الأسبوعي الشامل للمدير
                </h3>
                <span className="text-[10px] bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 px-2 py-0.5 rounded-full font-bold">
                  ملخص تنفيذي 📊
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تجميع فوري لكافة مهام الفريق، ساعات العمل المسجلة، واشتراكات العملاء
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة PDF 🖨️</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0">
          {/* Brand & Date in Print */}
          <div className="hidden print:flex items-center justify-between pb-4 border-b border-slate-200">
            <SwiftMyndLogo variant="full" size="md" />
            <div className="text-left dir-ltr text-xs text-slate-500 font-mono">
              <div>{todayStr}</div>
              <div className="font-bold text-slate-800">WEEKLY EXECUTIVE REPORT</div>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/90 text-right space-y-1">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                <span>المهام المنجزة</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-800">{completedTasks.length}</div>
              <div className="text-[10px] text-emerald-600 font-medium">من إجمالي {tasks.length} مهمة</div>
            </div>

            <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200/90 text-right space-y-1">
              <div className="flex items-center justify-between text-blue-700 text-xs font-bold">
                <span>ساعات العمل</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-800">{totalLoggedHours} س</div>
              <div className="text-[10px] text-blue-600 font-medium">{totalLoggedMinutes} دقيقة مسجلة</div>
            </div>

            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 text-right space-y-1">
              <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                <span>تجديدات العملاء</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-800">{totalRenewalsAmount.toLocaleString()}</div>
              <div className="text-[10px] text-amber-600 font-medium">{clientRenewals.length} عملاء مسجلين</div>
            </div>

            <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200/90 text-right space-y-1">
              <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
                <span>حجم الفريق</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-800">{team.length}</div>
              <div className="text-[10px] text-purple-600 font-medium">موظفين وأعضاء فعالين</div>
            </div>
          </div>

          {/* Top Performer Banner */}
          {topMember && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border-2 border-amber-400/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={topMember.member.avatar}
                    alt={topMember.member.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  />
                  <span className="absolute -top-2 -right-2 text-xl" title="المركز الأول">👑</span>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                      نجم الأسبوع المتصدر 🌟
                    </span>
                    <h4 className="font-black text-slate-900 text-sm">{topMember.member.name}</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {topMember.member.role} • {topMember.member.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs bg-white/80 px-4 py-2 rounded-xl border border-amber-200 shadow-2xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">المهام المكتملة:</span>
                  <strong className="text-emerald-700 font-bold">{topMember.completedCount} مهام</strong>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <span className="text-slate-400 block text-[10px]">الساعات:</span>
                  <strong className="text-blue-700 font-bold">{topMember.loggedHours} س</strong>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <span className="text-slate-400 block text-[10px]">مجموع النقاط:</span>
                  <strong className="text-amber-700 font-bold">{topMember.score} نقطة</strong>
                </div>
              </div>
            </div>
          )}

          {/* Team Performance Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>ترتيب إنتاجية أعضاء الفريق هذا الأسبوع:</span>
            </h4>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2.5">الترتيب</th>
                    <th className="p-2.5">الموظف</th>
                    <th className="p-2.5">القسم</th>
                    <th className="p-2.5">المهام المنجزة</th>
                    <th className="p-2.5">ساعات العمل</th>
                    <th className="p-2.5 text-left dir-ltr">النقاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamPerformance.map((item, idx) => (
                    <tr key={item.member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-2.5 font-bold">
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                      </td>
                      <td className="p-2.5 flex items-center gap-2">
                        <img src={item.member.avatar} alt={item.member.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-bold text-slate-800">{item.member.name}</span>
                      </td>
                      <td className="p-2.5 text-slate-500">{item.member.department}</td>
                      <td className="p-2.5 font-bold text-emerald-700">{item.completedCount} مهام</td>
                      <td className="p-2.5 font-mono text-slate-700">{item.loggedHours} س</td>
                      <td className="p-2.5 font-black text-amber-700 text-left dir-ltr">{item.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden in Print) */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم نسخ التقرير للواتساب!' : 'نسخ التقرير للواتساب 📋'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير PDF 🖨️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
