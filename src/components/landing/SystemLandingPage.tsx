import React from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
  LogIn,
  BarChart3,
  Calendar,
  Users,
  Briefcase,
  Sun,
  Flame,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { SwiftMyndLogo } from '../common/SwiftMyndLogo';

interface SystemLandingPageProps {
  onGoToLogin: () => void;
}

export const SystemLandingPage: React.FC<SystemLandingPageProps> = ({ onGoToLogin }) => {
  const { brandConfig } = useCRM();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand (Synced with Admin Settings) */}
          <div className="flex items-center">
            <SwiftMyndLogo
              variant="full"
              size="md"
              isDark={true}
              showSubtitle={true}
              allowAdminEdit={false}
            />
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-bold">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              المميزات
            </button>
            <button
              onClick={() => scrollToSection('tasks')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              إدارة المهام
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              الأمان والخصوصية
            </button>
          </nav>

          {/* Login CTA in Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-blue-600/30 flex items-center gap-1.5 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول للمنظومة</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow decorative gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-blue-300 text-xs font-bold mb-6 shadow-xs animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>نظام سحابي متكامل لإدارة ومتابعة فرق العمل والمهام</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight">
            إدارة مهام الفريق وتتبع الإنتاجية
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
              بأعلى معايير الدقة والسرية
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            منظومة رقمية متقدمة تجمع بين بورد المهام التفاعلي، مؤقتات العمل بالدقائق، موجز المهام اليومي (Daily Digest)، وإدارة الصفقات مع عزل تام لحسابات الموظفين.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول إلى حسابك</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>

            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>استكشاف مميزات المنظومة</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Live Preview Mockup Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-2 sm:p-3 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-right">
            <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800">
              {/* Window controls header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>لوحة متابعة المهام اليومية - SwiftMynd Live Dashboard</span>
                </div>
              </div>

              {/* Mockup content grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Card 1: Today Focus */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>موجز المهام اليومي</span>
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                      اليوم
                    </span>
                  </div>
                  <div className="text-xl font-black text-white mt-2">
                    5 مهام <span className="text-xs text-slate-400 font-normal">مجدولة ومتابعة</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">تنبيهات فورية للموظف عند الدخول</p>
                </div>

                {/* Card 2: Time tracking */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>المؤقت المباشر</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="text-xl font-mono font-black text-emerald-400 mt-2">
                    03:42:15
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">احتساب دقيق لزمن كل مهمة</p>
                </div>

                {/* Card 3: Security & Isolation */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-blue-300 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>عزل الحسابات</span>
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                      محمي
                    </span>
                  </div>
                  <div className="text-xl font-black text-white mt-2">
                    خصوصية 100%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">كل موظف يرى مهامه الخاصة فقط</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="bg-slate-900/60 border-y border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">100%</div>
            <div className="text-xs text-slate-400 mt-1">عزل تام لحسابات وبيانات الموظفين</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">بالدقيقة</div>
            <div className="text-xs text-slate-400 mt-1">تتبع واحتساب ساعات العمل للمهام</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">تلقائي</div>
            <div className="text-xs text-slate-400 mt-1">موجز يومي (Daily Digest) عند الدخول</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">سحابي</div>
            <div className="text-xs text-slate-400 mt-1">وصول سريع من أي متصفح وجهاز</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            المميزات والحلول
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
            كل ما تحتاجه لإدارة الفريق وإنجاز المهام
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">
            تم تصميم النظام لتسهيل متابعة وتوزيع المهام بين أعضاء الفريق وضمان تسليم الأعمال في مواعيدها المحددة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">موجز المهام اليومي (Daily Digest)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تنبيه فوري للموظف بمجرد تسجيل الدخول يوضح المهام المتأخرة والمهام المجدولة لليوم الحالي فقط مع إمكانية بدء التايمر أو إنجاز المهمة بنقرة واحدة.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 bg-emerald-600/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">تتبع ساعات العمل بالدقائق</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              مؤقت تشغيل وإيقاف لكل مهمة يسجل أوقات العمل الفعلية بدقة ويحسب الإجمالي مقارنة بالساعات المقدرة للمشروع.
            </p>
          </div>

          {/* Feature 3 */}
          <div id="security" className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 bg-indigo-600/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">عزل كامل لحسابات الموظفين</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              خصوصية مشددة؛ الموظف يرى مهامه المسندة إليه فقط، مع حجب كامل للتقارير الحساسة وبيانات الصفقات أو المهام الإدارية السرية.
            </p>
          </div>

          {/* Feature 4 */}
          <div id="tasks" className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 bg-amber-600/10 text-amber-400 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">بورد مهام تفاعلي وإشعارات المنشن (@)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              إسناد المهام، تحديد الأولويات، تقسيم المهام الفرعية، وإشعارات المنشن الفورية لأعضاء الفريق داخل التعليقات.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 bg-rose-600/10 text-rose-400 rounded-xl flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">إدارة العملاء وتجديد الاشتراكات</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              متابعة صفقات المبيعات، ومواعيد تجديد اشتراكات العملاء مع تنبيهات استباقية للتحصيل والتواصل السريع.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 bg-sky-600/10 text-sky-400 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">تقارير الأداء ومتابعة الإنجاز</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              لوحة تحليلات شاملة للمدير تقيس إنتاجية الموظفين، إجمالي الساعات المسجلة، ونسب إنجاز المشاريع في الوقت المحدد.
            </p>
          </div>
        </div>
      </section>

      {/* Pre-Footer Call to Action */}
      <section className="py-16 bg-gradient-to-b from-slate-950 via-blue-950/40 to-slate-950 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            جاهز لبدء العمل ومتابعة مهامك اليومية؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            سجّل دخولك الآن باستخدام اسم المستخدم وكلمة المرور الخاصة بحسابك للوصول إلى لوحة المهام.
          </p>

          <div className="mt-6">
            <button
              onClick={onGoToLogin}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all cursor-pointer inline-flex items-center gap-2 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول للمنظومة</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SwiftMyndLogo variant="icon" size="sm" isDark={true} />
            <span className="font-bold text-slate-400">{brandConfig?.brandName || 'SWIFTMYND'}</span>
            <span>- كافة الحقوق محفوظة © {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={onGoToLogin} className="hover:text-blue-400 transition-colors cursor-pointer">
              تسجيل الدخول
            </button>
            <span>•</span>
            <span>بوابة الموظفين والإدارة</span>
            <span>•</span>
            <span className="text-slate-600 font-mono">v2.4 Protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
