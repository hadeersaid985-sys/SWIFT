import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Copy,
  Check,
  Send,
  Sparkles,
  Calendar,
  DollarSign,
  Phone,
  User,
  CheckCircle2,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { ClientRenewal } from '../../types/crm';

interface WhatsAppRenewalModalProps {
  client: ClientRenewal | null;
  onClose: () => void;
}

export const WhatsAppRenewalModal: React.FC<WhatsAppRenewalModalProps> = ({ client, onClose }) => {
  if (!client) return null;

  const [templateType, setTemplateType] = useState<'early' | 'due_today' | 'thank_you'>('early');
  const [copied, setCopied] = useState(false);

  // Clean phone number for WhatsApp
  const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');

  // Pre-crafted Arabic Templates
  const templates = {
    early: `السلام عليكم ورحمة الله وبركاته، أستاذ ${client.clientName} المحترم 🌸
نأمل أن تكونوا بخير وصحة وسعادة.

نود تذكير سيادتكم بلطف باقتراب موعد استحقاق تجديد اشتراك:
📌 باقة: ${client.serviceName}
💰 القيمة: ${client.amount.toLocaleString()} ${client.currency} (${client.planCycle})
📅 تاريخ التجديد: ${client.renewalDate}

يسعدنا تأكيد استمرار الخدمة لضمان استقرار العمليات دون انقطاع. في حال الرغبة بالتجديد يرجى التكرم بتأكيدنا لنرسل لكم بيانات التحويل المباشرة.

شاكرين ومقدرين ثقتكم الدائمة بنا،
فريق سويفت مايند - SWIFTMYND 🚀`,

    due_today: `مرحباً أستاذ ${client.clientName}، تحية طيبة وبعد 🤝

نود إحاطة عنايتكم الكريمة بأن موعد تجديد اشتراككم مستحق اليوم:
📌 الخدمة: ${client.serviceName}
💰 المبلغ المستحق: ${client.amount.toLocaleString()} ${client.currency}
📅 تاريخ اليوم: ${client.renewalDate}

حرصاً على استمرار السيرفرات والخدمات دون توقف، نرجو التكرم بالتأكيد وإتمام السداد.

فريق إدارة الحسابات - سويفت مايند 💼`,

    thank_you: `أهلاً بحضرتك أستاذ ${client.clientName} 💐

تم بحمد الله استلام وتأكيد سداد اشتراك باقة:
✅ ${client.serviceName}
قيمة: ${client.amount.toLocaleString()} ${client.currency}

تم تمديد وتفعيل الاشتراك بنجاح حتى موعده القادم. 
نسعد دائماً بخدمتكم ونتطلع لتحقيق أعلى مستويات النجاح معكم! 🌟

مع أطيب التحيات،
إدارة سويفت مايند - SWIFTMYND`
  };

  const [customMessage, setCustomMessage] = useState(templates[templateType]);

  const handleSelectTemplate = (type: 'early' | 'due_today' | 'thank_you') => {
    setTemplateType(type);
    setCustomMessage(templates[type]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(customMessage);
    const targetUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner">
              <MessageSquare className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">رسائل واتساب التجديد الجاهزة</h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full font-bold border border-white/20">
                  بنقرة واحدة 💬
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                العميل: <strong className="text-white">{client.clientName}</strong> • {client.serviceName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Quick Client Summary Pills */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>العميل: <strong className="text-slate-800">{client.clientName}</strong> ({client.company || 'فردي'})</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>الهاتف: <strong className="text-slate-800 font-mono dir-ltr">{client.phone || 'غير مسجل'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>موعد التجديد: <strong className="text-slate-800 font-mono">{client.renewalDate}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>المبلغ: <strong className="text-amber-700 font-bold">{client.amount.toLocaleString()} {client.currency}</strong></span>
            </div>
          </div>

          {/* Template Choice Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              اختر قالب الرسالة المناسب لحالة العميل:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTemplate('early')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                  templateType === 'early'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black">1. تذكير مبكر (4 أيام)</span>
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[10px] text-slate-500">قبل موعد التجديد بأيام لتأكيد السداد</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('due_today')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                  templateType === 'due_today'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-200 text-amber-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black">2. استحقاق اليوم</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="text-[10px] text-slate-500">إشعار عاجل لموعد التجديد الحالي</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('thank_you')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                  templateType === 'thank_you'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-200 text-blue-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black">3. شكر بعد السداد</span>
                  <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[10px] text-slate-500">تأكيد استلام المبلغ وشكر العميل</p>
              </button>
            </div>
          </div>

          {/* Editable Message Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                نص الرسالة (يمكنك التعديل أو الإضافة عليها قبل الإرسال):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 rounded-2xl text-xs text-slate-800 leading-relaxed outline-none transition-all resize-none font-sans"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>فتح في واتساب الآن 🚀</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
