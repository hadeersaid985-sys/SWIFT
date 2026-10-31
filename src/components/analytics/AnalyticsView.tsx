import React from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users,
  Download,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const AnalyticsView: React.FC = () => {
  const { tasks, team, deals, leads } = useCRM();

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate < today && t.status !== 'completed';
  }).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalWonDeals = deals.filter(d => d.stage === 'مغلقة ناجحة');
  const wonAmount = totalWonDeals.reduce((sum, d) => sum + d.value, 0);

  // Department tasks
  const deptData = [
    { name: 'المبيعات', total: tasks.filter(t => t.category === 'مبيعات').length, color: 'bg-blue-500' },
    { name: 'التطوير والتقنية', total: tasks.filter(t => t.category === 'تقني').length, color: 'bg-emerald-500' },
    { name: 'التسويق', total: tasks.filter(t => t.category === 'تسويق').length, color: 'bg-purple-500' },
    { name: 'خدمة العملاء', total: tasks.filter(t => t.category === 'دعم').length, color: 'bg-amber-500' },
    { name: 'الإدارة والمالية', total: tasks.filter(t => t.category === 'إداري').length, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              التقارير والتحليلات البيانية (CRM Reports & Analytics)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              مؤشرات الأداء الرئيسية (KPIs)، كفاءة مواعيد التسليم، وإنتاجية أعضاء الفريق
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>تصدير تقرير PDF / طباعة</span>
        </button>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-bold">نسبة إنجاز المهام الكلية</span>
          <div className="text-3xl font-black text-blue-600 mt-1">{taskCompletionRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {completedTasks} من أصل {totalTasks} مهام مسجلة
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-bold">إجمالي مبيعات الصفقات الرابحة</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            {wonAmount.toLocaleString()} ج.م
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            تم إغلاق {totalWonDeals.length} صفقات بنجاح
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-bold">المهام المتأخرة عن الموعد</span>
          <div className="text-3xl font-black text-rose-600 mt-1">{overdueTasks}</div>
          <div className="text-[11px] text-rose-500 mt-1 font-semibold">
            {overdueTasks > 0 ? 'تتطلب التدخل الفوري' : 'جميع المهام في مسارها'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-bold">معدل تحويل العملاء المحتملين</span>
          <div className="text-3xl font-black text-purple-600 mt-1">
            {leads.length > 0
              ? Math.round((leads.filter(l => l.status === 'مؤهل').length / leads.length) * 100)
              : 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">من الزوار إلى صفقات معتمدة</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tasks by Department */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">
              توزيع المهام ومواعيدها حسب الأقسام
            </h3>
            <span className="text-xs text-slate-400">إجمالي {totalTasks} تاسك</span>
          </div>

          <div className="space-y-3 pt-2">
            {deptData.map(d => {
              const pct = totalTasks > 0 ? Math.round((d.total / totalTasks) * 100) : 0;
              return (
                <div key={d.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{d.name}</span>
                    <span className="text-slate-500">{d.total} مهمة ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${d.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Team Performance Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">
              لوحة الصدارة وإنتاجية أعضاء الفريق (Leaderboard)
            </h3>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-3">
            {team.map((member, index) => {
              const memberTasks = tasks.filter(t => t.assignedToId === member.id);
              const done = memberTasks.filter(t => t.status === 'completed').length;
              const pending = memberTasks.filter(t => t.status !== 'completed').length;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800'
                          : index === 1
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900">{member.name}</div>
                      <div className="text-[10px] text-slate-500">{member.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">{done} منجزة</div>
                      <div className="text-[10px] text-slate-400">{pending} جارية</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
