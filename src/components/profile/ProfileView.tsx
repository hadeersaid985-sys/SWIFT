import React, { useState, useRef } from 'react';
import {
  User,
  KeyRound,
  Camera,
  Upload,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UserCheck,
  Lock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCRM } from '../../context/CRMContext';
import { TeamMember } from '../../types/crm';

// Preset avatar collection
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'
];

export const ProfileView: React.FC = () => {
  const { currentUser, updateCurrentProfile, tasks, setActiveTab, isManager } = useCRM();

  // Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [avatarMode, setAvatarMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [customUrl, setCustomUrl] = useState('');
  
  // Password State
  const [password, setPassword] = useState(currentUser?.password || '');
  const [confirmPassword, setConfirmPassword] = useState(currentUser?.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Additional Contact Info
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Status & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Stats
  const assignedTasks = tasks.filter(t => t.assignedToId === currentUser?.id);
  const completedTasks = assignedTasks.filter(t => t.status === 'completed');
  const totalLoggedMinutes = assignedTasks.reduce((acc, t) => acc + (t.totalLoggedMinutes || 0), 0);
  const loggedHours = (totalLoggedMinutes / 60).toFixed(1);

  // Handle Local Image Upload (converts to base64 for instant persistent local storage)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('حجم الصورة كبير، يرجى اختيار صورة أقل من 3 ميجابايت.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const base64 = event.target?.result as string;
      if (base64) {
        setAvatar(base64);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Apply Custom URL
  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setAvatar(customUrl.trim());
    setCustomUrl('');
  };

  // Handle Save Profile
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسمك الكامل.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('يرجى تحديد كلمة المرور الخاصة بحسابك.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('كلمة المرور وتأكيد كلمة المرور غير متطابقين، يرجى التأكد وإعادة الكتابة.');
      return;
    }

    setIsSaving(true);

    const updates: Partial<TeamMember> = {
      name: name.trim(),
      avatar: avatar.trim(),
      password: password.trim(),
      phone: phone.trim(),
      email: email.trim(),
      bio: bio.trim()
    };

    updateCurrentProfile(updates);

    // Confetti effect
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    setIsSaving(false);
    setToastMessage('تم حفظ وتحديث الاسم وصورة البروفايل وكلمة المرور بنجاح!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header Banner & Breadcrumb */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <button
              onClick={() => setActiveTab(isManager ? 'home' : 'tasks')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{isManager ? 'الرئيسية' : 'مهام العمل'}</span>
            </button>
            <span>/</span>
            <span className="text-blue-600 font-bold">الملف الشخصي وإعدادات الحساب</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <span>الملف الشخصي وتعديل الحساب</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            يمكنك من هنا تعديل اسمك المعروض، تغيير صورة البروفايل، وتحديث كلمة المرور لحسابك في أي وقت.
          </p>
        </div>

        <button
          onClick={() => setActiveTab(isManager ? 'home' : 'tasks')}
          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          <span>العودة للعمل</span>
        </button>
      </div>

      {/* Toast Feedback Messages */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with Status badge */}
          <div className="relative group shrink-0">
            <img
              src={avatar || currentUser?.avatar}
              alt={currentUser?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white/20 shadow-xl bg-slate-800"
            />
            <span className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white absolute bottom-1 right-1 shadow-xs" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer text-[10px] font-bold"
              title="تغيير الصورة"
            >
              <Camera className="w-5 h-5 text-amber-300" />
              <span>تغيير</span>
            </button>
          </div>

          {/* User Info Details */}
          <div className="flex-1 text-center sm:text-right space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{name || currentUser?.name}</h2>
              <span className="bg-white/20 text-blue-100 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border border-white/10">
                {currentUser?.employeeCode}
              </span>
              <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-md text-[11px] font-bold">
                {currentUser?.accessLevel === 'admin' ? 'مدير المنظومة 👑' : 'عضو فريق 💼'}
              </span>
            </div>

            <div className="text-xs text-blue-100 font-bold flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span>المسمى: <strong className="text-white">{currentUser?.role}</strong></span>
              <span>•</span>
              <span>القسم: <strong className="text-white">{currentUser?.department}</strong></span>
              <span>•</span>
              <span>اسم المستخدم للدخول: <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold select-all">{currentUser?.username}</code></span>
            </div>

            {/* Quick Stats Pills */}
            <div className="pt-2 grid grid-cols-3 gap-2 max-w-md">
              <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl text-center border border-white/10">
                <div className="text-[10px] text-blue-200 font-bold">المهام المسندة</div>
                <div className="text-base font-black text-white">{assignedTasks.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl text-center border border-white/10">
                <div className="text-[10px] text-emerald-200 font-bold">المهام المكتملة</div>
                <div className="text-base font-black text-emerald-300">{completedTasks.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl text-center border border-white/10">
                <div className="text-[10px] text-amber-200 font-bold">ساعات العمل</div>
                <div className="text-base font-black text-amber-300">{loggedHours} س</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Name and Profile Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-extrabold text-sm">
            <User className="w-4 h-4 text-blue-600" />
            <span>الاسم والبيانات الشخصية</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الاسم الكامل المعروض في النظام <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: هدير سعيد أو أميرة أحمد"
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold outline-none transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">يظهر هذا الاسم في التاسكات والتعليقات والتايمر.</p>
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني الرسمي
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@swiftmynd.com"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono outline-none transition-all dir-ltr text-right"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">يستخدم لإرسال الإشعارات والبريد الداخلي.</p>
            </div>

            {/* Phone & WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الهاتف / الواتساب
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono outline-none transition-all dir-ltr text-right"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">للتواصل السريع بين الفريق ومكالمات العملاء.</p>
            </div>

            {/* Employee Code (Read-Only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كود الموظف التعريفي (ثابت في المنظومة)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentUser?.employeeCode || 'SM-001'}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 font-mono font-bold cursor-not-allowed"
                />
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">الكود التعريفي الداخلي الممنوح لك من الإدارة.</p>
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نبذة مختصرة عن مهامك ودورك في الشركة (Bio)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="اكتب نبذة مختصرة عن تخصصك أو المهام التي تتولاها..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Section 2: Profile Picture / Avatar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>صورة البروفايل والأفاتار</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">يمكنك رفع صورة شخصية أو اختيار أفاتار جاهز</span>
          </div>

          {/* Current Avatar Preview & Controls */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <img
                src={avatar || currentUser?.avatar}
                alt="معاينة الصورة"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-md bg-slate-100"
              />
              <span className="text-[10px] text-slate-500 font-bold">المعاينة الحالية</span>
            </div>

            <div className="flex-1 w-full space-y-3">
              {/* Tabs for Avatar method */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setAvatarMode('upload')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    avatarMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة من جهازك</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarMode('presets')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    avatarMode === 'presets'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>صور وأفاتار جاهزة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarMode('url')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    avatarMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>رابط صورة (URL)</span>
                </button>
              </div>

              {/* Mode: Upload from Computer/Phone */}
              {avatarMode === 'upload' && (
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
                    >
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>اختيار صورة من الهاتف أو الكمبيوتر 📁</span>
                    </button>
                    <span className="text-[11px] text-slate-500">
                      صيغ JPG, PNG, WebP (بحد أقصى 3 ميجابايت)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    يتم تحويل الصورة تلقائياً وتخزينها محلياً لحسابك لتعمل في أي وقت بدون روابط خارجية.
                  </p>
                </div>
              )}

              {/* Mode: Preset Avatars */}
              {avatarMode === 'presets' && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-600">
                    اضغط على أي صورة لاختيارها فوراً لحسابك:
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {PRESET_AVATARS.map((url, idx) => {
                      const isSelected = avatar === url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer hover:scale-105 ${
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-400 scale-105'
                              : 'border-slate-200 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                          {isSelected && (
                            <span className="absolute bottom-0.5 right-0.5 bg-blue-600 text-white rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mode: External URL */}
              {avatarMode === 'url' && (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-mono dir-ltr text-right outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    تطبيق الرابط
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Password Update */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>تغيير كلمة المرور (الباسورد)</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">احرص على حفظ كلمة المرور الجديدة لتسجيل الدخول بها</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور الجديدة <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="اكتب كلمة المرور الجديدة..."
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono font-bold outline-none transition-all pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                كلمة المرور الحالية المسجلة لحسابك: <code className="font-mono text-blue-600 font-bold select-all">{currentUser?.password}</code>
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تأكيد كلمة المرور الجديدة <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور..."
                  required
                  className={`w-full bg-slate-50 border focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono font-bold outline-none transition-all pl-10 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-400 bg-rose-50/40'
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showConfirmPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password ? (
                <p className="text-[10px] text-rose-500 mt-1 font-bold">كلمات المرور غير متطابقة!</p>
              ) : (
                <p className="text-[10px] text-emerald-600 mt-1 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>كلمات المرور متطابقة</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Save Bar Button */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            يتم حفظ التعديلات فورياً في المنظومة وستتمكن من استخدام الباسورد الجديد لتسجيل الدخول في المرات القادمة.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ وتحديث بيانات البروفايل والباسورد'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
