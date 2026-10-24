import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
  Edit3,
  Sliders,
  Palette,
  Eye,
  Trash2,
  Globe
} from 'lucide-react';
import { useCRM, DEFAULT_BRAND_CONFIG } from '../../context/CRMContext';
import { SwiftMyndLogo } from '../common/SwiftMyndLogo';
import { BrandConfig } from '../../types/crm';

export const BrandSettingsModal: React.FC = () => {
  const {
    isBrandModalOpen,
    setIsBrandModalOpen,
    brandConfig,
    updateBrandConfig,
    resetBrandConfig,
    currentUser
  } = useCRM();

  const isManager = currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'manager' || currentUser.id === 'user-1';

  // Local form state
  const [formData, setFormData] = useState<BrandConfig>(brandConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Sync when modal opens
  useEffect(() => {
    if (isBrandModalOpen) {
      setFormData(brandConfig);
      setSavedSuccess(false);
    }
  }, [isBrandModalOpen, brandConfig]);

  if (!isBrandModalOpen) return null;

  // Handle logo image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) {
        setFormData(prev => ({
          ...prev,
          logoType: 'custom_image',
          customLogoUrl: result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Favicon file upload ("حط اوبشن احط صوره favicon")
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('حجم أيقونة الفافيكون كبير، يرجى اختيار ملف أقل من 1 ميجابايت');
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

  const handleSave = () => {
    updateBrandConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsBrandModalOpen(false);
    }, 900);
  };

  const handleRestoreDefault = () => {
    if (window.confirm('هل تريد استعادة شعار سويفت الأصلي واسم النظام الافتراضي؟')) {
      resetBrandConfig();
      setFormData(DEFAULT_BRAND_CONFIG);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsBrandModalOpen(false);
      }, 900);
    }
  };

  const colorPresets = [
    { name: 'سويفت كلاسيك', primary: '#0284c7', secondary: '#1e3a8a' },
    { name: 'نيلي ملكي', primary: '#4f46e5', secondary: '#312e81' },
    { name: 'زمردي أعمال', primary: '#059669', secondary: '#064e3b' },
    { name: 'سويفت برتقالي', primary: '#ea580c', secondary: '#7c2d12' },
    { name: 'تيتانيوم أسود', primary: '#334155', secondary: '#0f172a' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#172033] via-slate-900 to-[#172033] text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-500/30">
              <Sliders className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  تعديل شعار وهوية سويفت (إعدادات المدير / الأدمن)
                </h3>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-md text-[10px] font-black border border-blue-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>Admin Access</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                تخصيص اسم المنظومة، شعار سويفت، رفع لوجو مخصص للشركة، وتعديل الشارة والوصف
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBrandModalOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {!isManager ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto" />
              <div className="font-bold text-sm">صلاحية المدير مطلوبة</div>
              <p className="text-xs text-amber-800">
                فقط حساب المدير أو الأدمن يمتلك صلاحية تعديل اسم المنظومة وشعار سويفت.
              </p>
            </div>
          ) : (
            <>
              {/* Live Preview Box */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>معاينة فورية للشعار الجديد (Live Preview):</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Light Mode Preview (TopNavbar) */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold">معاينة في الشريط العلوي (وضع نهاري):</span>
                    <div className="py-2 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <SwiftMyndLogo
                        variant="full"
                        size="md"
                        isDark={false}
                        brandConfigOverride={formData}
                      />
                    </div>
                  </div>

                  {/* Dark Mode Preview (Sidebar) */}
                  <div className="p-3.5 bg-[#172033] border border-slate-700 rounded-xl shadow-2xs flex flex-col justify-between space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold">معاينة في القائمة الجانبية (وضع ليلي):</span>
                    <div className="py-2 flex items-center justify-center bg-[#0d1322] rounded-lg border border-dashed border-slate-700">
                      <SwiftMyndLogo
                        variant="full"
                        size="md"
                        isDark={true}
                        brandConfigOverride={formData}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Source Selector */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="font-black text-slate-800 block text-xs">
                  اختر نوع الشعار (Logo Type):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoType: 'default' }))}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                      formData.logoType === 'default'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">شعار سويفت الافتراضي الأصلي</div>
                      <div className="text-[10px] text-slate-500 font-normal">أيقونة SM المتدرجة الاحترافية</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoType: 'custom_image' }))}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                      formData.logoType === 'custom_image'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">رفع لوجو خاص بشركتك</div>
                      <div className="text-[10px] text-slate-500 font-normal">صورة PNG أو SVG أو JPG</div>
                    </div>
                  </button>
                </div>

                {/* If custom image selected */}
                {formData.logoType === 'custom_image' && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-3 animate-in fade-in">
                    {/* Display Mode Switcher */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-800 block">
                        نمط ظهور الشعار في الموقع:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logoDisplayMode: 'full_image_only' }))}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            formData.logoDisplayMode === 'full_image_only' || !formData.logoDisplayMode
                              ? 'border-blue-600 bg-blue-50/70 font-bold text-blue-950 ring-2 ring-blue-300'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="font-extrabold text-xs">🖼️ شعار كامل (صورة مدمجة)</div>
                          <div className="text-[10px] text-slate-500 font-normal">عرض صورتك كما هي كشعار رئيسي</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logoDisplayMode: 'icon_and_text' }))}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            formData.logoDisplayMode === 'icon_and_text'
                              ? 'border-blue-600 bg-blue-50/70 font-bold text-blue-950 ring-2 ring-blue-300'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="font-extrabold text-xs">🧩 رمز / أيقونة + كتابة الاسم</div>
                          <div className="text-[10px] text-slate-500 font-normal">عرض صورتك كأيقونة بجانب الاسم المكتوب</div>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>اختر صورة اللوجو من جهازك</span>
                      </button>

                      {formData.customLogoUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={formData.customLogoUrl}
                            alt="Custom Logo"
                            className="w-10 h-10 object-contain rounded-lg border bg-white p-1"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, customLogoUrl: '', logoType: 'default' }))}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="حذف الصورة والعودة لشعار سويفت"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">أو أدخل رابط الصورة مباشرة (URL):</span>
                      <input
                        type="url"
                        value={formData.customLogoUrl || ''}
                        onChange={e => setFormData(prev => ({ ...prev, customLogoUrl: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500 text-left"
                        dir="ltr"
                      />
                    </div>

                    {/* Quick Button for Chat Attached Image */}
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-center justify-between gap-2">
                      <span className="text-[11px] text-blue-900 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>استخدام الشعار المرفق بالمحادثة</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            customLogoUrl: '/assets/aistudio/image_03195a0b.png',
                            logoType: 'custom_image',
                            logoDisplayMode: 'full_image_only'
                          }))
                        }
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        تطبيق الشعار المرفق
                      </button>
                    </div>

                    {/* Height Slider */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>ارتفاع اللوجو:</span>
                        <span className="font-mono text-blue-600">{formData.customLogoHeight || 38}px</span>
                      </div>
                      <input
                        type="range"
                        min={24}
                        max={60}
                        step={2}
                        value={formData.customLogoHeight || 38}
                        onChange={e => setFormData(prev => ({ ...prev, customLogoHeight: Number(e.target.value) }))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Brand Name Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>اسم النظام / العلامة التجارية (Brand Name):</span>
                  <span className="text-[10px] text-slate-400 font-normal">يظهر بجوار اللوجو</span>
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={e => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  placeholder="مثال: SWIFTMYND أو سويفت"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-blue-500"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">اقتراحات سريعة:</span>
                  {['SWIFTMYND', 'SWIFT', 'سويفت مايند', 'Swift Tasks'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, brandName: preset }))}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge & Subtitle Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Badge Text */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    نص الشارة الصغيرة (Badge):
                  </label>
                  <input
                    type="text"
                    value={formData.brandBadge}
                    onChange={e => setFormData(prev => ({ ...prev, brandBadge: e.target.value }))}
                    placeholder="سويفت"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">تظهر كشارة ملونة بجوار الاسم</span>
                </div>

                {/* Subtitle */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    الوصف الإضافي (Subtitle):
                  </label>
                  <input
                    type="text"
                    value={formData.brandSubtitle}
                    onChange={e => setFormData(prev => ({ ...prev, brandSubtitle: e.target.value }))}
                    placeholder="نظام مهام ومتابعة الفريق"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">يظهر تحت الاسم في الشريط أو القائمة</span>
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  <span>تدرج ألوان هوية سويفت:</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {colorPresets.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        primaryColor: preset.primary,
                        secondaryColor: preset.secondary
                      }))}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        formData.primaryColor === preset.primary
                          ? 'border-blue-600 bg-blue-50/80 font-bold shadow-2xs ring-1 ring-blue-300'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                      />
                      <span className="text-[11px] text-slate-800">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Favicon Customization Section ("حط اوبشن احط صوره favicon") */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 flex items-center gap-2 text-xs">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>صورة وأيقونة المتصفح (Favicon):</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold">تظهر في علامة تبويب المتصفح</span>
                </div>

                {/* Simulated Browser Tab Live Preview */}
                <div className="bg-slate-200/80 p-2 rounded-xl flex items-center">
                  <div className="bg-white px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-2 border border-slate-300/80 max-w-xs">
                    {formData.customFaviconUrl ? (
                      <img
                        src={formData.customFaviconUrl}
                        alt="Favicon Preview"
                        className="w-4 h-4 object-contain rounded shrink-0"
                      />
                    ) : (
                      <SwiftMyndLogo variant="icon" size="xs" />
                    )}
                    <span className="text-[11px] font-bold text-slate-800 truncate max-w-[160px]">
                      {formData.brandName || 'سويفت مايند'} | {formData.brandBadge || 'سويفت'}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-auto">✕</span>
                  </div>
                </div>

                {/* Upload & Direct URL Controls */}
                <div className="space-y-2 pt-1">
                  <input
                    type="file"
                    ref={faviconInputRef}
                    accept="image/*,.ico,.png,.svg,.jpg"
                    onChange={handleFaviconUpload}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                      className="w-full sm:w-auto px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة Favicon من جهازك</span>
                    </button>

                    {formData.customFaviconUrl && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <img
                          src={formData.customFaviconUrl}
                          alt="Current Favicon"
                          className="w-8 h-8 object-contain rounded-lg border bg-white p-1 shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, customFaviconUrl: '' }))}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer text-[11px] font-bold flex items-center gap-1"
                          title="حذف واستعادة الأيقونة الافتراضية"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>إلغاء Favicon</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">أو أدخل رابط أيقونة الـ Favicon مباشرة (URL):</span>
                    <input
                      type="url"
                      value={formData.customFaviconUrl || ''}
                      onChange={e => setFormData(prev => ({ ...prev, customFaviconUrl: e.target.value }))}
                      placeholder="https://example.com/favicon.ico أو صورة PNG"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Security PIN */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>رمز أمان الأدمن (Admin PIN):</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono">الافتراضي: 8899</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  يمنع الموظفين من دخول حساب المدير ويُطلب عند التحويل من وضع الموظف.
                </p>
                <input
                  type="text"
                  value={formData.adminPin || '8899'}
                  onChange={e => setFormData(prev => ({ ...prev, adminPin: e.target.value }))}
                  placeholder="8899"
                  maxLength={10}
                  className="w-36 p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-center tracking-widest text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          {/* Success Notification */}
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>تم حفظ وتطبيق لوجو وهوية سويفت بنجاح في كامل المنظومة! ✨</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleRestoreDefault}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة شعار سويفت الأصلي</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsBrandModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold rounded-xl cursor-pointer text-xs"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={!isManager}
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>حفظ وتطبيق التعديل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
