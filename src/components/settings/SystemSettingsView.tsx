import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Globe,
  Sliders,
  Palette,
  Eye,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Layout,
  Layers,
  DollarSign,
  Monitor,
  Smartphone,
  ExternalLink,
  Save,
  AlertCircle,
  Database,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileJson,
  Info,
  HelpCircle,
  FolderDown,
  FileCheck,
  FolderGit2
} from 'lucide-react';
import { useCRM, DEFAULT_BRAND_CONFIG } from '../../context/CRMContext';
import { SwiftMyndLogo } from '../common/SwiftMyndLogo';
import { BrandConfig } from '../../types/crm';

export const SystemSettingsView: React.FC = () => {
  const {
    brandConfig,
    updateBrandConfig,
    resetBrandConfig,
    currentUser,
    isManager,
    team,
    tasks,
    leads,
    deals,
    clientRenewals,
    exportSystemBackup,
    importSystemBackup,
    setIsGitHubModalOpen
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'logo_favicon' | 'colors' | 'general' | 'preview' | 'backup'>('logo_favicon');
  const [formData, setFormData] = useState<BrandConfig>(brandConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [faviconUrlInput, setFaviconUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const res = importSystemBackup(content);
        if (res.success) {
          setImportStatus({ type: 'success', message: res.message });
        } else {
          setImportStatus({ type: 'error', message: res.message });
        }
        setTimeout(() => setImportStatus({ type: null, message: '' }), 6000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Synchronize state with context
  useEffect(() => {
    setFormData(brandConfig);
    if (brandConfig.customLogoUrl && !brandConfig.customLogoUrl.startsWith('data:')) {
      setLogoUrlInput(brandConfig.customLogoUrl);
    }
    if (brandConfig.customFaviconUrl && !brandConfig.customFaviconUrl.startsWith('data:')) {
      setFaviconUrlInput(brandConfig.customFaviconUrl);
    }
  }, [brandConfig]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم صورة اللوجو كبير، يرجى اختيار ملف أقل من 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) {
        setFormData(prev => ({
          ...prev,
          logoType: 'custom_image',
          customLogoUrl: result,
          logoDisplayMode: prev.logoDisplayMode || 'full_image_only'
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Favicon Upload (FAVICON)
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('حجم أيقونة الفافيكون كبير، يرجى اختيار صورة أقل من 1 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) {
        setFormData(prev => ({
          ...prev,
          customFaviconUrl: result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save all settings to CRMContext and localStorage
  const handleSave = () => {
    updateBrandConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Reset to default
  const handleReset = () => {
    if (confirm('هل ترغب في استعادة إعدادات اللوجو والألوان الأصلية للمنظومة؟')) {
      resetBrandConfig();
      setFormData(DEFAULT_BRAND_CONFIG);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Preset Colors for Quick Picking
  const primaryColorPresets = [
    { name: 'أزرق كحلي سويفت', hex: '#0284c7' },
    { name: 'أزرق ملكي كلاسيك', hex: '#2563eb' },
    { name: 'نيلي داكن موقر', hex: '#4f46e5' },
    { name: 'زمردي راقي', hex: '#059669' },
    { name: 'عنبري دافئ', hex: '#ea580c' },
    { name: 'بنفسجي ملكي', hex: '#7c3aed' },
    { name: 'رمادي احترافي تيتانيوم', hex: '#475569' },
    { name: 'وردي ياقوتي', hex: '#e11d48' }
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-slate-700/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Settings className="w-5 h-5" />
              </span>
              <span className="text-xs bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>إعدادات وهوية السيستم الشاملة</span>
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold px-2.5 py-0.5 rounded-full">
                صلاحية المدير العام 🔒
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              إعدادات السيستم: تعديل اللوجو، الاسم، ألوان المنظومة، وأيقونة FAVICON
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              سكشن مخصص للأدمن للتحكم الكامل بهوية النظام؛ يمكنك تخصيص اسم الشركة، رفع لوجو رسمي، ضبط ألوان الواجهة، ورفع أيقونة الفافيكون لتبويب المتصفح.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
            >
              <Save className="w-4 h-4" />
              <span>حفظ كل الإعدادات</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-600 transition-all cursor-pointer flex items-center gap-1.5"
              title="استعادة الإعدادات الأصلية الافتراضية"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة الأصلي</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 flex items-center gap-2 animate-in slide-in-from-top">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تم حفظ وتطبيق كافة إعدادات اللوجو والاسم والألوان وفافيكون المتصفح بنجاح! ✅</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('logo_favicon')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'logo_favicon'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>تعديل اللوجو وأيقونة الفافيكون (FAVICON) 🎨</span>
        </button>

        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'colors'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>ألوان وهوية السيستم والثيمات 🌈</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>الاسم وعناوين السيستم والعملات 🏢</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>معاينة حية للمتصفح والسايدبار 👁️</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Database className="w-4 h-4 text-amber-600" />
          <span>النسخ الاحتياطي وتصدير/استيراد البيانات 💾</span>
        </button>
      </div>

      {/* TAB 1: LOGO & FAVICON */}
      {activeTab === 'logo_favicon' && (
        <div className="space-y-6">
          {/* Quick Notice Banner */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
            <span className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div className="text-xs">
              <h4 className="font-extrabold text-slate-900 text-sm">
                تغيير اللوجو في الموقع كله من هنا (شامل كافة الصفحات)
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                أي تعديل تقوم به هنا يُطبق فورياً وبشكل دائم على: <strong>الشريط العلوي (TopNavbar)</strong>، <strong>القائمة الجانبية (Sidebar)</strong>، <strong>الصفحة التعريفية الرئيسية (Landing Page)</strong>، <strong>شاشة تسجيل الدخول (Login Page)</strong>، و<strong>أيقونة تبويب المتصفح (Favicon)</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Main Logo Settings Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>اللوجو الرئيسي للمنظومة (System Logo)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    اختر بين الشعار الافتراضي أو رفع صورة شعار شركتك
                  </p>
                </div>

                {/* Logo Type Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoType: 'default', customLogoUrl: '' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formData.logoType === 'default'
                        ? 'bg-white text-blue-700 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    اللوجو الافتراضي
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        logoType: 'custom_image',
                        logoDisplayMode: formData.logoDisplayMode || 'full_image_only'
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formData.logoType === 'custom_image'
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    شعار مخصص
                  </button>
                </div>
              </div>

              {/* If Custom Logo is Selected */}
              {formData.logoType === 'custom_image' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* 1. Display Mode: Full Logo Image VS Icon + Brand Text */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-800">
                      نمط ظهور الشعار في الموقع (Logo Display Mode):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoDisplayMode: 'full_image_only' })}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                          formData.logoDisplayMode === 'full_image_only' || !formData.logoDisplayMode
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                            <span>🖼️</span>
                            <span>شعار كامل (صورة مدمجة)</span>
                          </span>
                          {(formData.logoDisplayMode === 'full_image_only' || !formData.logoDisplayMode) && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          الصورة تحتوي على الرمز واسم شركتك معاً. سيتم إظهار صورتك مباشرة كشعار متكامل دون تكرار كتابة النص بجانبها.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoDisplayMode: 'icon_and_text' })}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                          formData.logoDisplayMode === 'icon_and_text'
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                            <span>🧩</span>
                            <span>أيقونة رمزية + كتابة الاسم</span>
                          </span>
                          {formData.logoDisplayMode === 'icon_and_text' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          يتم استخدام الصورة كرمز أو أيقونة بجانب اسم المنظومة والشعار النصي القابل للتعديل.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 2. Upload File Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-800">
                      رفع ملف صورة اللوجو من جهازك:
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80 p-5 rounded-2xl text-center transition-all cursor-pointer space-y-2"
                    >
                      <Upload className="w-7 h-7 text-blue-600 mx-auto" />
                      <div className="font-bold text-slate-800 text-xs">
                        انقر لاختيار صورة اللوجو الجديد أو اسحب الملف هنا
                      </div>
                      <div className="text-[10px] text-slate-500">
                        صيغ مدعومة: PNG (خلفية شفافة يفضل), SVG, JPG, WebP | الحجم الأقصى 5MB
                      </div>
                    </div>
                  </div>

                  {/* 3. Or Paste Image URL */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      أو أدخل رابط صورة مباشر (Image URL):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={logoUrlInput}
                        onChange={e => setLogoUrlInput(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-500"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (logoUrlInput.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              logoType: 'custom_image',
                              customLogoUrl: logoUrlInput.trim()
                            }));
                          }
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                      >
                        تطبيق الرابط
                      </button>
                    </div>
                  </div>

                  {/* 4. Quick Preset: Use Attached Logo from Chat */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-700">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>هل ترغب باستخدام الشعار المرفق في المحادثة؟</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sampleUrl = '/assets/aistudio/image_03195a0b.png';
                        setFormData(prev => ({
                          ...prev,
                          logoType: 'custom_image',
                          customLogoUrl: sampleUrl,
                          logoDisplayMode: 'full_image_only'
                        }));
                        setLogoUrlInput(sampleUrl);
                      }}
                      className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      تجربة الصورة المرفقة
                    </button>
                  </div>

                  {/* 5. Logo Height Slider */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>ارتفاع وحجم اللوجو (Logo Height):</span>
                      <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {formData.customLogoHeight || 38}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={64}
                      step={2}
                      value={formData.customLogoHeight || 38}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          customLogoHeight: Number(e.target.value)
                        })
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>صغير (24px)</span>
                      <span>افتراضي متوازن (38px)</span>
                      <span>كبير بارز (64px)</span>
                    </div>
                  </div>

                  {/* Remove custom logo button */}
                  {formData.customLogoUrl && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            customLogoUrl: '',
                            logoType: 'default'
                          })
                        }
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الصورة والعودة لشعار سويفت الافتراضي</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Dual Preview & Favicon Column */}
            <div className="space-y-5">
              {/* Dual Live Preview Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>المعاينة المباشرة للشعار (Live Previews)</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    مباشر وفوري
                  </span>
                </div>

                {/* Dark Background Preview (Landing Page, Sidebar, Login) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>1. على الخلفيات الداكنة (الصفحة التعريفية، السايدبار، شاشة الدخول):</span>
                    <span className="text-slate-400 font-mono text-[10px]">Dark Preview</span>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-white overflow-hidden shadow-inner min-h-[70px]">
                    <SwiftMyndLogo
                      brandConfigOverride={formData}
                      size="md"
                      isDark={true}
                      allowAdminEdit={false}
                    />
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md font-mono">
                      Header / Sidebar
                    </span>
                  </div>
                </div>

                {/* Light Background Preview (TopNavbar, Internal Pages) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>2. على الخلفيات الفاتحة (شريط التوب بار وصفحات الإدارة):</span>
                    <span className="text-slate-400 font-mono text-[10px]">Light Preview</span>
                  </div>
                  <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-slate-900 overflow-hidden min-h-[70px]">
                    <SwiftMyndLogo
                      brandConfigOverride={formData}
                      size="md"
                      isDark={false}
                      allowAdminEdit={false}
                    />
                    <span className="text-[10px] bg-white text-slate-600 px-2 py-1 rounded-md border border-slate-200 font-mono">
                      TopNavbar
                    </span>
                  </div>
                </div>
              </div>

              {/* Favicon Settings Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      <span>لوجو وأيقونة المتصفح (Favicon)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      الأيقونة المصغرة التي تظهر في شريط علامات التبويب لمتصفح Chrome وEdge
                    </p>
                  </div>

                  {formData.customFaviconUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customFaviconUrl: '' })}
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>استعادة الافتراضي</span>
                    </button>
                  )}
                </div>

                {/* Chrome Browser Tab Simulation */}
                <div className="bg-slate-200/80 p-3 rounded-2xl space-y-2">
                  <span className="text-[10px] text-slate-600 font-bold block">
                    محاكاة شكل تبويب المتصفح (Chrome Tab Preview):
                  </span>

                  <div className="bg-white rounded-t-xl px-3 py-2 flex items-center gap-2 max-w-sm shadow-xs border border-slate-300/80">
                    {formData.customFaviconUrl ? (
                      <img
                        src={formData.customFaviconUrl}
                        alt="Favicon"
                        className="w-4 h-4 rounded-xs object-contain"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-xs bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">
                        S
                      </div>
                    )}
                    <span className="font-extrabold text-slate-800 text-[11px] truncate flex-1">
                      {formData.brandName || 'SWIFTMYND'} | نظام المهام والمبيعات
                    </span>
                    <span className="text-slate-400 text-[10px]">✕</span>
                  </div>
                </div>

                {/* Favicon Upload and URL Input */}
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={faviconInputRef}
                    onChange={handleFaviconUpload}
                    accept="image/png, image/x-icon, image/svg+xml, image/jpeg"
                    className="hidden"
                  />

                  <div
                    onClick={() => faviconInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 p-4 rounded-xl text-center transition-all cursor-pointer space-y-1.5"
                  >
                    <Globe className="w-6 h-6 text-indigo-600 mx-auto" />
                    <div className="font-bold text-slate-800 text-xs">
                      انقر لرفع أيقونة الفافيكون (PNG أو ICO أو SVG)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      مقاس موصى به: 32×32 أو 64×64 بكسل
                    </div>
                  </div>

                  {/* Or use main logo as favicon */}
                  {formData.customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customFaviconUrl: formData.customLogoUrl })}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      استخدام صورة اللوجو المرفوعة كأيقونة فافيكون للمتصفح أيضاً
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM COLORS & THEME */}
      {activeTab === 'colors' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>ألوان وثيم السيستم (System Colors & Palette)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              حدد اللون الأساسي للأزرار والأيقونات والعناصر النشطة بما يتناسب مع هوية شركتك.
            </p>
          </div>

          {/* Quick Presets Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">باقات ألوان سريعة وجاهزة:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {primaryColorPresets.map(preset => {
                const isSelected = formData.primaryColor === preset.hex;
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryColor: preset.hex })}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-right ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-lg shrink-0 shadow-2xs"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-[11px] truncate">{preset.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{preset.hex}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">اللون الأساسي (Primary Color):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor || '#0284c7'}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.primaryColor || '#0284c7'}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">اللون الثانوي (Secondary Color):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor || '#1e3a8a'}
                  onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.secondaryColor || '#1e3a8a'}
                  onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">لون التمييز (Accent Color):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor || '#f59e0b'}
                  onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.accentColor || '#f59e0b'}
                  onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM NAME & GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>اسم المنظومة والعناوين والعملات (Brand Name & Defaults)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تغيير اسم النظام، الشعار المكتوب، وعملة التداولات والاشتراكات.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم السيستم الرئيسي (Brand Name):</label>
              <input
                type="text"
                value={formData.brandName}
                onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="مثال: SWIFTMYND أو ظاهرلي"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الشعار والوصف الفرعي (Tagline / Subtitle):</label>
              <input
                type="text"
                value={formData.brandSubtitle}
                onChange={e => setFormData({ ...formData, brandSubtitle: e.target.value })}
                placeholder="مثال: نظام مهام ومتابعة الفريق"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الشارة النصية (Brand Badge):</label>
              <input
                type="text"
                value={formData.brandBadge}
                onChange={e => setFormData({ ...formData, brandBadge: e.target.value })}
                placeholder="مثال: سويفت أو ظاهرلي"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">العملة الافتراضية للسيستم (Default Currency):</label>
              <select
                value={formData.systemCurrency || 'ج.م'}
                onChange={e => setFormData({ ...formData, systemCurrency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ج.م">جنيه مصري (ج.م - EGP) 🇪🇬</option>
                <option value="ر.س">ريال سعودي (ر.س - SAR)</option>
                <option value="د.ك">دينار كويتي (د.ك - KWD)</option>
                <option value="$">دولار أمريكي ($ - USD)</option>
                <option value="د.إ">درهم إماراتي (د.إ - AED)</option>
              </select>
            </div>

            {/* سكشن رمز أمان الأدمن وعزل الموظف */}
            <div className="sm:col-span-2 pt-3 border-t border-slate-100">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>رمز أمان الأدمن (Admin PIN) لمنع دخول الموظفين لحساب المدير:</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  عند الانتقال لوضع الموظف، يتم عزل جميع الشاشات الإدارية ولا يستطيع الموظف العودة لوضع المدير العام أو فتح أي بيانات حساسة إلا بعد إدخال رمز الأمان السري هذا.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">رمز PIN الحالي للأدمن:</label>
                    <input
                      type="text"
                      value={formData.adminPin || '8899'}
                      onChange={e => setFormData({ ...formData, adminPin: e.target.value })}
                      placeholder="8899"
                      maxLength={10}
                      className="w-44 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-amber-600 text-center tracking-widest shadow-2xs"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 pt-4">
                    الرمز الافتراضي: <strong className="font-mono text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">8899</strong> (يمكنك تغييره لأي رمز تريده والضغط على حفظ الإعدادات)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>المعاينة الحية الفورية للسيستم بعد تطبيق الإعدادات</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              هكذا ستظهر واجهة النظام للجميع بالألوان واللوجو والاسم الذي اخترته.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Mock Topbar */}
            <div
              className="p-3 text-white flex items-center justify-between"
              style={{ backgroundColor: formData.primaryColor || '#0284c7' }}
            >
              <div className="flex items-center gap-3">
                <SwiftMyndLogo
                  brandConfigOverride={formData}
                  size="sm"
                  isDark={true}
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {formData.systemCurrency || 'ج.م'}
                </span>
                <span className="font-bold">{currentUser.name}</span>
              </div>
            </div>

            {/* Mock Content */}
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{formData.brandName || 'سويفت مايند'}</h4>
                  <p className="text-slate-500 text-xs mt-0.5">{formData.brandSubtitle}</p>
                </div>

                <button
                  style={{ backgroundColor: formData.primaryColor || '#0284c7' }}
                  className="px-4 py-2 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  زر تجربة الهوية
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BACKUP & DATA EXPORT / IMPORT */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Status Alert if Import Done */}
          {importStatus.type && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-bold text-xs">{importStatus.message}</span>
            </div>
          )}

          {/* Top Banner Notice */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 p-5 rounded-2xl flex items-start gap-3.5">
            <span className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
              <Database className="w-6 h-6" />
            </span>
            <div className="text-xs">
              <h3 className="font-extrabold text-amber-950 text-sm">
                مركز النسخ الاحتياطي وتصدير واستيراد بيانات السيستم (Backup & Data Safety)
              </h3>
              <p className="text-amber-800 mt-1 leading-relaxed">
                هنا يمكنك تنزيل نسخة احتياطية كاملة (Full Backup JSON) تضم كافة موظفي الفريق، أرقامهم، باسورداتهم، مهامهم، صفقاتهم، وتجديدات العقود. كما يمكنك استيراد النسخة في أي وقت بنقرة واحدة لضمان عدم مسح أو فقدان أي داتا حتى لو قمتِ بإعادة نشر السيستم على الدومين (<strong>tazkoraio.com</strong>).
              </p>
            </div>
          </div>

          {/* Overview of Stored Data Ready for Export */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-slate-400 font-bold text-[11px]">فريق العمل والحسابات</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{team.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">موظف باليوزرات والباسوردات والأرقام</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-slate-400 font-bold text-[11px]">المهام وسجلات الوقت</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{tasks.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">مهمة عمل مع المؤقتات وسجل الفترات</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-slate-400 font-bold text-[11px]">العملاء وتجديدات الاشتراكات</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{clientRenewals.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">عقد اشتراك وملفات وملاحظات العملاء</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-slate-400 font-bold text-[11px]">الصفقات والعملاء المحتملين</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{deals.length + leads.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{deals.length} صفقة + {leads.length} ليد مسجل</div>
            </div>
          </div>

          {/* Featured: Direct GitHub Sync Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shrink-0">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-white">تصدير واستيراد أحدث نسخة عبر GitHub (حفظ الداتا من المسح)</h4>
                  <span className="text-[10px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full font-bold font-mono">
                    hadeersaid985-sys/SWIFT
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  تتيح لكِ هذه الميزة حفظ نسخة طبق الأصل من كافة بياناتك (الموظفين الـ 9، التاسكات، الصفقات، الإعدادات) مباشرة في مستودع GitHub الخاص بكِ، واستعادتها في ثوانٍ حتى لا تُمسح أي داتا أبداً بعد أي Deploy أو تحديث على الموقع.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGitHubModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer shrink-0 flex items-center gap-2 hover:scale-[1.02]"
            >
              <FolderGit2 className="w-4 h-4 text-slate-950" />
              <span>فتح نافذة مزامنة GitHub 🚀</span>
            </button>
          </div>

          {/* Action Boxes: Export vs Import */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: Export Full Backup */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ArrowDownToLine className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  1. تصدير نسخة احتياطية كاملة (Export Backup)
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  يقوم بتنزيل ملف <strong>.JSON</strong> آمن يحتوي على كافة بيانات النظام بالكامل (الحسابات، الباسوردات، أرقام الواتساب، المهام، الصفقات، وهوية اللوجو). يمكنك الاحتفاظ بهذا الملف على جهازك قبل عمل أي تحديثات.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>جاهز للتنزيل المباشر فوراً</span>
                  </div>
                  <div>اسم الملف التلقائي: <code className="font-mono text-blue-600">tazkora-crm-backup-[التاريخ].json</code></div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => exportSystemBackup()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>تنزيل وتصدير النسخة الاحتياطية الآن (JSON)</span>
                </button>
              </div>
            </div>

            {/* Box 2: Import & Restore Backup */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ArrowUpFromLine className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  2. استيراد واسترجاع النسخة الاحتياطية (Import & Restore)
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  إذا قمتِ بإعادة نشر السيستم أو الدخول من جهاز جديد، يمكنك رفع ملف النسخة الاحتياطية الذي قمتِ بتنزيله سابقاً لاستعادة جميع الموظفين والتاسكات فوراً دون الحاجة لإعادة كتابة أي شيء!
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>يدعم أي ملف JSON تم تصديره من المنظومة</span>
                  </div>
                  <div>يقوم بمطابقة وتحديث البيانات فورياً دون حذف موظفيك الـ 9 الأساسيين.</div>
                </div>
              </div>

              <div className="pt-6">
                <input
                  type="file"
                  ref={backupInputRef}
                  onChange={handleImportBackupFile}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => backupInputRef.current?.click()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <ArrowUpFromLine className="w-4 h-4" />
                  <span>اختيار ملف الباك اب واستعادته فوراً (Restore)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guide Section: How to Update on Domain without Losing Data */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <span>دليل الاستخدام: كيف تُجرين التعديلات وتحدثين السيستم على الدومين بدون مسح البيانات؟</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  1
                </div>
                <h5 className="font-extrabold text-white text-xs">الموظفون الـ 9 محفوظون في قلب الكود</h5>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  قمتُ بتثبيت موظفيك الـ 9 (هدير، أميرة، آية، إيمان، مايبل، مريم، يمنى، إسلام، ورؤى) في كود النظام الأساسي مباشرة. فلن يختفوا أبداً حتى عند عمل Deploy أو تحديث.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                  2
                </div>
                <h5 className="font-extrabold text-white text-xs">تصدير الباك اب قبل التعديل الكبير</h5>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  إذا قمتِ بإضافة عملاء أو مهام أو موظفين جدد على الدومين (<strong>tazkoraio.com</strong>)، اضغطي زر <strong>"تصدير نسخة احتياطية"</strong> واحتفظي بالملف.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                  3
                </div>
                <h5 className="font-extrabold text-white text-xs">استيراد النسخة على الرابط المنشور</h5>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  بعد نشر التعديلات أو فتح السيستم، يمكنك الضغط على <strong>"استيراد نسخة احتياطية"</strong> واختيار الملف لتعود كل البيانات والمهام كما كانت تماماً بنقرة زر.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Sticky Bottom Actions Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-lg flex items-center justify-between gap-3">
        <div className="text-slate-500 text-xs">
          جميع التعديلات يتم حفظها فورياً في ذاكرة المنظومة وتطبيقها على حسابات جميع المستخدمين.
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
          >
            <Check className="w-4 h-4" />
            <span>تطبيق وحفظ الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
