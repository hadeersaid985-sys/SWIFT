import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  LogIn,
  Copy,
  Check
} from 'lucide-react';
import { useCRM, matchUserCredentials } from '../../context/CRMContext';
import { TeamMember } from '../../types/crm';
import { SwiftMyndLogo } from '../common/SwiftMyndLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { team, currentUser, setCurrentUser, impersonateUser, triggerDailyDigest, loginUser } = useCRM();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  const isManager = currentUser.accessLevel === 'admin' || currentUser.role.includes('مدير') || currentUser.id === 'user-1';

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetUser = team.find(m => matchUserCredentials(m, usernameInput, passwordInput));

    if (targetUser) {
      loginUser(targetUser);
      setSuccessMsg(`تم تسجيل الدخول بنجاح! مرحباً بك، ${targetUser.name}`);
      setTimeout(() => {
        onClose();
        // أرسل ملخص المهام اليومي (Daily Digest) للموظف عند تسجيل الدخول
        if (targetUser.accessLevel !== 'admin') {
          triggerDailyDigest(targetUser);
        }
      }, 600);
    } else {
      setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق أو اختيار حساب من القائمة أدناه.');
    }
  };

  const handleQuickSelectUser = (member: TeamMember) => {
    loginUser(member);
    setSuccessMsg(`تم الدخول بحساب: ${member.name} (${member.role})`);
    setTimeout(() => {
      onClose();
      if (member.accessLevel !== 'admin') {
        triggerDailyDigest(member);
      }
    }, 500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] cursor-default"
      >
        {/* Header */}
        <div className="bg-[#172033] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SwiftMyndLogo
              variant="icon"
              size="md"
              isDark={true}
            />
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>تسجيل الدخول والوصول للنظام</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-mono">
                  SWIFTMYND
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                الدخول عبر يوزر وباسورد الموظف أو المدير
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Direct Employee Login Link Share Banner */}
          <div className="p-3 bg-blue-50/90 border border-blue-200/90 rounded-2xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <div className="font-extrabold text-blue-950 truncate">رابط دخول الموظفين المباشر:</div>
                <code className="text-[11px] text-blue-700 font-mono font-bold select-all block truncate">
                  https://www.tazkoraio.com/login
                </code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('https://www.tazkoraio.com/login');
                setIsCopiedLink(true);
                setTimeout(() => setIsCopiedLink(false), 2000);
              }}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
              title="نسخ الرابط لمشاركته مع الموظفين عبر واتساب أو الإيميل"
            >
              {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedLink ? 'تم النسخ ✓' : 'نسخ الرابط'}</span>
            </button>
          </div>

          {/* Status Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم المستخدم (اليوزر) أو البريد الإلكتروني:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="اسم المستخدم أو البريد الإلكتروني..."
                  className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                كلمة المرور (الباسورد):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة المرور..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>دخول النظام بالبيانات</span>
            </button>
          </form>

          {/* Quick Manager Switch / User Select (Manager Only) */}
          {isManager && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>دخول سريع لحساب أي عضو (خاص بالمدير):</span>
                </span>
                <span className="text-[10px] text-slate-400">انقر للدخول المباشر كالعضو</span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                {team.map(member => {
                  const isSelected = member.id === currentUser.id;
                  return (
                    <div
                      key={member.id}
                      onClick={() => handleQuickSelectUser(member)}
                      className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-200'
                          : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {member.accessLevel === 'admin' && (
                              <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-black">
                                المدير
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">
                            اليوزر: <span className="text-blue-600 font-bold">{member.username}</span> | الباسورد: <span className="text-slate-700">{member.password}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                      >
                        دخول كـ {member.name.split(' ')[0]}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>الحساب الحالي: <strong className="text-slate-800">{currentUser.name}</strong></span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
