import React, { useState } from 'react';
import {
  FolderKanban,
  LifeBuoy,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  Plus,
  Building,
  User,
  AlertCircle
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const ProjectsView: React.FC = () => {
  const { team } = useCRM();
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'tickets' | 'inventory'>('projects');

  const sampleProjects = [
    {
      id: 'proj-1',
      name: 'بوابة الخدمات الإلكترونية للعملاء',
      client: 'شركة إعمار المستقبل',
      progress: 68,
      dueDate: '2026-11-15',
      leadMember: 'طارق القحطاني',
      status: 'قيد التنفيذ'
    },
    {
      id: 'proj-2',
      name: 'أتمتة الفواتير وربط منصة فاتورة ZATCA',
      client: 'مجموعة المدى للاستثمار',
      progress: 90,
      dueDate: '2026-10-30',
      leadMember: 'كريم الدسوقي',
      status: 'قيد المراجعة'
    },
    {
      id: 'proj-3',
      name: 'إعادة تصميم الهوية الرقمية ونظام الـ CRM',
      client: 'المؤسسة الداخلية',
      progress: 100,
      dueDate: '2026-10-10',
      leadMember: 'سارة المنصوري',
      status: 'مكتمل'
    }
  ];

  const sampleTickets = [
    {
      id: 'TICK-401',
      title: 'بطء في استيراد جهات الاتصال عبر ملف Excel',
      client: 'بنك الرياض الرقمي',
      priority: 'عالية',
      status: 'مفتوحة',
      assignedTo: 'منى زهران',
      date: 'منذ ساعتين'
    },
    {
      id: 'TICK-402',
      title: 'طلب ترقية عدد مستخدمي رخص النظام إلى 25 مستخدم',
      client: 'مركز التقنية المتقدمة',
      priority: 'متوسطة',
      status: 'قيد المراجعة',
      assignedTo: 'أحمد الشريف',
      date: 'منذ 5 ساعات'
    },
    {
      id: 'TICK-403',
      title: 'استفسار عن طريقة تفعيل التنبيهات عبر SMS',
      client: 'شبكة النقل السريع',
      priority: 'منخفضة',
      status: 'مغلقة ومحلولة',
      assignedTo: 'منى زهران',
      date: 'أمس'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              المشاريع، التذاكر والدعم الفني (Projects & Support)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة تسليم المشاريع للعملاء، تذاكر الدعم الفني، والمخزون الخدمي
            </p>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'projects' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            المشاريع النشطة
          </button>
          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'tickets' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            تذاكر الدعم والخدمة
          </button>
        </div>
      </div>

      {activeSubTab === 'projects' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sampleProjects.map(proj => (
            <div
              key={proj.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full">
                    {proj.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">تسليم: {proj.dueDate}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">{proj.name}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{proj.client}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-500">نسبة الإنجاز:</span>
                  <span className="text-cyan-700">{proj.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-600 h-full rounded-full transition-all"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  المشرف: <strong className="text-slate-700">{proj.leadMember}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">رقم التذكرة</th>
                <th className="py-3 px-4">موضوع الشكوى أو الطلب</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">الأولوية</th>
                <th className="py-3 px-4">المسؤول عن الحل</th>
                <th className="py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleTickets.map(tick => (
                <tr key={tick.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{tick.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{tick.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{tick.client}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        tick.priority === 'عالية'
                          ? 'bg-rose-100 text-rose-700'
                          : tick.priority === 'متوسطة'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tick.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{tick.assignedTo}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                      {tick.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
