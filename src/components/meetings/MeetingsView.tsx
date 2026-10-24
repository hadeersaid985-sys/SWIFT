import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Building,
  Plus,
  Users,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Film,
  Link,
  Copy,
  Check,
  Crown,
  Search,
  Filter,
  X,
  FileText,
  Sparkles,
  Download
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Meeting, MeetingRecording } from '../../types/crm';

export const MeetingsView: React.FC = () => {
  const {
    meetings,
    team,
    currentUser,
    isManager,
    deleteMeeting,
    updateMeeting,
    setOpenQuickModal,
    meetingRecordings,
    addMeetingRecording,
    deleteMeetingRecording
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'scheduled' | 'recordings'>('recordings');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVip, setOnlyVip] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add recording modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recordingForm, setRecordingForm] = useState({
    meetingTitle: '',
    clientName: '',
    company: '',
    isVipClient: true,
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: '45 دقيقة',
    googleMeetLink: 'https://meet.google.com/',
    recordingUrl: 'https://drive.google.com/file/d/.../view',
    keyTakeaways: '',
    actionItems: '',
    hostName: 'هدير سعيد',
    tags: 'VIP عميل, جوجل ميت, تجديد'
  });

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddRecording = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingForm.meetingTitle || !recordingForm.clientName || !recordingForm.recordingUrl) return;

    addMeetingRecording({
      meetingTitle: recordingForm.meetingTitle,
      clientName: recordingForm.clientName,
      company: recordingForm.company || 'غير محدد',
      isVipClient: recordingForm.isVipClient,
      date: recordingForm.date,
      time: recordingForm.time,
      duration: recordingForm.duration,
      googleMeetLink: recordingForm.googleMeetLink,
      recordingUrl: recordingForm.recordingUrl,
      keyTakeaways: recordingForm.keyTakeaways
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean),
      actionItems: recordingForm.actionItems
        .split('\n')
        .map(a => a.trim())
        .filter(Boolean),
      hostName: recordingForm.hostName,
      tags: recordingForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      notes: 'تمت إضافته إلى مركز تسجيلات العملاء'
    });

    setIsAddModalOpen(false);
    setRecordingForm({
      meetingTitle: '',
      clientName: '',
      company: '',
      isVipClient: true,
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: '45 دقيقة',
      googleMeetLink: 'https://meet.google.com/',
      recordingUrl: 'https://drive.google.com/file/d/.../view',
      keyTakeaways: '',
      actionItems: '',
      hostName: 'هدير سعيد',
      tags: 'VIP عميل, جوجل ميت, تجديد'
    });
  };

  const filteredRecordings = meetingRecordings.filter(rec => {
    if (onlyVip && !rec.isVipClient) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.meetingTitle.toLowerCase().includes(q) ||
        rec.clientName.toLowerCase().includes(q) ||
        rec.company.toLowerCase().includes(q) ||
        rec.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-xs">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>تسجيلات واجتماعات العملاء (Google Meet & VIP Hub)</span>
              <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                تسجيلات Google Meet
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              مكان مخصص لرفع وحفظ تسجيلات ميتنج العملاء المهمين مع لينكات Google Meet والقرارات المتفق عليها.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'recordings' ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ رفع تسجيل ميتنج عميل مهم (VIP)</span>
            </button>
          ) : (
            <button
              onClick={() => setOpenQuickModal('meeting')}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>جدولة اجتماع أو مكالمة</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold">
          <button
            onClick={() => setActiveTab('recordings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all cursor-pointer ${
              activeTab === 'recordings'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>تسجيلات ميتنج العملاء المهمين (VIP Recordings)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'recordings' ? 'bg-rose-800 text-rose-100' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {meetingRecordings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>الاجتماعات والمكالمات القادمة</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
              {meetings.length}
            </span>
          </button>
        </div>

        {activeTab === 'recordings' && (
          <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
            <button
              onClick={() => setOnlyVip(!onlyVip)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                onlyVip
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>عملاء VIP فقط</span>
            </button>

            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث في التسجيلات والعملاء..."
                className="w-full pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: RECORDINGS HUB (تسجيلات ميتنج العملاء المهمين) */}
      {activeTab === 'recordings' && (
        <div className="space-y-4 animate-in fade-in">
          {filteredRecordings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Film className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-700 text-sm">لا توجد تسجيلات مطابقة لبحثك</h3>
              <p className="text-slate-500 text-xs">اضغط على زر "رفع تسجيل ميتنج عميل مهم" لإضافة تسجيل جديد بلينك Google Meet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRecordings.map(rec => {
                const isCopied = copiedId === rec.id;
                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {rec.isVipClient && (
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                              <Crown className="w-3 h-3 text-amber-500" />
                              <span>عميل VIP مهم</span>
                            </span>
                          )}
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Google Meet
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{rec.duration}</span>
                        </div>
                      </div>

                      {/* Title & Client */}
                      <div>
                        <h3 className="text-base font-black text-slate-900 leading-snug">
                          {rec.meetingTitle}
                        </h3>
                        <div className="text-xs text-slate-600 mt-1 font-semibold flex items-center gap-1.5">
                          <span className="text-slate-400">العميل:</span>
                          <strong className="text-slate-900">{rec.clientName}</strong>
                          <span className="text-slate-400">({rec.company})</span>
                        </div>
                      </div>

                      {/* Date & Host */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-rose-500" />
                          <span>{rec.date}</span>
                          <span className="text-slate-300">|</span>
                          <span>{rec.time}</span>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <span>إدارة: {rec.hostName}</span>
                        </div>
                      </div>

                      {/* Key Takeaways */}
                      {rec.keyTakeaways && rec.keyTakeaways.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>أهم مخرجات وقرارات الميتنج:</span>
                          </span>
                          <ul className="space-y-1 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/70 text-[11px] text-slate-700">
                            {rec.keyTakeaways.map((takeaway, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Items */}
                      {rec.actionItems && rec.actionItems.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>المهام وخطوات المتابعة المترتبة:</span>
                          </span>
                          <ul className="space-y-1 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/70 text-[11px] text-slate-700">
                            {rec.actionItems.map((action, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tags */}
                      {rec.tags && rec.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rec.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons: Play recording / Meet link / Copy / Delete */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Open recording directly */}
                        <a
                          href={rec.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                          title="مشاهدة تسجيل الميتنج على درايف أو Google Meet"
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>فتح التسجيل 🎥</span>
                        </a>

                        {/* Open Google Meet Room */}
                        {rec.googleMeetLink && (
                          <a
                            href={rec.googleMeetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition-colors"
                            title="رابط قاعة Google Meet"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>قاعة الميتنج</span>
                          </a>
                        )}

                        {/* Copy Recording Link */}
                        <button
                          onClick={() => handleCopy(rec.id, rec.recordingUrl)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title="نسخ رابط التسجيل"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'تم النسخ!' : 'نسخ اللينك'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`هل تريد حذف تسجيل ميتنج: ${rec.meetingTitle}؟`)) {
                            deleteMeetingRecording(rec.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="حذف التسجيل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SCHEDULED MEETINGS (الاجتماعات والمكالمات القادمة) */}
      {activeTab === 'scheduled' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in">
          {(isManager
            ? meetings
            : meetings.filter(
                m =>
                  m.attendees.includes(currentUser.id) ||
                  m.attendees.includes(currentUser.name) ||
                  m.attendees.length === 0
              )
          ).map(meet => {
            return (
              <div
                key={meet.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-100 flex items-center gap-1">
                      {meet.location === 'Google Meet' || meet.location === 'Zoom' ? (
                        <Video className="w-3 h-3" />
                      ) : (
                        <Building className="w-3 h-3" />
                      )}
                      {meet.location}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{meet.duration}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {meet.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>{meet.date}</span>
                      <span className="text-slate-400">|</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>الساعة {meet.time}</span>
                    </div>

                    {meet.clientName && (
                      <div className="text-[11px] text-slate-500">
                        مع العميل: <strong className="text-slate-800">{meet.clientName}</strong>
                      </div>
                    )}

                    {meet.notes && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 border-t border-slate-200/60">
                        {meet.notes}
                      </p>
                    )}
                  </div>

                  {/* Attendees list */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">فريق العمل المشارك:</span>
                    <div className="flex items-center gap-1.5">
                      {meet.attendees.map(attendeeId => {
                        const member = team.find(m => m.id === attendeeId);
                        if (!member) return null;
                        return (
                          <div key={member.id} className="relative" title={member.name}>
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-6 h-6 rounded-full object-cover border border-white ring-1 ring-slate-200"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {meet.meetingLink ? (
                    <a
                      href={meet.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>بدء أو انضمام</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">اجتماع حضوري</span>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`هل تريد حذف الاجتماع: ${meet.title}؟`)) {
                        deleteMeeting(meet.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD VIP MEETING RECORDING */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">رفع تسجيل ميتنج عميل مهم (VIP)</h3>
                  <p className="text-[10px] text-rose-100">حفظ رابط Google Meet والقرارات المتفق عليها</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecording} className="p-5 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">عنوان الميتنج أو موضوع الجلسة:</label>
                <input
                  type="text"
                  value={recordingForm.meetingTitle}
                  onChange={e => setRecordingForm({ ...recordingForm, meetingTitle: e.target.value })}
                  placeholder="مثال: جلسة استعراض نتائج ظهور الذكاء الاصطناعي وتجديد الاشتراك"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم العميل:</label>
                  <input
                    type="text"
                    value={recordingForm.clientName}
                    onChange={e => setRecordingForm({ ...recordingForm, clientName: e.target.value })}
                    placeholder="مثال: عبدالعزيز العتيبي"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الشركة أو الجهة:</label>
                  <input
                    type="text"
                    value={recordingForm.company}
                    onChange={e => setRecordingForm({ ...recordingForm, company: e.target.value })}
                    placeholder="مثال: شركة الأفق (الكويت)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رابط التسجيل المباشر (Google Meet / Drive Link):</label>
                <input
                  type="url"
                  value={recordingForm.recordingUrl}
                  onChange={e => setRecordingForm({ ...recordingForm, recordingUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/... أو رابط Google Meet"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono text-[11px]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاريخ الميتنج:</label>
                  <input
                    type="date"
                    value={recordingForm.date}
                    onChange={e => setRecordingForm({ ...recordingForm, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الوقت:</label>
                  <input
                    type="text"
                    value={recordingForm.time}
                    onChange={e => setRecordingForm({ ...recordingForm, time: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                    placeholder="14:00"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">مدة الجلسة:</label>
                  <input
                    type="text"
                    value={recordingForm.duration}
                    onChange={e => setRecordingForm({ ...recordingForm, duration: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    placeholder="45 دقيقة"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">أهم المخرجات والقرارات المتفق عليها (سطر لكل نقطة):</label>
                <textarea
                  rows={2}
                  value={recordingForm.keyTakeaways}
                  onChange={e => setRecordingForm({ ...recordingForm, keyTakeaways: e.target.value })}
                  placeholder="• العميل وافق على تجديد السيرفر لـ 2 دومين&#10;• طلب استلام تقرير الذكاء الاصطناعي الأسبوعي"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المهام وخطوات المتابعة المترتبة:</label>
                <textarea
                  rows={2}
                  value={recordingForm.actionItems}
                  onChange={e => setRecordingForm({ ...recordingForm, actionItems: e.target.value })}
                  placeholder="• تجهيز ملفات الهوست والباك أب&#10;• إرسال تنبيه قبل 4 أيام من موعد السداد"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-amber-900">تصنيف العميل كـ VIP مهم</span>
                </div>
                <input
                  type="checkbox"
                  checked={recordingForm.isVipClient}
                  onChange={e => setRecordingForm({ ...recordingForm, isVipClient: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  حفظ التسجيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

