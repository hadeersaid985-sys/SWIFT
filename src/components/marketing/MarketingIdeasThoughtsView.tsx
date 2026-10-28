import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  BookOpen,
  Pin,
  Plus,
  Trash2,
  Edit3,
  Search,
  Tag,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  X,
  Megaphone,
  Check,
  TrendingUp,
  Layers,
  FileText
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { MarketingIdea, WrittenThoughtNote } from '../../types/crm';

const CHANNEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'تيك توك وريلز': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'فيسبوك وإعلانات': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'إنستجرام': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'جوجل وسيو GEO': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'إيميل ماركتنج': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'لينكد إن': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'مؤتمرات وفعاليات': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'أخرى': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
};

const NOTE_COLORS = [
  { label: 'أزرق هادئ', value: '#eff6ff' },
  { label: 'أصفر كهرماني', value: '#fef3c7' },
  { label: 'أخضر زمردي', value: '#ecfdf5' },
  { label: 'بنفسجي راقي', value: '#f5f3ff' },
  { label: 'وردي لطيف', value: '#fdf2f8' },
  { label: 'رمادي عصري', value: '#f8fafc' }
];

export const MarketingIdeasThoughtsView: React.FC = () => {
  const {
    marketingIdeas,
    addMarketingIdea,
    updateMarketingIdea,
    deleteMarketingIdea,
    writtenThoughts,
    addWrittenThought,
    updateWrittenThought,
    deleteWrittenThought,
    togglePinThought,
    brandConfig
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'ideas' | 'thoughts'>('ideas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  // 1. Add / Edit Marketing Idea Modal
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<MarketingIdea | null>(null);
  const [ideaForm, setIdeaForm] = useState<{
    title: string;
    channel: MarketingIdea['channel'];
    targetAudience: string;
    concept: string;
    goal: MarketingIdea['goal'];
    estimatedBudget: number;
    currency: string;
    status: MarketingIdea['status'];
    priority: MarketingIdea['priority'];
    tags: string;
    notes: string;
  }>({
    title: '',
    channel: 'تيك توك وريلز',
    targetAudience: '',
    concept: '',
    goal: 'جذب ليدز ومبيعات',
    estimatedBudget: 2500,
    currency: brandConfig?.systemCurrency || 'ج.م',
    status: 'فكرة جديدة',
    priority: 'high',
    tags: 'تسويق, محتوى',
    notes: ''
  });

  // 2. Add / Edit Written Thought Modal
  const [isThoughtModalOpen, setIsThoughtModalOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<WrittenThoughtNote | null>(null);
  const [thoughtForm, setThoughtForm] = useState<{
    title: string;
    content: string;
    category: WrittenThoughtNote['category'];
    color: string;
    isPinned: boolean;
    tags: string;
  }>({
    title: '',
    content: '',
    category: 'تطوير الشركة',
    color: '#eff6ff',
    isPinned: false,
    tags: 'استراتيجية, تطوير'
  });

  // Filtered Ideas
  const filteredIdeas = useMemo(() => {
    return marketingIdeas.filter(idea => {
      const matchSearch =
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (idea.notes && idea.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchChannel = selectedChannel === 'all' || idea.channel === selectedChannel;
      const matchStatus = selectedStatus === 'all' || idea.status === selectedStatus;
      return matchSearch && matchChannel && matchStatus;
    });
  }, [marketingIdeas, searchQuery, selectedChannel, selectedStatus]);

  // Filtered & Sorted Thoughts (pinned first)
  const filteredThoughts = useMemo(() => {
    return writtenThoughts
      .filter(thought => {
        const matchSearch =
          thought.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thought.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (thought.tags && thought.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchCategory = selectedCategory === 'all' || thought.category === selectedCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [writtenThoughts, searchQuery, selectedCategory]);

  // Open Idea Modal
  const handleOpenIdeaModal = (idea?: MarketingIdea) => {
    if (idea) {
      setEditingIdea(idea);
      setIdeaForm({
        title: idea.title,
        channel: idea.channel,
        targetAudience: idea.targetAudience,
        concept: idea.concept,
        goal: idea.goal,
        estimatedBudget: idea.estimatedBudget || 0,
        currency: idea.currency || brandConfig?.systemCurrency || 'ج.م',
        status: idea.status,
        priority: idea.priority,
        tags: (idea.tags || []).join(', '),
        notes: idea.notes || ''
      });
    } else {
      setEditingIdea(null);
      setIdeaForm({
        title: '',
        channel: 'تيك توك وريلز',
        targetAudience: '',
        concept: '',
        goal: 'جذب ليدز ومبيعات',
        estimatedBudget: 2500,
        currency: brandConfig?.systemCurrency || 'ج.م',
        status: 'فكرة جديدة',
        priority: 'high',
        tags: 'تسويق, محتوى',
        notes: ''
      });
    }
    setIsIdeaModalOpen(true);
  };

  // Submit Idea Form
  const handleIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaForm.title.trim()) return;

    const tagsArr = ideaForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (editingIdea) {
      updateMarketingIdea(editingIdea.id, {
        title: ideaForm.title.trim(),
        channel: ideaForm.channel,
        targetAudience: ideaForm.targetAudience.trim(),
        concept: ideaForm.concept.trim(),
        goal: ideaForm.goal,
        estimatedBudget: Number(ideaForm.estimatedBudget),
        currency: ideaForm.currency,
        status: ideaForm.status,
        priority: ideaForm.priority,
        tags: tagsArr,
        notes: ideaForm.notes
      });
    } else {
      addMarketingIdea({
        title: ideaForm.title.trim(),
        channel: ideaForm.channel,
        targetAudience: ideaForm.targetAudience.trim(),
        concept: ideaForm.concept.trim(),
        goal: ideaForm.goal,
        estimatedBudget: Number(ideaForm.estimatedBudget),
        currency: ideaForm.currency,
        status: ideaForm.status,
        priority: ideaForm.priority,
        tags: tagsArr,
        notes: ideaForm.notes
      });
    }

    setIsIdeaModalOpen(false);
    setEditingIdea(null);
  };

  // Open Thought Modal
  const handleOpenThoughtModal = (thought?: WrittenThoughtNote) => {
    if (thought) {
      setEditingThought(thought);
      setThoughtForm({
        title: thought.title,
        content: thought.content,
        category: thought.category,
        color: thought.color || '#eff6ff',
        isPinned: thought.isPinned,
        tags: (thought.tags || []).join(', ')
      });
    } else {
      setEditingThought(null);
      setThoughtForm({
        title: '',
        content: '',
        category: 'تطوير الشركة',
        color: '#eff6ff',
        isPinned: false,
        tags: 'استراتيجية, تطوير'
      });
    }
    setIsThoughtModalOpen(true);
  };

  // Submit Thought Form
  const handleThoughtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thoughtForm.title.trim() || !thoughtForm.content.trim()) return;

    const tagsArr = thoughtForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (editingThought) {
      updateWrittenThought(editingThought.id, {
        title: thoughtForm.title.trim(),
        content: thoughtForm.content.trim(),
        category: thoughtForm.category,
        color: thoughtForm.color,
        isPinned: thoughtForm.isPinned,
        tags: tagsArr
      });
    } else {
      addWrittenThought({
        title: thoughtForm.title.trim(),
        content: thoughtForm.content.trim(),
        category: thoughtForm.category,
        color: thoughtForm.color,
        isPinned: thoughtForm.isPinned,
        tags: tagsArr
      });
    }

    setIsThoughtModalOpen(false);
    setEditingThought(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white shadow-xs">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">أفكار التسويق وتدويناتي الاستراتيجية</h1>
              <p className="text-xs text-slate-500">
                بنك أفكار الحملات والمحتوى التسويقي ومفكرة تدوين الخطط الاستراتيجية والملاحظات الخاصة
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-2">
          {activeTab === 'ideas' ? (
            <button
              onClick={() => handleOpenIdeaModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فكرة تسويقية جديدة</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenThoughtModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تدوين فكرة أو ملاحظة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-1 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('ideas')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ideas'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>بنك أفكار الماركيتنج ({marketingIdeas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('thoughts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'thoughts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>أفكاري وملاحظاتي المكتوبة ({writtenThoughts.length})</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'ideas'
                ? 'بحث في عنوان الفكرة، المفهوم، أو الجمهور...'
                : 'بحث في ملاحظاتي وأفكاري المكتوبة...'
            }
            className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pr-9 pl-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {activeTab === 'ideas' ? (
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Channel Filter */}
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">جميع المنصات والقنوات</option>
              <option value="تيك توك وريلز">تيك توك وريلز</option>
              <option value="فيسبوك وإعلانات">فيسبوك وإعلانات</option>
              <option value="إنستجرام">إنستجرام</option>
              <option value="جوجل وسيو GEO">جوجل وسيو GEO</option>
              <option value="لينكد إن">لينكد إن</option>
              <option value="إيميل ماركتنج">إيميل ماركتنج</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="فكرة جديدة">فكرة جديدة</option>
              <option value="قيد التجهيز والتخطيط">قيد التجهيز والتخطيط</option>
              <option value="قيد الاختبار">قيد الاختبار</option>
              <option value="مطبقة وناجحة">مطبقة وناجحة</option>
              <option value="مؤجلة">مؤجلة</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">جميع التصنيفات</option>
              <option value="تطوير الشركة">تطوير الشركة</option>
              <option value="استراتيجية المبيعات">استراتيجية المبيعات</option>
              <option value="أفكار منتجات وتطوير">أفكار منتجات وتطوير</option>
              <option value="كفاءة الفريق والعمل">كفاءة الفريق والعمل</option>
              <option value="توسعات وشراكات">توسعات وشراكات</option>
              <option value="ملاحظات سرية">ملاحظات سرية</option>
            </select>
          </div>
        )}
      </div>

      {/* ================= TAB 1: MARKETING IDEAS ================= */}
      {activeTab === 'ideas' && (
        <div>
          {filteredIdeas.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-xs">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">لا توجد أفكار تسويقية تطابق هذا البحث</h3>
              <p className="text-xs text-slate-400 mt-1">ابدأ بتسجيل فكرة حملة أو فيديو ريلز جديد لجدولتها للتنفيذ</p>
              <button
                onClick={() => handleOpenIdeaModal()}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فكرة الآن</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIdeas.map(idea => {
                const colors = CHANNEL_COLORS[idea.channel] || CHANNEL_COLORS['أخرى'];

                return (
                  <div
                    key={idea.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {idea.channel}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {idea.priority === 'urgent' ? (
                            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                              عاجلة جداً
                            </span>
                          ) : idea.priority === 'high' ? (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              أولوية عالية
                            </span>
                          ) : null}

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              idea.status === 'مطبقة وناجحة'
                                ? 'bg-emerald-100 text-emerald-800'
                                : idea.status === 'قيد الاختبار'
                                ? 'bg-blue-100 text-blue-800'
                                : idea.status === 'قيد التجهيز والتخطيط'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {idea.status}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-slate-900 leading-snug">{idea.title}</h3>

                      {/* Concept */}
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {idea.concept}
                      </p>

                      {/* Meta Information */}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-semibold">الجمهور المستهدف: </span>
                          <span className="text-slate-700 font-bold">{idea.targetAudience || 'عام'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold">الهدف من الحملة: </span>
                          <span className="text-slate-700 font-bold">{idea.goal}</span>
                        </div>
                        {idea.estimatedBudget && idea.estimatedBudget > 0 && (
                          <div>
                            <span className="text-slate-400 font-semibold">الميزانية المقترحة: </span>
                            <span className="text-emerald-700 font-black">
                              {idea.estimatedBudget.toLocaleString()} {idea.currency}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {idea.tags && idea.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-100">
                          {idea.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(idea.createdAt).toLocaleDateString('ar-EG')}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenIdeaModal(idea)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل الفكرة"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMarketingIdea(idea.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف الفكرة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: WRITTEN THOUGHTS ================= */}
      {activeTab === 'thoughts' && (
        <div>
          {filteredThoughts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-xs">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">لا توجد ملاحظات أو تدوينات مكتوبة تطابق البحث</h3>
              <p className="text-xs text-slate-400 mt-1">
                دون أفكارك ورؤيتك الاستراتيجية لتطوير الشركة وتحسين الأداء وابقها محفوظة دائماً
              </p>
              <button
                onClick={() => handleOpenThoughtModal()}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تدوين فكرة وملاحظة جديدة</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThoughts.map(thought => {
                const cardColor = thought.color || '#eff6ff';

                return (
                  <div
                    key={thought.id}
                    style={{ backgroundColor: cardColor }}
                    className={`rounded-2xl border transition-all p-5 flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                      thought.isPinned ? 'border-amber-400/80 ring-2 ring-amber-300/40' : 'border-slate-200/90'
                    }`}
                  >
                    <div>
                      {/* Top Bar with Category & Pin */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/80 text-slate-800 shadow-2xs border border-slate-200/60">
                          {thought.category}
                        </span>

                        <button
                          onClick={() => togglePinThought(thought.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            thought.isPinned
                              ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-white/60'
                          }`}
                          title={thought.isPinned ? 'إلغاء التثبيت في الأعلى' : 'تثبيت الملاحظة في الأعلى'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-slate-900 leading-snug">{thought.title}</h3>

                      {/* Content */}
                      <div className="text-xs text-slate-700 mt-2.5 whitespace-pre-line leading-relaxed font-normal">
                        {thought.content}
                      </div>

                      {/* Tags */}
                      {thought.tags && thought.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-3.5 pt-3 border-t border-slate-200/60">
                          {thought.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white/70 text-slate-700 px-2 py-0.5 rounded-md font-bold shadow-2xs border border-slate-200/40"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 text-xs">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(thought.updatedAt).toLocaleDateString('ar-EG')}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenThoughtModal(thought)}
                          className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                          title="تعديل الملاحظة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteWrittenThought(thought.id)}
                          className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="حذف الملاحظة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT MARKETING IDEA ================= */}
      {isIdeaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">
                {editingIdea ? 'تعديل الفكرة التسويقية' : 'إضافة فكرة تسويقية جديدة'}
              </h3>
              <button
                onClick={() => setIsIdeaModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIdeaSubmit} className="p-4 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الفكرة *</label>
                <input
                  type="text"
                  required
                  value={ideaForm.title}
                  onChange={e => setIdeaForm({ ...ideaForm, title: e.target.value })}
                  placeholder="مثال: فيديو ريلز يوضح كيف تظهر أول نتيجة في ChatGPT"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المنصة / القناة</label>
                  <select
                    value={ideaForm.channel}
                    onChange={e => setIdeaForm({ ...ideaForm, channel: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="تيك توك وريلز">تيك توك وريلز</option>
                    <option value="فيسبوك وإعلانات">فيسبوك وإعلانات</option>
                    <option value="إنستجرام">إنستجرام</option>
                    <option value="جوجل وسيو GEO">جوجل وسيو GEO</option>
                    <option value="لينكد إن">لينكد إن</option>
                    <option value="إيميل ماركتنج">إيميل ماركتنج</option>
                    <option value="مؤتمرات وفعاليات">مؤتمرات وفعاليات</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">حالة الفكرة</label>
                  <select
                    value={ideaForm.status}
                    onChange={e => setIdeaForm({ ...ideaForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="فكرة جديدة">فكرة جديدة</option>
                    <option value="قيد التجهيز والتخطيط">قيد التجهيز والتخطيط</option>
                    <option value="قيد الاختبار">قيد الاختبار</option>
                    <option value="مطبقة وناجحة">مطبقة وناجحة</option>
                    <option value="مؤجلة">مؤجلة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الجمهور المستهدف</label>
                <input
                  type="text"
                  value={ideaForm.targetAudience}
                  onChange={e => setIdeaForm({ ...ideaForm, targetAudience: e.target.value })}
                  placeholder="مثال: أصحاب الشركات، العيادات، مكاتب المحاماة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">فكرة ومفهوم المحتوى بالتفصيل</label>
                <textarea
                  rows={3}
                  value={ideaForm.concept}
                  onChange={e => setIdeaForm({ ...ideaForm, concept: e.target.value })}
                  placeholder="اشرح الفكرة والخطاف (Hook) والرسالة الأساسية..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الميزانية التقديرية ({ideaForm.currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={ideaForm.estimatedBudget}
                    onChange={e => setIdeaForm({ ...ideaForm, estimatedBudget: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأولوية</label>
                  <select
                    value={ideaForm.priority}
                    onChange={e => setIdeaForm({ ...ideaForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="urgent">عاجلة جداً</option>
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوسوم (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={ideaForm.tags}
                  onChange={e => setIdeaForm({ ...ideaForm, tags: e.target.value })}
                  placeholder="ذكاء اصطناعي, ريلز, مبيعات"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIdeaModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  حفظ الفكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT WRITTEN THOUGHT ================= */}
      {isThoughtModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">
                {editingThought ? 'تعديل الفكرة الاستراتيجية' : 'تدوين فكرة وملاحظة جديدة'}
              </h3>
              <button
                onClick={() => setIsThoughtModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleThoughtSubmit} className="p-4 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الفكرة أو الملاحظة *</label>
                <input
                  type="text"
                  required
                  value={thoughtForm.title}
                  onChange={e => setThoughtForm({ ...thoughtForm, title: e.target.value })}
                  placeholder="مثال: خطة تحسين تحصيل الكاش في الربع الأول"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={thoughtForm.category}
                    onChange={e => setThoughtForm({ ...thoughtForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="تطوير الشركة">تطوير الشركة</option>
                    <option value="استراتيجية المبيعات">استراتيجية المبيعات</option>
                    <option value="أفكار منتجات وتطوير">أفكار منتجات وتطوير</option>
                    <option value="كفاءة الفريق والعمل">كفاءة الفريق والعمل</option>
                    <option value="توسعات وشراكات">توسعات وشراكات</option>
                    <option value="ملاحظات سرية">ملاحظات سرية</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">لون البطاقة</label>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setThoughtForm({ ...thoughtForm, color: c.value })}
                        style={{ backgroundColor: c.value }}
                        className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                          thoughtForm.color === c.value ? 'ring-2 ring-blue-600 scale-110 border-blue-500' : 'border-slate-300'
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الملاحظات والأفكار بالتفصيل *</label>
                <textarea
                  rows={6}
                  required
                  value={thoughtForm.content}
                  onChange={e => setThoughtForm({ ...thoughtForm, content: e.target.value })}
                  placeholder="دون أفكارك، الخطوات، القرارات، أو الملاحظات بكل راحة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوسوم (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={thoughtForm.tags}
                  onChange={e => setThoughtForm({ ...thoughtForm, tags: e.target.value })}
                  placeholder="تطوير, سيلز, استراتيجية"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinnedCheck"
                  checked={thoughtForm.isPinned}
                  onChange={e => setThoughtForm({ ...thoughtForm, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="isPinnedCheck" className="font-bold text-slate-700 cursor-pointer">
                  تثبيت هذه الملاحظة في أعلى الصفحة (Pin to Top)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsThoughtModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  حفظ التدوينة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
