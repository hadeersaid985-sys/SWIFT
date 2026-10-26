import React, { useState } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Star,
  FileText,
  Trash2,
  Plus,
  Search,
  Paperclip,
  Reply,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Users,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { EmailMessage } from '../../types/crm';

export const MailView: React.FC = () => {
  const {
    emails,
    team,
    currentUser,
    sendEmail,
    markEmailAsRead,
    toggleStarEmail,
    deleteEmail,
    emptyTrash,
    restoreEmailFromTrash,
    permanentlyDeleteEmail,
    setOpenQuickModal
  } = useCRM();

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'starred' | 'drafts' | 'trash'>('inbox');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchMail, setSearchMail] = useState<string>('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(emails[0]?.id || null);

  // Quick reply state in email reader
  const [replyText, setReplyText] = useState<string>('');
  const [replySentMessage, setReplySentMessage] = useState<boolean>(false);

  const isManager = currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'manager' || currentUser.id === 'user-1';

  // Filtered emails
  const filteredEmails = emails.filter(email => {
    // Strict isolation for employee: only their emails
    if (!isManager) {
      const isSender = email.senderId === currentUser.id || email.senderEmail === currentUser.email;
      const isRecipient = email.recipientEmails.some(
        r => r === currentUser.email || r === 'all@swiftmynd.com' || r.includes('team')
      );
      if (!isSender && !isRecipient) return false;
    }

    if (activeFolder === 'starred') {
      if (!email.isStarred) return false;
    } else {
      if (email.folder !== activeFolder) return false;
    }

    if (selectedTag && email.tag !== selectedTag) return false;

    if (searchMail.trim()) {
      const q = searchMail.toLowerCase();
      return (
        email.subject.toLowerCase().includes(q) ||
        email.body.toLowerCase().includes(q) ||
        email.senderName.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || filteredEmails[0] || null;

  // Handle click on email row
  const handleSelectEmail = (email: EmailMessage) => {
    setSelectedEmailId(email.id);
    if (!email.isRead) {
      markEmailAsRead(email.id, true);
    }
  };

  // Handle Quick Reply submit
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedEmail) return;

    sendEmail({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderAvatar: currentUser.avatar,
      recipientEmails: [selectedEmail.senderEmail],
      recipientNames: [selectedEmail.senderName],
      subject: `رد: ${selectedEmail.subject}`,
      body: replyText,
      tag: 'داخلي'
    });

    setReplyText('');
    setReplySentMessage(true);
    setTimeout(() => setReplySentMessage(false), 3000);
  };

  const unreadCount = emails.filter(e => e.folder === 'inbox' && !e.isRead).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              بريد الفريق والمراسلات الرسمية (SwiftMail)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              نظام بريد إلكتروني متكامل للتواصل الداخلي مع أعضاء الفريق وخارجي مع العملاء
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpenQuickModal('mail')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء رسالة بريد جديدة</span>
        </button>
      </div>

      {/* Main Mail Client Box: 3-Column Enterprise Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Left Col (3 cols on lg): Folders & Team Quick Contacts */}
        <div className="md:col-span-3 lg:col-span-2 border-l border-slate-200 p-4 bg-slate-50/70 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <button
              onClick={() => setOpenQuickModal('mail')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء إيميل</span>
            </button>

            {/* Folders List */}
            <div className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveFolder('inbox');
                  setSelectedTag(null);
                }}
                className={`w-full text-right px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeFolder === 'inbox' && !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4" />
                  <span>الوارد</span>
                </div>
                {unreadCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      activeFolder === 'inbox' && !selectedTag
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveFolder('sent');
                  setSelectedTag(null);
                }}
                className={`w-full text-right px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeFolder === 'sent' && !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>المرسل</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {emails.filter(e => e.folder === 'sent').length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveFolder('starred');
                  setSelectedTag(null);
                }}
                className={`w-full text-right px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeFolder === 'starred' && !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>المميزة بنجمة</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {emails.filter(e => e.isStarred).length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveFolder('drafts');
                  setSelectedTag(null);
                }}
                className={`w-full text-right px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeFolder === 'drafts' && !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>المسودات</span>
                </div>
                <span className="text-[10px] text-slate-400">0</span>
              </button>

              <button
                onClick={() => {
                  setActiveFolder('trash');
                  setSelectedTag(null);
                }}
                className={`w-full text-right px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeFolder === 'trash' && !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4" />
                  <span>سلة المهملات</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {emails.filter(e => e.folder === 'trash').length}
                </span>
              </button>
            </div>

            {/* Quick Tags Filter */}
            <div className="pt-4 border-t border-slate-200/80 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                تصنيفات الرسائل
              </div>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {['عاجل', 'عملاء', 'داخلي', 'تقارير'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2 py-0.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Team Email Directory */}
          <div className="pt-4 border-t border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> زملاء الفريق
            </div>
            <div className="space-y-1">
              {team.slice(0, 4).map(member => (
                <button
                  key={member.id}
                  onClick={() => setOpenQuickModal('mail')}
                  className="w-full text-right p-1.5 rounded-lg hover:bg-slate-200/50 flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer"
                  title={`إرسال إيميل لـ ${member.name}`}
                >
                  <img src={member.avatar} alt={member.name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="truncate">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Col (4 or 5 cols): Email List */}
        <div className="md:col-span-4 lg:col-span-4 border-l border-slate-200 flex flex-col bg-white">
          {/* Email Search Bar */}
          <div className="p-3 border-b border-slate-100 bg-white">
            <div className="relative">
              <input
                type="text"
                value={searchMail}
                onChange={e => setSearchMail(e.target.value)}
                placeholder="بحث في الرسائل والموضوعات..."
                className="w-full bg-slate-50 pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          {/* Trash Header Action Bar */}
          {activeFolder === 'trash' && (
            <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-rose-800 text-xs font-extrabold">
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>سلة المهملات ({filteredEmails.length} رسالة)</span>
              </div>
              {filteredEmails.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `هل أنت متأكد من تفريغ سلة المهملات بالكامل وحذف جميع الرسائل (${filteredEmails.length}) نهائياً؟\nلن يمكن التراجع عن هذا الإجراء.`
                      )
                    ) {
                      emptyTrash();
                      setSelectedEmailId(null);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="تفريغ سلة المهملات بالكامل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ السلة بالكامل</span>
                </button>
              )}
            </div>
          )}

          {/* List of Messages */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {activeFolder === 'trash' ? 'سلة المهملات فارغة تماماً 🗑️' : 'لا توجد رسائل في هذا المجلد'}
              </div>
            ) : (
              filteredEmails.map(email => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-3.5 transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-r-4 border-blue-600'
                        : !email.isRead
                        ? 'bg-slate-50/80 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={email.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={email.senderName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className={`truncate text-slate-900 ${!email.isRead ? 'font-black' : 'font-medium'}`}>
                          {email.senderName}
                        </span>
                      </div>

                      {email.folder === 'trash' ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              restoreEmailFromTrash(email.id);
                            }}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="استعادة للبريد الوارد"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>استعادة</span>
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              if (window.confirm('هل تريد حذف هذه الرسالة نهائياً؟')) {
                                permanentlyDeleteEmail(email.id);
                                if (selectedEmail?.id === email.id) setSelectedEmailId(null);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleStarEmail(email.id);
                            }}
                            className="text-slate-300 hover:text-amber-400 cursor-pointer"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                email.isStarred ? 'text-amber-400 fill-amber-400' : ''
                              }`}
                            />
                          </button>
                          <span className="text-[10px] text-slate-400 font-medium">{email.time}</span>
                        </div>
                      )}
                    </div>

                    <h4 className={`text-xs truncate ${!email.isRead ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
                      {email.subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {email.body}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      {email.tag && (
                        <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                          #{email.tag}
                        </span>
                      )}
                      {email.attachments && email.attachments.length > 0 && (
                        <span className="text-slate-400 flex items-center gap-0.5">
                          <Paperclip className="w-3 h-3" /> {email.attachments.length} مرفقات
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col (5 or 6 cols): Email Reader Pane */}
        <div className="md:col-span-5 lg:col-span-6 p-6 flex flex-col justify-between bg-white overflow-y-auto">
          {selectedEmail ? (
            <div className="space-y-6">
              {/* Email Reader Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      بريد رسمي
                    </span>
                    {selectedEmail.tag && (
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        #{selectedEmail.tag}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {selectedEmail.subject}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedEmail.folder === 'trash' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          restoreEmailFromTrash(selectedEmail.id);
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="استعادة للبريد الوارد"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>استعادة للوارد</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('هل تريد حذف هذه الرسالة نهائياً؟ لن يمكن التراجع.')) {
                            permanentlyDeleteEmail(selectedEmail.id);
                            setSelectedEmailId(null);
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        title="حذف نهائي للرسالة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف نهائي</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleStarEmail(selectedEmail.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-50 cursor-pointer"
                        title="تمييز بنجمة"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            selectedEmail.isStarred ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('هل تريد نقل هذه الرسالة لسلة المهملات؟')) {
                            deleteEmail(selectedEmail.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 cursor-pointer"
                        title="نقل لسلة المهملات"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Sender & Recipient Details */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedEmail.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={selectedEmail.senderName}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <div className="font-bold text-slate-900">{selectedEmail.senderName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{selectedEmail.senderEmail}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      إلى: {selectedEmail.recipientNames.join(', ')} ({selectedEmail.recipientEmails.join(', ')})
                    </div>
                  </div>
                </div>

                <div className="text-left text-[11px] text-slate-400">
                  <div>{selectedEmail.date}</div>
                  <div>{selectedEmail.time}</div>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-normal bg-white p-2">
                {selectedEmail.body}
              </div>

              {/* Attachments Section if any */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" /> المرفقات المضمنة ({selectedEmail.attachments.length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEmail.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs hover:border-blue-400 transition-colors"
                      >
                        <div className="truncate">
                          <div className="font-bold text-slate-800 truncate">{att.name}</div>
                          <span className="text-[10px] text-slate-400">{att.size}</span>
                        </div>
                        <button
                          onClick={() => alert(`جاري تنزيل الملف: ${att.name}`)}
                          className="text-blue-600 font-bold hover:underline shrink-0 text-xs px-2 cursor-pointer"
                        >
                          تحميل
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Reply Form */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Reply className="w-4 h-4 text-blue-600" /> الرد السريع على {selectedEmail.senderName}:
                  </span>
                  {replySentMessage && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> تم إرسال الرد بنجاح!
                    </span>
                  )}
                </div>

                <form onSubmit={handleSendReply} className="space-y-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="اكتب ردك المباشر لزميلك أو العميل هنا..."
                    rows={3}
                    className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setOpenQuickModal('mail')}
                      className="text-xs text-slate-500 hover:text-blue-600 cursor-pointer"
                    >
                      فتح محرر الرسائل الكامل
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال الرد</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              حدد رسالة من القائمة لعرض تفاصيلها
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
