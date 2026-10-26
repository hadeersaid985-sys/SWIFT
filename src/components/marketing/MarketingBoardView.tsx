import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Inbox,
  LayoutGrid,
  RotateCcw,
  ExternalLink,
  Tag,
  CheckSquare,
  Clock,
  Sparkles,
  Search,
  Filter,
  X,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  ArrowLeft,
  Share2,
  Sliders,
  Shield,
  HelpCircle,
  FolderClock,
  Lightbulb,
  FileText,
  Film,
  Video,
  Play,
  Copy,
  BookOpen,
  Clipboard,
  ClipboardCheck,
  ClipboardPaste,
  Maximize2,
  Image as ImageIcon,
  Upload,
  Camera,
  Link2,
  Eye
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { MarketingCard, MarketingList, MarketingBoard, MarketingVideoScript } from '../../types/crm';

export const MarketingBoardView: React.FC = () => {
  const {
    marketingBoards,
    activeMarketingBoardId,
    setActiveMarketingBoardId,
    addMarketingCard,
    updateMarketingCard,
    deleteMarketingCard,
    moveMarketingCard,
    addMarketingList,
    deleteMarketingList,
    updateMarketingListTitle,
    currentUser,
    isManager,
    setActiveTab,
    marketingScripts,
    addMarketingScript,
    deleteMarketingScript,
    updateMarketingScript
  } = useCRM();

  // Active view: 'board' (Kanban), 'planner' (Calendar/Timeline), 'tasks' (Marketing Tasks & Workload), 'scripts' (Video Scripts & Ideas), 'inbox' (Copy & Scripts), 'switch_boards'
  const [activeSubView, setActiveSubView] = useState<'board' | 'planner' | 'tasks' | 'scripts' | 'inbox' | 'switch_boards'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScriptCategory, setSelectedScriptCategory] = useState<string>('all');
  const [teleprompterScript, setTeleprompterScript] = useState<MarketingVideoScript | null>(null);
  const [showAddScriptModal, setShowAddScriptModal] = useState(false);
  const [newScriptData, setNewScriptData] = useState({
    title: '',
    platform: 'Instagram Reels' as MarketingVideoScript['platform'],
    productCategory: 'ظاهرلي جيو (GEO)' as MarketingVideoScript['productCategory'],
    targetDuration: '50 ثانية',
    hook: '',
    problem: '',
    solution: '',
    callToAction: '',
    visualNotes: '',
    tags: 'سوشيال, جيو, مبيعات'
  });
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [addingCardToListId, setAddingCardToListId] = useState<string | null>('list-swift-products');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCardForModal, setSelectedCardForModal] = useState<MarketingCard | null>(null);

  // States for Inline Editing & Copy-Paste ("اقدر اعدل الكلام واخده كوبي بيست في الكروت ديه")
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingCardTitle, setEditingCardTitle] = useState('');
  const [editingCardDesc, setEditingCardDesc] = useState('');
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Editing States (امكانية التعديل ورفع صورة على كروت الماركيتنج)
  const [isModalEditing, setIsModalEditing] = useState(false);
  const [modalEditTitle, setModalEditTitle] = useState('');
  const [modalEditDesc, setModalEditDesc] = useState('');
  const [modalEditCoverImage, setModalEditCoverImage] = useState('');
  const [modalEditLinkUrl, setModalEditLinkUrl] = useState('');
  const [modalEditLinkLabel, setModalEditLinkLabel] = useState('');
  const [modalEditDueDate, setModalEditDueDate] = useState('');
  const [modalEditLabelName, setModalEditLabelName] = useState('ماركيتنج');
  const [modalEditLabelColor, setModalEditLabelColor] = useState('#3b82f6');
  const [modalEditAssignee, setModalEditAssignee] = useState('');

  // Helper: Read file to base64 Data URL
  const handleFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Direct 1-Click Image Upload on any card
  const handleCardDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await handleFileToDataUrl(file);
      updateMarketingCard(cardId, { coverImage: dataUrl });
      if (selectedCardForModal && selectedCardForModal.id === cardId) {
        setSelectedCardForModal({ ...selectedCardForModal, coverImage: dataUrl });
      }
      showToast('تم رفع صورة الكارت بنجاح! 📸');
    } catch {
      showToast('حدث خطأ أثناء قراءة الصورة');
    }
  };

  // Remove image from card
  const handleRemoveCardImage = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    updateMarketingCard(cardId, { coverImage: undefined });
    if (selectedCardForModal && selectedCardForModal.id === cardId) {
      setSelectedCardForModal({ ...selectedCardForModal, coverImage: undefined });
    }
    setModalEditCoverImage('');
    showToast('تمت إزالة صورة الكارت بنجاح 🗑️');
  };

  // Dedicated Marketing Tasks State (تاسكات الماركيتنج وكل الشغل عليه)
  const [marketingTasks, setMarketingTasks] = useState([
    {
      id: 'mtask-1',
      title: 'صياغة ونشر فيديو ريلز: كيف تظهر شركتك أول نتيجة في ChatGPT بدلاً من جوجل؟ (GEO)',
      channel: 'سوشيال ميديا وريلز',
      deliverable: 'مونتاج ونشر',
      dueDate: '2026-10-22',
      priority: 'عالية جداً',
      completed: false,
      assignee: 'سارة المنصوري',
      notes: 'التركيز على إبراز الفرق بين محركات البحث التقليدية ومحركات الذكاء الاصطناعي التوليدي.'
    },
    {
      id: 'mtask-2',
      title: 'إرسال رسائل استقطاب عملاء الكويت على الواتساب مع عرض التحليل المجاني',
      channel: 'الكويت والخليج',
      deliverable: 'تواصل مباشر',
      dueDate: '2026-10-23',
      priority: 'عاجلة',
      completed: false,
      assignee: 'هدير سعيد',
      notes: 'استخدام سكريبت الكويت المعتمد وتوجيه المهتمين لتقرير الظهور على Perplexity.'
    },
    {
      id: 'mtask-3',
      title: 'نقل ملفات الـ 2 سيستم بالكامل للهوست وربط الـ 2 دومين وتأمين الـ SSL',
      channel: 'الهوست والدومينات',
      deliverable: 'إعداد تقني واستضافة',
      dueDate: '2026-10-21',
      priority: 'حرجة',
      completed: true,
      assignee: 'طارق القحطاني',
      notes: 'تم فحص الـ DNS والتأكد من سرعة تحميل الاستضافة والمزامنة اليومية.'
    },
    {
      id: 'mtask-4',
      title: 'تجهيز وإرسال برزنتيشن سيستم CRM وإدارة التاسكات لعملاء الباقة السنوية',
      channel: 'سويفت ومنتجات السيلز',
      deliverable: 'ملف عرض بيعي',
      dueDate: '2026-10-24',
      priority: 'عالية',
      completed: false,
      assignee: 'أحمد الشريف',
      notes: 'توضيح ميزة حساب ساعات عمل التيم بدقة ومنع التلاعب وتقارير الإنجاز الفورية.'
    },
    {
      id: 'mtask-5',
      title: 'إطلاق حملة إعلانات جوجل للبحث (Google Ads) مستهدفة كلمات "استضافة أعمال وسيرفرات سحابية"',
      channel: 'إعلانات ممولة',
      deliverable: 'حملة إعلانية',
      dueDate: '2026-10-25',
      priority: 'متوسطة',
      completed: false,
      assignee: 'سارة المنصوري',
      notes: 'الميزانية اليومية 250 ر.س مع صفحة هبوط مخصصة لعرض الـ 2 دومين.'
    }
  ]);
  const [taskFilterChannel, setTaskFilterChannel] = useState('all');
  const [showAddMarketingTaskModal, setShowAddMarketingTaskModal] = useState(false);
  const [newMarketingTaskData, setNewMarketingTaskData] = useState({
    title: '',
    channel: 'الكويت والخليج',
    deliverable: 'تواصل مباشر',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'عالية',
    assignee: 'هدير سعيد',
    notes: ''
  });

  // Edit / Delete Top Modal States
  const [editingCard, setEditingCard] = useState<MarketingCard | null>(null);
  const [editCardData, setEditCardData] = useState<Partial<MarketingCard>>({});
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // New Card Full Form Modal (from top "+ إضافة كارت تسويقي")
  const [showTopAddCardModal, setShowTopAddCardModal] = useState(false);
  const [topAddCardData, setTopAddCardData] = useState({
    listId: '',
    title: '',
    description: '',
    linkUrl: '',
    linkLabel: '',
    coverImage: '',
    dueDate: new Date().toISOString().split('T')[0],
    labelName: 'حملة تسويقية',
    labelColor: '#3b82f6'
  });

  const activeBoard =
    marketingBoards.find(b => b.id === activeMarketingBoardId) || marketingBoards[0];

  // Quick submit for inline "Add a card"
  const handleInlineAddCard = (listId: string) => {
    if (!newCardTitle.trim()) return;
    addMarketingCard(listId, {
      title: newCardTitle.trim(),
      description: '',
      labels: [{ id: 'lbl-' + Date.now(), name: 'ماركيتنج', color: '#3b82f6' }],
      assigneeName: currentUser.name,
      assigneeAvatar: currentUser.avatar
    });
    setNewCardTitle('');
    setAddingCardToListId(null);
  };

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  // 1-Click Copy card text (عنوان + وصف)
  const handleCopyCardText = (e: React.MouseEvent, card: MarketingCard) => {
    e.stopPropagation();
    const textToCopy = card.description
      ? `${card.title}\n\n${card.description}`
      : card.title;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCardId(card.id);
    showToast('تم نسخ نص الكارت إلى الحافظة بنجاح! 📋');
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  // Start Inline Editing on card
  const handleStartInlineEdit = (e: React.MouseEvent, card: MarketingCard) => {
    e.stopPropagation();
    setEditingCardId(card.id);
    setEditingCardTitle(card.title);
    setEditingCardDesc(card.description || '');
  };

  // Save Inline Edit
  const handleSaveInlineEdit = (cardId: string) => {
    if (!editingCardTitle.trim()) {
      showToast('يرجى إدخال نص الكارت');
      return;
    }
    updateMarketingCard(cardId, {
      title: editingCardTitle.trim(),
      description: editingCardDesc.trim()
    });
    setEditingCardId(null);
    showToast('تم حفظ وتحديث الكارت بنجاح! ✅');
  };

  // Open Modal in Full Edit Mode (تعديل كارت الماركيتنج ورفع الصورة)
  const handleStartModalEdit = (card: MarketingCard) => {
    setSelectedCardForModal(card);
    setIsModalEditing(true);
    setModalEditTitle(card.title);
    setModalEditDesc(card.description || '');
    setModalEditCoverImage(card.coverImage || '');
    setModalEditLinkUrl(card.linkUrl || '');
    setModalEditLinkLabel(card.linkLabel || '');
    setModalEditDueDate(card.dueDate || '');
    setModalEditLabelName(card.labels?.[0]?.name || 'ماركيتنج');
    setModalEditLabelColor(card.labels?.[0]?.color || '#3b82f6');
    setModalEditAssignee(card.assigneeName || currentUser.name);
  };

  // Save Modal Edit (حفظ تعديلات الكارت والصورة)
  const handleSaveModalEdit = () => {
    if (!selectedCardForModal) return;
    if (!modalEditTitle.trim()) {
      showToast('يرجى إدخال عنوان الكارت');
      return;
    }
    const updates: Partial<MarketingCard> = {
      title: modalEditTitle.trim(),
      description: modalEditDesc.trim(),
      coverImage: modalEditCoverImage.trim() || undefined,
      linkUrl: modalEditLinkUrl.trim() || undefined,
      linkLabel: modalEditLinkLabel.trim() || undefined,
      dueDate: modalEditDueDate || undefined,
      labels: modalEditLabelName
        ? [{ id: 'lbl-' + Date.now(), name: modalEditLabelName, color: modalEditLabelColor }]
        : selectedCardForModal.labels,
      assigneeName: modalEditAssignee || currentUser.name
    };
    updateMarketingCard(selectedCardForModal.id, updates);
    setSelectedCardForModal({
      ...selectedCardForModal,
      ...updates
    });
    setIsModalEditing(false);
    showToast('تم حفظ وتحديث كارت الماركيتنج والصورة بنجاح! ✅');
  };

  // Paste from clipboard into inline editor
  const handlePasteFromClipboardIntoEdit = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setEditingCardTitle(prev => (prev ? prev + ' ' + text : text));
        showToast('تم لصق النص من الحافظة! 📋');
      }
    } catch {
      const manual = prompt('الصق النص هنا:');
      if (manual) {
        setEditingCardTitle(prev => (prev ? prev + ' ' + manual : manual));
      }
    }
  };

  // Paste a brand new card into a list directly from clipboard
  const handlePasteNewCardToList = async (listId: string) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        addMarketingCard(listId, {
          title: text.trim(),
          description: '',
          labels: [{ id: 'lbl-' + Date.now(), name: 'ماركيتنج', color: '#10b981' }],
          assigneeName: currentUser.name,
          assigneeAvatar: currentUser.avatar
        });
        showToast('تم إنشاء ولصق كارت جديد من الحافظة بنجاح! 📋');
      } else {
        const manual = prompt('الصق نص الكارت الجديد هنا:');
        if (manual && manual.trim()) {
          addMarketingCard(listId, {
            title: manual.trim(),
            description: '',
            labels: [{ id: 'lbl-' + Date.now(), name: 'ماركيتنج', color: '#3b82f6' }],
            assigneeName: currentUser.name,
            assigneeAvatar: currentUser.avatar
          });
          showToast('تمت إضافة الكارت بنجاح! ✅');
        }
      }
    } catch {
      const manual = prompt('الصق نص الكارت الجديد هنا:');
      if (manual && manual.trim()) {
        addMarketingCard(listId, {
          title: manual.trim(),
          description: '',
          labels: [{ id: 'lbl-' + Date.now(), name: 'ماركيتنج', color: '#3b82f6' }],
          assigneeName: currentUser.name,
          assigneeAvatar: currentUser.avatar
        });
        showToast('تمت إضافة الكارت بنجاح! ✅');
      }
    }
  };

  // Add list submit
  const handleAddNewList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    addMarketingList(activeBoard.id, newListTitle.trim());
    setNewListTitle('');
    setIsAddingList(false);
  };

  // Top modal add card submit
  const handleTopAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topAddCardData.title.trim()) return;
    const targetListId = topAddCardData.listId || activeBoard.lists[0]?.id;
    if (!targetListId) return;

    addMarketingCard(targetListId, {
      title: topAddCardData.title.trim(),
      description: topAddCardData.description.trim(),
      linkUrl: topAddCardData.linkUrl.trim() || undefined,
      linkLabel: topAddCardData.linkLabel.trim() || undefined,
      coverImage: topAddCardData.coverImage.trim() || undefined,
      dueDate: topAddCardData.dueDate || undefined,
      labels: topAddCardData.labelName
        ? [{ id: 'lbl-' + Date.now(), name: topAddCardData.labelName, color: topAddCardData.labelColor }]
        : undefined,
      assigneeName: currentUser.name,
      assigneeAvatar: currentUser.avatar
    });

    setShowTopAddCardModal(false);
    setTopAddCardData({
      listId: '',
      title: '',
      description: '',
      linkUrl: '',
      linkLabel: '',
      coverImage: '',
      dueDate: new Date().toISOString().split('T')[0],
      labelName: 'حملة تسويقية',
      labelColor: '#3b82f6'
    });
  };

  // Filter cards by search
  const filterCards = (cards: MarketingCard[]) => {
    if (!searchQuery.trim()) return cards;
    const q = searchQuery.toLowerCase();
    return cards.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.labels && c.labels.some(l => l.name.toLowerCase().includes(q)))
    );
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in">
      {/* Top Header & Rule Banner (اي حاجة في الموقع فييها اضافة او حذف او تعديل من فوق) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{activeBoard.title}</span>
                <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                  خاص بالأدمن فقط 🔒
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              لوحة المخطط التسويقي الشامل (Marketing Overview & Planner): إدارة حملات الذكاء الاصطناعي GEO، عملاء الكويت، منتجات سويفت، ونقل ملفات الهوست.
            </p>
          </div>
        </div>

        {/* TOP ACTION BAR: إضافة | تعديل | حذف (من فوق مباشرة) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. ➕ إضافة من فوق */}
          <button
            onClick={() => {
              setTopAddCardData(prev => ({
                ...prev,
                listId: activeBoard.lists[0]?.id || ''
              }));
              setShowTopAddCardModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
            title="إضافة كارت تسويقي جديد من الأعلى"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ إضافة كارت تسويقي</span>
          </button>

          <button
            onClick={() => setIsAddingList(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all cursor-pointer text-xs"
            title="إضافة قائمة عمود جديدة"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">+ إضافة قائمة (List)</span>
          </button>

          {/* 2. ✏️ تعديل من فوق */}
          <button
            onClick={() => setActiveSubView('switch_boards')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold rounded-xl transition-all cursor-pointer text-xs"
            title="التبديل بين بوردات الماركيتنج وتعديلها"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">تعديل البوردات</span>
          </button>

          {/* 3. 🗑️ حذف من فوق */}
          <button
            onClick={() => {
              setConfirmDeleteModal({
                title: 'تفريغ الكروت المنتهية من البورد',
                message: 'هل ترغب في تنظيف البورد وحذف الكروت القديمة غير النشطة؟',
                onConfirm: () => {
                  alert('تم تنظيف وتحديث لوحة الماركيتنج بنجاح.');
                }
              });
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-all cursor-pointer text-xs"
            title="حذف وتفريغ السجلات القديمة"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">حذف وتفريغ</span>
          </button>
        </div>
      </div>

      {/* Trello-like View Switcher Bar (matching screenshot bottom bar): Inbox | Planner | Board | Switch boards */}
      <div className="bg-slate-900/90 text-white p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-1 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveSubView('board')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubView === 'board'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-blue-300" />
            <span>لوحة الكانبان (Board)</span>
          </button>

          <button
            onClick={() => setActiveSubView('planner')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubView === 'planner'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>المخطط والتقويم (Planner)</span>
          </button>

          <button
            onClick={() => setActiveSubView('tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubView === 'tasks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-300" />
            <span>تاسكات الماركيتنج (Marketing Tasks)</span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded-full font-mono">
              {marketingTasks.filter(t => !t.completed).length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubView('scripts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubView === 'scripts'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Film className="w-4 h-4 text-pink-300" />
            <span>اسكربتات الفيديو وبنك الأفكار 🎬</span>
            <span className="text-[10px] bg-pink-500/30 text-pink-200 px-1.5 py-0.2 rounded-full font-mono">
              {marketingScripts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubView('inbox')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubView === 'inbox'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4 text-cyan-300" />
            <span>نماذج الرسائل والأفكار (Inbox)</span>
          </button>

          <button
            onClick={() => setActiveSubView('switch_boards')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubView === 'switch_boards'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-purple-300" />
            <span>تبديل البوردات (Switch boards)</span>
          </button>
        </div>

        {/* Search inside board */}
        <div className="relative w-48 sm:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في كروت الماركيتنج..."
            className="w-full bg-slate-800 text-white placeholder-slate-400 text-xs rounded-xl pr-8 pl-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD (Exact match with wood grain background style from screenshot) */}
      {activeSubView === 'board' && (
        <div
          className="rounded-3xl p-4 sm:p-6 overflow-x-auto min-h-[calc(100vh-250px)] border border-amber-900/20 shadow-inner relative"
          style={{
            backgroundColor: '#c49a6c',
            backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(222, 184, 135, 0.45) 0%, rgba(139, 90, 43, 0.85) 100%), repeating-linear-gradient(45deg, rgba(160, 100, 40, 0.08) 0px, rgba(160, 100, 40, 0.08) 2px, transparent 2px, transparent 12px)`
          }}
        >
          {/* Subtle wood banner branding */}
          <div className="flex items-center justify-between pb-3 text-white/90 font-bold text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-black/30 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
                {activeBoard.title}
              </span>
              <span className="text-[11px] text-white/80 hidden sm:inline">
                {activeBoard.lists.reduce((acc, l) => acc + l.cards.length, 0)} كارت تسويقي
              </span>
            </div>
            <span className="text-[10px] bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
              swiftmynd Trello Board
            </span>
          </div>

          {/* Kanban Lists Container */}
          <div className="flex items-start gap-4 overflow-x-auto pb-4">
            {activeBoard.lists.map(list => {
              const listCards = filterCards(list.cards);
              const isAddingHere = addingCardToListId === list.id;

              return (
                <div
                  key={list.id}
                  className="w-72 sm:w-80 shrink-0 bg-[#ebecf0]/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-300/80 p-2.5 flex flex-col max-h-[calc(100vh-320px)]"
                >
                  {/* List Header */}
                  <div className="flex items-center justify-between px-2 py-1.5 text-slate-800 font-extrabold text-xs">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{list.title}</span>
                      <span className="text-[10px] bg-slate-300/80 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                        {listCards.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePasteNewCardToList(list.id)}
                        className="p-1 hover:bg-emerald-100 rounded text-slate-500 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                        title="لصق كارت جديد من الحافظة (Paste new card)"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => {
                          const newT = prompt('تعديل اسم القائمة:', list.title);
                          if (newT && newT.trim()) updateMarketingListTitle(activeBoard.id, list.id, newT.trim());
                        }}
                        className="p-1 hover:bg-slate-300/60 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="تعديل اسم القائمة"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف قائمة "${list.title}" وكافة كروتها؟`)) {
                            deleteMarketingList(activeBoard.id, list.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="حذف القائمة"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Cards Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 p-1 scrollbar-thin">
                    {listCards.map(card => {
                      const isEditing = editingCardId === card.id;
                      const isCopied = copiedCardId === card.id;

                      if (isEditing) {
                        return (
                          <div
                            key={card.id}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-xl p-3 shadow-md border-2 border-blue-500 space-y-2 animate-in fade-in"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-blue-700 pb-1 border-b border-blue-100">
                              <span className="flex items-center gap-1">
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>تعديل نص الكارت</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">اضغط Ctrl+Enter للحفظ السريع</span>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">نص / عنوان الكارت:</label>
                              <textarea
                                rows={3}
                                value={editingCardTitle}
                                onChange={e => setEditingCardTitle(e.target.value)}
                                className="w-full text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 resize-y leading-relaxed"
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleSaveInlineEdit(card.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingCardId(null);
                                  }
                                }}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">تفاصيل إضافية / وصف (اختياري):</label>
                              <textarea
                                rows={2}
                                value={editingCardDesc}
                                onChange={e => setEditingCardDesc(e.target.value)}
                                placeholder="أضف وصفاً أو تفاصيل إضافية هنا..."
                                className="w-full text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 resize-y"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineEdit(card.id)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>حفظ التعديل</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={handlePasteFromClipboardIntoEdit}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                                  title="لصق نص من الحافظة"
                                >
                                  <ClipboardPaste className="w-3.5 h-3.5 text-blue-600" />
                                  <span>لصق</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const fullText = editingCardTitle + (editingCardDesc ? '\n\n' + editingCardDesc : '');
                                    navigator.clipboard.writeText(fullText);
                                    showToast('تم نسخ النص إلى الحافظة! 📋');
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                                  title="نسخ النص المعدل"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                                  <span>نسخ</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setEditingCardId(null)}
                                className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCardForModal(card)}
                          className="bg-white rounded-xl p-3 shadow-xs hover:shadow-md border border-slate-200/90 transition-all cursor-pointer group hover:border-blue-400/80 relative"
                        >
                          {/* Top Row: Labels + 1-Click Copy & Edit Action Buttons */}
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <div className="flex flex-wrap gap-1 flex-1">
                              {card.labels && card.labels.length > 0 ? (
                                card.labels.map(lbl => (
                                  <span
                                    key={lbl.id}
                                    style={{ backgroundColor: `${lbl.color}15`, color: lbl.color, borderColor: `${lbl.color}40` }}
                                    className="text-[9px] font-bold px-2 py-0.2 rounded-full border"
                                  >
                                    {lbl.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  ماركيتنج
                                </span>
                              )}
                            </div>

                            {/* 📋 أزرار النسخ، رفع الصورة، والتعديل في رأس الكارت مباشرة */}
                            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                              {/* زر نسخ النص */}
                              <button
                                type="button"
                                onClick={e => handleCopyCardText(e, card)}
                                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  isCopied
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
                                    : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200/80'
                                }`}
                                title="نسخ نص الكارت بالكامل للحافظة (Copy)"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700">تم النسخ ✅</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-500" />
                                    <span>نسخ</span>
                                  </>
                                )}
                              </button>

                              {/* 📷 زر رفع صورة مباشرة من الجهاز */}
                              <label
                                className="p-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 transition-all cursor-pointer flex items-center"
                                title="رفع صورة لهذا الكارت من جهازك (Upload Image)"
                              >
                                <Camera className="w-3 h-3 text-emerald-600" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleCardDirectImageUpload(e, card.id)}
                                />
                              </label>

                              {/* ✏️ زر التعديل الشامل وفتح النافذة */}
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleStartModalEdit(card);
                                }}
                                className="p-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200/80 transition-all cursor-pointer"
                                title="تعديل تفاصيل وصورة الكارت بالكامل"
                              >
                                <Edit3 className="w-3 h-3 text-blue-600" />
                              </button>
                            </div>
                          </div>

                          {/* Cover image if available or option to upload */}
                          {card.coverImage ? (
                            <div className="-mx-3 -mt-1 mb-2 rounded-lg overflow-hidden bg-slate-900 h-28 relative group/img">
                              <img
                                src={card.coverImage}
                                alt={card.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 backdrop-blur-2xs">
                                <label
                                  onClick={e => e.stopPropagation()}
                                  className="px-2 py-1 bg-white/95 hover:bg-white text-slate-800 rounded-md text-[10px] font-bold shadow-xs cursor-pointer flex items-center gap-1"
                                  title="تغيير الصورة"
                                >
                                  <Camera className="w-3 h-3 text-blue-600" />
                                  <span>تغيير الصورة</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleCardDirectImageUpload(e, card.id)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={e => handleRemoveCardImage(e, card.id)}
                                  className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold shadow-xs cursor-pointer"
                                  title="حذف الصورة"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-2" onClick={e => e.stopPropagation()}>
                              <label
                                className="w-full py-1.5 px-2 bg-slate-50 hover:bg-blue-50/60 border border-dashed border-slate-200 hover:border-blue-300 rounded-lg text-[10px] font-bold text-slate-500 hover:text-blue-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                title="رفع صورة أو غلاف لهذا الكارت من جهازك"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                                <span>+ رفع صورة للكارت</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleCardDirectImageUpload(e, card.id)}
                                />
                              </label>
                            </div>
                          )}

                          {/* Card Title (Clickable & Text Selectable) */}
                          <h4
                            onClick={e => {
                              // If user double clicked or clicked with Alt, edit directly
                              if (e.detail === 2) {
                                e.stopPropagation();
                                handleStartInlineEdit(e, card);
                              }
                            }}
                            className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 leading-snug select-text cursor-pointer"
                            title="انقر لعرض التفاصيل أو انقر مرتين لتعديل النص مباشرة"
                          >
                            {card.title}
                          </h4>

                          {/* Card Description Snippet */}
                          {card.description && (
                            <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-3 leading-relaxed whitespace-pre-line bg-slate-50/70 p-2 rounded-lg border border-slate-100 select-text">
                              {card.description}
                            </p>
                          )}

                          {/* External Link Pill */}
                          {card.linkUrl && (
                            <div className="mt-2">
                              <a
                                href={card.linkUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>{card.linkLabel || card.linkUrl}</span>
                              </a>
                            </div>
                          )}

                          {/* Card Footer: Due Date & Action Toolbar */}
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-400">
                            <div className="flex items-center gap-2">
                              {card.dueDate && (
                                <span className="flex items-center gap-1 font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                                  <Clock className="w-2.5 h-2.5" />
                                  {card.dueDate}
                                </span>
                              )}
                              {card.assigneeName && (
                                <span className="text-slate-500 font-medium">
                                  {card.assigneeName.split(' ')[0]}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons Toolbar */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={e => handleCopyCardText(e, card)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 cursor-pointer"
                                title="نسخ نص الكارت"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={e => handleStartInlineEdit(e, card)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-amber-600 cursor-pointer"
                                title="تعديل نص الكارت"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  const otherLists = activeBoard.lists.filter(l => l.id !== list.id);
                                  if (otherLists.length > 0) {
                                    moveMarketingCard(card.id, otherLists[0].id);
                                    showToast('تم نقل الكارت للقائمة التالية ➡️');
                                  }
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600 cursor-pointer"
                                title="نقل للقائمة التالية"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  if (confirm('حذف هذا الكارت؟')) {
                                    deleteMarketingCard(card.id);
                                    showToast('تم حذف الكارت');
                                  }
                                }}
                                className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="حذف الكارت"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Inline Add Card Input (matching screenshot: "Enter a title or paste a link" with "Add card", "Tip", and "X") */}
                    {isAddingHere ? (
                      <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-300 space-y-2 animate-in fade-in">
                        <textarea
                          rows={2}
                          value={newCardTitle}
                          onChange={e => setNewCardTitle(e.target.value)}
                          placeholder="اكتب عنوان الكارت أو الصق نصاً أو رابطاً هنا..."
                          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none font-bold"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleInlineAddCard(list.id);
                            }
                          }}
                        />
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleInlineAddCard(list.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                            >
                              Add card
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const text = await navigator.clipboard.readText();
                                  if (text) {
                                    setNewCardTitle(text);
                                    showToast('تم لصق النص من الحافظة! 📋');
                                  }
                                } catch {
                                  const t = prompt('الصق النص هنا:');
                                  if (t) setNewCardTitle(t);
                                }
                              }}
                              className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer border border-indigo-200"
                              title="لصق النص من الحافظة (Paste)"
                            >
                              <ClipboardPaste className="w-3.5 h-3.5" />
                              <span>لصق من الحافظة</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNewCardTitle('عرض خاص: تحسين ظهور في ChatGPT وPerplexity + SEO لموقعك');
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                              <span>Tip</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingCardToListId(null);
                              setNewCardTitle('');
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* List Footer: + Add a card & 📋 Paste card buttons */}
                  {!isAddingHere && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setAddingCardToListId(list.id);
                          setNewCardTitle('');
                        }}
                        className="flex-1 text-right px-2.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add a card</span>
                      </button>

                      <button
                        onClick={() => handlePasteNewCardToList(list.id)}
                        className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200/80"
                        title="لصق كارت جديد من الحافظة مباشرة (Paste New Card)"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-emerald-600" />
                        <span>لصق كارت 📋</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* + Add another list column (matching screenshot) */}
            <div className="w-72 shrink-0">
              {isAddingList ? (
                <form
                  onSubmit={handleAddNewList}
                  className="bg-[#ebecf0]/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-300 space-y-2 animate-in fade-in"
                >
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={e => setNewListTitle(e.target.value)}
                    placeholder="أدخل عنوان القائمة..."
                    className="w-full bg-white px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500 font-bold"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      إضافة قائمة
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingList(false)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingList(true)}
                  className="w-full bg-black/25 hover:bg-black/35 backdrop-blur-xs text-white p-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-white/20 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add another list</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PLANNER (جدولة وتقويم الحملات التسويقية ومواعيد النشر) */}
      {activeSubView === 'planner' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>مخطط وتقويم حملات الماركيتنج (Marketing Planner)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة مواعيد إطلاق الحملات، بوستات السوشيال ميديا، ومتابعة عملاء الكويت والسعودية بالتواريخ.
              </p>
            </div>
            <button
              onClick={() => {
                setTopAddCardData(prev => ({
                  ...prev,
                  listId: activeBoard.lists[0]?.id || '',
                  labelName: 'حملة مجدولة بالتقويم'
                }));
                setShowTopAddCardModal(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>جدولة حملة جديدة</span>
            </button>
          </div>

          {/* Planner Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBoard.lists.flatMap(list =>
              list.cards.map(card => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardForModal(card)}
                  className="bg-slate-50/80 hover:bg-blue-50/50 rounded-xl p-4 border border-slate-200 transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                      {list.title}
                    </span>
                    <span className="text-[11px] font-mono text-amber-700 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {card.dueDate || 'تاريخ مرن'}
                    </span>
                  </div>

                  <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700">
                    {card.title}
                  </h3>

                  {card.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {card.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>المسؤول: {card.assigneeName || 'المدير'}</span>
                    <span className="text-blue-600 font-bold group-hover:underline">عرض التفاصيل ←</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: MARKETING TASKS (تاسكات الماركيتنج وكل الشغل عليه) */}
      {activeSubView === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <span>تاسكات الماركيتنج وكل الشغل عليه (Marketing Tasks & Workload)</span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  خاص بالأدمن 🔒
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة المهام التسويقية المتخصصة: صياغة النصوص، المونتاج، إعلانات السوشيال، استقطاب عملاء الكويت، ونقل ملفات الهوست.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddMarketingTaskModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ إضافة تاسك تسويقي</span>
              </button>

              <button
                onClick={() => {
                  setMarketingTasks(prev => prev.filter(t => !t.completed));
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                title="تفريغ المهام المنفذة"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">حذف المكتمل</span>
              </button>
            </div>
          </div>

          {/* Progress Banner */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                {Math.round((marketingTasks.filter(t => t.completed).length / (marketingTasks.length || 1)) * 100)}%
              </span>
              <div>
                <strong className="text-emerald-950 block">معدل إنجاز حملات وتاسكات الماركيتنج</strong>
                <span className="text-[11px] text-emerald-800">
                  تم تنفيذ {marketingTasks.filter(t => t.completed).length} من أصل {marketingTasks.length} تاسك تسويقي
                </span>
              </div>
            </div>

            {/* Channels Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['all', 'الكويت والخليج', 'سوشيال ميديا وريلز', 'الهوست والدومينات', 'سويفت ومنتجات السيلز', 'إعلانات ممولة'].map(ch => (
                <button
                  key={ch}
                  onClick={() => setTaskFilterChannel(ch)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    taskFilterChannel === ch
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ch === 'all' ? 'جميع القنوات' : ch}
                </button>
              ))}
            </div>
          </div>

          {/* Marketing Tasks Table / List */}
          <div className="space-y-2">
            {marketingTasks
              .filter(t => (taskFilterChannel === 'all' ? true : t.channel === taskFilterChannel))
              .map(t => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    t.completed
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => {
                        setMarketingTasks(prev =>
                          prev.map(x => (x.id === t.id ? { ...x, completed: !x.completed } : x))
                        );
                      }}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 mt-1 cursor-pointer focus:ring-blue-500"
                    />

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-black text-xs ${
                            t.completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {t.title}
                        </span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.2 rounded-full">
                          {t.channel}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                          {t.deliverable}
                        </span>
                      </div>

                      {t.notes && (
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {t.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Task Meta & Quick Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs">
                    <span className="flex items-center gap-1 font-mono text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {t.dueDate}
                    </span>

                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      المسؤول: {t.assignee}
                    </span>

                    <button
                      onClick={() => {
                        if (confirm(`حذف التاسك التسويقي: "${t.title}"؟`)) {
                          setMarketingTasks(prev => prev.filter(x => x.id !== t.id));
                        }
                      }}
                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                      title="حذف التاسك"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW 4: INBOX & COPY BANK (صندوق النصوص ونماذج الرسائل التسويقية ومسودات الاستقطاب) */}
      {activeSubView === 'inbox' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-cyan-600" />
                <span>صندوق نماذج الرسائل والاسكربتات التسويقية (Marketing Copy Bank)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                نماذج رسائل الاستقطاب الجاهزة لعملاء الكويت، إبراز باقات سويفت GEO + SEO، ونقل ملفات الهوست.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Script 1: الكويت GEO */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <span>🇰🇼 نموذج رسالة استقطاب عملاء الكويت (GEO + AI Search)</span>
                </span>
                <button
                  onClick={() => {
                    const text = `السلام عليكم ورحمه الله وبركاته حياك الله 🌸\nهل عميلك في الكويت لما يبحث عن خدمتك... يوصلك أنت، ولا يروح لمنافسك؟ 👀\nاليوم العميل ما يعتمد على Google فقط، كثير صار يبحث ويسأل أدوات الذكاء الاصطناعي مثل ChatGPT عن أفضل الخيارات. وهذا بالضبط دور SEO + GEO + نخلي نشاطك يظهر في المكان اللي عميلك يبحث فيه، ونزيد زيارات، استفسارات وعملاء.\nعندنا عرض خاص حالياً، ونقدر نرسل لك تحليل سريع لموقعك يوضح فرص الظهور عندك + تفاصيل العرض. إذا حاب، أرسله لك هنا 👌`;
                    navigator.clipboard.writeText(text);
                    alert('تم نسخ نص رسالة الكويت للحافظة!');
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                >
                  نسخ النص 📋
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {`السلام عليكم ورحمه الله وبركاته حياك الله 🌸
هل عميلك في الكويت لما يبحث عن خدمتك... يوصلك أنت، ولا يروح لمنافسك؟ 👀
اليوم العميل ما يعتمد على Google فقط، كثير صار يبحث ويسأل أدوات الذكاء الاصطناعي مثل ChatGPT عن أفضل الخيارات. وهذا بالضبط دور SEO + GEO + نخلي نشاطك يظهر في المكان اللي عميلك يبحث فيه، ونزيد زيارات، استفسارات وعملاء.
عندنا عرض خاص حالياً، ونقدر نرسل لك تحليل سريع لموقعك يوضح فرص الظهور عندك + تفاصيل العرض. إذا حاب، أرسله لك هنا 👌`}
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-800">
                <span>القناة: واتساب / رسائل مباشرة</span>
                <span className="font-bold">معدل التحويل التقديري: 18%</span>
              </div>
            </div>

            {/* Script 2: منتجات سويفت ونقل الهوست */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                  <span>🚀 باقة سويفت: نقل 2 سيستم للهوست + 2 دومين</span>
                </span>
                <button
                  onClick={() => {
                    const text = `مرحباً بك، نوفر لك استضافة سحابية متكاملة تشمل نقل الـ 2 سيستم لشركتك بالكامل مع ربط 2 دومين وتأمين شهادات SSL والحماية السحابية مع مزامنة يومية مجاناً. جاهزون للبدء بنقل ملفاتك وتفعيل السيرفر فوراً.`;
                    navigator.clipboard.writeText(text);
                    alert('تم نسخ عرض نقل الهوست للحافظة!');
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                >
                  نسخ النص 📋
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {`مرحباً بك، نوفر لك استضافة سحابية متكاملة تشمل نقل الـ 2 سيستم لشركتك بالكامل مع ربط 2 دومين وتأمين شهادات SSL والحماية السحابية مع مزامنة يومية مجاناً. جاهزون للبدء بنقل ملفاتك وتفعيل السيرفر فوراً.`}
              </div>

              <div className="flex items-center justify-between text-[11px] text-blue-800">
                <span>القناة: البريد الإلكتروني والمكالمات البيعية</span>
                <span className="font-bold">استقرار السيرفر: 99.9%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: VIDEO SCRIPTS & MARKETING IDEAS BANK (اسكربتات الفيديوهات وبنك أفكار الماركيتنج - للأدمن) */}
      {activeSubView === 'scripts' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5 animate-in fade-in">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-pink-600" />
                <span>اسكربتات الفيديوهات وبنك أفكار الماركيتنج (Video Scripts & Marketing Idea Bank)</span>
                <span className="text-[11px] bg-pink-100 text-pink-800 font-extrabold px-2 py-0.5 rounded-full">
                  خاص بالأدمن 🔒
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مكان مخصص لصياغة وتجهيز اسكربتات فيديوهات الريلز والتيك توك وشورتس مع هيكل الـ Hook، المشكلة، الحل، والـ CTA وملاحظات التصوير.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddScriptModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ كتابة اسكربت فيديو أو فكرة جديدة</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['all', 'ظاهرلي جيو (GEO)', 'ظاهرلي سوشيال ميديا', 'سويفت سيلز', 'كوتشنج واستشارات'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedScriptCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedScriptCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'جميع التصنيفات' : cat}
              </button>
            ))}
          </div>

          {/* Scripts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {marketingScripts
              .filter(s => selectedScriptCategory === 'all' || s.productCategory === selectedScriptCategory)
              .map(script => {
                const isCopied = copiedScriptId === script.id;
                return (
                  <div
                    key={script.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {script.platform}
                          </span>
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {script.productCategory}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{script.targetDuration}</span>
                          </span>

                          <select
                            value={script.status}
                            onChange={e => updateMarketingScript(script.id, { status: e.target.value as any })}
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                              script.status === 'جاهز للتصوير'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : script.status === 'تم النشر'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : script.status === 'في المونتاج'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="فكرة">فكرة 💡</option>
                            <option value="جاهز للتصوير">جاهز للتصوير 🎬</option>
                            <option value="تم التصوير">تم التصوير 🎥</option>
                            <option value="في المونتاج">في المونتاج ✂️</option>
                            <option value="تم النشر">تم النشر ✅</option>
                          </select>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {script.title}
                      </h3>

                      {/* Script Body Sections */}
                      <div className="space-y-2 text-xs">
                        {/* Hook */}
                        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 space-y-1">
                          <span className="text-[10px] font-black text-amber-900 flex items-center gap-1">
                            <span>⚡ أول 3 ثواني (الخطاف - Hook):</span>
                          </span>
                          <p className="text-amber-950 font-bold leading-relaxed">{script.hook}</p>
                        </div>

                        {/* Problem */}
                        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60 space-y-1">
                          <span className="text-[10px] font-black text-rose-800">
                            ⚠️ المشكلة التي يواجهها العميل:
                          </span>
                          <p className="text-slate-800 leading-relaxed">{script.problem}</p>
                        </div>

                        {/* Solution */}
                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 space-y-1">
                          <span className="text-[10px] font-black text-blue-800">
                            💡 الحل وقيمة منتجات سويفت / ظاهرلي:
                          </span>
                          <p className="text-slate-800 leading-relaxed">{script.solution}</p>
                        </div>

                        {/* CTA */}
                        <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/70 space-y-1">
                          <span className="text-[10px] font-black text-emerald-800">
                            📣 الدعوة لاتخاذ إجراء (Call to Action):
                          </span>
                          <p className="text-emerald-950 font-bold leading-relaxed">{script.callToAction}</p>
                        </div>

                        {/* Visual Notes */}
                        {script.visualNotes && (
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                            <strong>🎬 إرشادات ولقطات التصوير (B-Roll):</strong> {script.visualNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions: Copy full script / Teleprompter / Delete */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Copy Script Button */}
                        <button
                          onClick={() => {
                            const fullText = `عنوان الاسكربت: ${script.title}\nالمنصة: ${script.platform} | المدة: ${script.targetDuration}\n\n[الخطاف Hook]:\n${script.hook}\n\n[المشكلة Problem]:\n${script.problem}\n\n[الحل Solution]:\n${script.solution}\n\n[الـ CTA]:\n${script.callToAction}\n\n[ملاحظات التصوير]:\n${script.visualNotes || 'لا توجد'}`;
                            navigator.clipboard.writeText(fullText);
                            setCopiedScriptId(script.id);
                            setTimeout(() => setCopiedScriptId(null), 2000);
                          }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title="نسخ الاسكربت بالكامل للحافظة"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'تم نسخ الاسكربت!' : 'نسخ الاسكربت'}</span>
                        </button>

                        {/* Teleprompter Reader Mode */}
                        <button
                          onClick={() => setTeleprompterScript(script)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                          title="تشغيل وضع القارئ / الملقن لتصوير الفيديو بسهولة"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>وضع الملقن 📺</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`هل تريد حذف اسكربت: ${script.title}؟`)) {
                            deleteMarketingScript(script.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="حذف الاسكربت"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODAL: TELEPROMPTER READER (وضع الملقن لقراءة الاسكربت أثناء التصوير) */}
      {teleprompterScript && (
        <div
          onClick={() => setTeleprompterScript(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white space-y-6 shadow-2xl flex flex-col max-h-[90vh] cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-pink-600/30 text-pink-400 rounded-xl">
                  <Play className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-sm text-slate-100">
                    وضع الملقن للتصوير: {teleprompterScript.title}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {teleprompterScript.platform} | المدة المقترحة: {teleprompterScript.targetDuration}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setTeleprompterScript(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Scrollable Script Text */}
            <div className="overflow-y-auto space-y-6 text-right pr-2 scrollbar-thin text-lg sm:text-xl font-bold leading-loose text-slate-100">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-xs font-mono text-amber-400 block mb-1">⚡ 1. الخطاف (HOOK):</span>
                <p className="text-amber-200">{teleprompterScript.hook}</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-xs font-mono text-rose-400 block mb-1">⚠️ 2. المشكلة (PROBLEM):</span>
                <p className="text-rose-100">{teleprompterScript.problem}</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                <span className="text-xs font-mono text-blue-400 block mb-1">💡 3. الحل (SOLUTION):</span>
                <p className="text-blue-100">{teleprompterScript.solution}</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs font-mono text-emerald-400 block mb-1">📣 4. الدعوة للإجراء (CTA):</span>
                <p className="text-emerald-200">{teleprompterScript.callToAction}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
              <span className="text-slate-400">نصيحة: تحدث بنبرة طبيعية وانظر مباشرة لعدسة الكاميرا</span>
              <button
                onClick={() => setTeleprompterScript(null)}
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl cursor-pointer"
              >
                إنهاء القراءة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD VIDEO SCRIPT */}
      {showAddScriptModal && (
        <div
          onClick={() => setShowAddScriptModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">إضافة اسكربت فيديو أو فكرة ماركيتنج جديدة</h3>
                  <p className="text-[11px] text-slate-500">صياغة نص منظم وجاهز للتصوير</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddScriptModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newScriptData.title || !newScriptData.hook) return;
                addMarketingScript({
                  title: newScriptData.title,
                  platform: newScriptData.platform,
                  productCategory: newScriptData.productCategory,
                  targetDuration: newScriptData.targetDuration,
                  hook: newScriptData.hook,
                  problem: newScriptData.problem,
                  solution: newScriptData.solution,
                  callToAction: newScriptData.callToAction,
                  visualNotes: newScriptData.visualNotes,
                  status: 'جاهز للتصوير',
                  tags: newScriptData.tags.split(',').map(t => t.trim()).filter(Boolean)
                });
                setShowAddScriptModal(false);
                setNewScriptData({
                  title: '',
                  platform: 'Instagram Reels',
                  productCategory: 'ظاهرلي جيو (GEO)',
                  targetDuration: '50 ثانية',
                  hook: '',
                  problem: '',
                  solution: '',
                  callToAction: '',
                  visualNotes: '',
                  tags: 'سوشيال, جيو, مبيعات'
                });
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الاسكربت / الفكرة: *</label>
                <input
                  type="text"
                  required
                  value={newScriptData.title}
                  onChange={e => setNewScriptData({ ...newScriptData, title: e.target.value })}
                  placeholder="مثال: فيديو ريلز: كيف تتصدر نتائج الذكاء الاصطناعي ChatGPT"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المنصة:</label>
                  <select
                    value={newScriptData.platform}
                    onChange={e => setNewScriptData({ ...newScriptData, platform: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المنتج / التصنيف:</label>
                  <select
                    value={newScriptData.productCategory}
                    onChange={e => setNewScriptData({ ...newScriptData, productCategory: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="ظاهرلي جيو (GEO)">ظاهرلي جيو (GEO)</option>
                    <option value="ظاهرلي سوشيال ميديا">ظاهرلي سوشيال ميديا</option>
                    <option value="سويفت سيلز">سويفت سيلز</option>
                    <option value="كوتشنج واستشارات">كوتشنج واستشارات</option>
                    <option value="سيستم الشركات">سيستم الشركات</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدة المقترحة:</label>
                  <input
                    type="text"
                    value={newScriptData.targetDuration}
                    onChange={e => setNewScriptData({ ...newScriptData, targetDuration: e.target.value })}
                    placeholder="50 ثانية"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">⚡ الخطاف (Hook - أول 3 ثواني لجذب المشاهد): *</label>
                <textarea
                  rows={2}
                  required
                  value={newScriptData.hook}
                  onChange={e => setNewScriptData({ ...newScriptData, hook: e.target.value })}
                  placeholder="سؤال صادم أو رقم يوقف التمرير في أول ثانيتين..."
                  className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">⚠️ المشكلة (Problem):</label>
                <textarea
                  rows={2}
                  value={newScriptData.problem}
                  onChange={e => setNewScriptData({ ...newScriptData, problem: e.target.value })}
                  placeholder="شرح المشكلة التي تجعل العميل يخسر أموال أو عملاء..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">💡 الحل والقيمة (Solution):</label>
                <textarea
                  rows={2}
                  value={newScriptData.solution}
                  onChange={e => setNewScriptData({ ...newScriptData, solution: e.target.value })}
                  placeholder="كيف يحل منتجنا المشكلة بسرعة وسهولة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">📣 الدعوة لاتخاذ إجراء (Call To Action):</label>
                <input
                  type="text"
                  value={newScriptData.callToAction}
                  onChange={e => setNewScriptData({ ...newScriptData, callToAction: e.target.value })}
                  placeholder="مثال: علق بكلمة 'ظاهر' لنرسل لك دراسة الحالة فوراً على الخاص!"
                  className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">🎬 لقطات وملاحظات التصوير (B-Roll):</label>
                <input
                  type="text"
                  value={newScriptData.visualNotes}
                  onChange={e => setNewScriptData({ ...newScriptData, visualNotes: e.target.value })}
                  placeholder="مثال: لقطة شاشة شات جي بي تي + تصوير سيلفي أمامي"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddScriptModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  حفظ الاسكربت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 4: SWITCH BOARDS (التبديل بين بوردات الماركيتنج) */}
      {activeSubView === 'switch_boards' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <span>بوردات الماركيتنج المتاحة للأدمن</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكنك التبديل بين اللوحات المخصصة لحملات السوشيال، نقل الهوست، وبوردات العملاء.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {marketingBoards.map(b => (
              <div
                key={b.id}
                onClick={() => {
                  setActiveMarketingBoardId(b.id);
                  setActiveSubView('board');
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  b.id === activeMarketingBoardId
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">{b.title}</h3>
                    {b.id === activeMarketingBoardId && (
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                        النشط الآن
                      </span>
                    )}
                  </div>
                  {b.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {b.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                  <span>{b.lists.length} قوائم</span>
                  <span className="text-blue-600">فتح اللوحة ←</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Details Modal (عرض وتعديل ونسخ ولصق الكارت) */}
      {selectedCardForModal && (
        <div
          onClick={() => setSelectedCardForModal(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  كارت تسويقي
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedCardForModal.assigneeName || 'هدير سعيد'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* 📋 زر نسخ النص المباشر */}
                <button
                  type="button"
                  onClick={() => {
                    const text = selectedCardForModal.description
                      ? `${selectedCardForModal.title}\n\n${selectedCardForModal.description}`
                      : selectedCardForModal.title;
                    navigator.clipboard.writeText(text);
                    setCopiedCardId(selectedCardForModal.id);
                    showToast('تم نسخ نص الكارت بالكامل إلى الحافظة! 📋');
                    setTimeout(() => setCopiedCardId(null), 2500);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedCardId === selectedCardForModal.id
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="نسخ نص الكارت بالكامل"
                >
                  {copiedCardId === selectedCardForModal.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم النسخ ✅</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ النص 📋</span>
                    </>
                  )}
                </button>

                {/* ✏️ زر تعديل الكارت والصورة */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isModalEditing) {
                      handleStartModalEdit(selectedCardForModal);
                    } else {
                      setIsModalEditing(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isModalEditing
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                  title="تعديل تفاصيل وصورة الكارت"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isModalEditing ? 'إلغاء التعديل' : 'تعديل الكارت والصورة ✏️'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedCardForModal(null);
                    setIsModalEditing(false);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* وضع العرض: الغلاف مع خيارات تغيير أو رفع الصورة */}
            {!isModalEditing && (
              selectedCardForModal.coverImage ? (
                <div className="relative group/cover rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                  <img
                    src={selectedCardForModal.coverImage}
                    alt={selectedCardForModal.title}
                    className="w-full h-48 object-cover group-hover/cover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <label
                      className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                      title="رفع واستبدال الصورة من جهازك"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>تغيير الصورة 📷</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleCardDirectImageUpload(e, selectedCardForModal.id)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={e => handleRemoveCardImage(e, selectedCardForModal.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الصورة</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/60 p-3 transition-colors">
                  <label className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 cursor-pointer">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>رفع صورة أو بانر لهذا الكارت من جهازك (JPG / PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleCardDirectImageUpload(e, selectedCardForModal.id)}
                    />
                  </label>
                </div>
              )
            )}

            {isModalEditing ? (
              /* وضع تعديل الكارت بالكامل ورفع الصورة */
              <div className="space-y-3.5 animate-in fade-in">
                {/* 1. قسم رفع صورة الكارت */}
                <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-100 space-y-2">
                  <label className="block text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>صورة وغلاف الكارت:</span>
                  </label>

                  {modalEditCoverImage ? (
                    <div className="relative rounded-lg overflow-hidden border border-blue-200 h-32 bg-slate-900 group">
                      <img
                        src={modalEditCoverImage}
                        alt="معاينة الصورة"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1 hover:bg-slate-100">
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                          <span>تغيير الصورة</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async e => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const url = await handleFileToDataUrl(f);
                                setModalEditCoverImage(url);
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setModalEditCoverImage('')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>إزالة</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <label className="w-full sm:w-auto flex-1 py-2.5 px-3 bg-white hover:bg-blue-50 border border-dashed border-blue-300 rounded-xl text-xs font-bold text-blue-700 cursor-pointer flex items-center justify-center gap-2 transition-all">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>انقر لرفع صورة من جهازك 📷</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const url = await handleFileToDataUrl(f);
                              setModalEditCoverImage(url);
                              showToast('تم تحميل الصورة بنجاح! 📸');
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold shrink-0">أو رابط صورة:</span>
                    <input
                      type="url"
                      value={modalEditCoverImage}
                      onChange={e => setModalEditCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* 2. عنوان الكارت */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">عنوان / نص الكارت الأساسي: *</label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) {
                            setModalEditTitle(prev => (prev ? prev + ' ' + text : text));
                            showToast('تم لصق النص من الحافظة! 📋');
                          }
                        } catch {
                          const manual = prompt('الصق النص هنا:');
                          if (manual) setModalEditTitle(prev => (prev ? prev + ' ' + manual : manual));
                        }
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ClipboardPaste className="w-3 h-3" />
                      <span>لصق من الحافظة 📋</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={modalEditTitle}
                    onChange={e => setModalEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 resize-y leading-relaxed"
                    autoFocus
                  />
                </div>

                {/* 3. تفاصيل الكارت */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل إضافية / وصف الكارت:</label>
                  <textarea
                    rows={3}
                    value={modalEditDesc}
                    onChange={e => setModalEditDesc(e.target.value)}
                    placeholder="اكتب أو الصق تفاصيل إضافية هنا..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 resize-y leading-relaxed"
                  />
                </div>

                {/* 4. الرابط والتسمية */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">رابط الزر (URL):</label>
                    <input
                      type="url"
                      value={modalEditLinkUrl}
                      onChange={e => setModalEditLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">تسمية الزر (Label):</label>
                    <input
                      type="text"
                      value={modalEditLinkLabel}
                      onChange={e => setModalEditLinkLabel(e.target.value)}
                      placeholder="مثال: فتح الموقع أو تجربة الأداة"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 5. التصنيف وتاريخ الاستحقاق */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">تصنيف الكارت:</label>
                    <input
                      type="text"
                      value={modalEditLabelName}
                      onChange={e => setModalEditLabelName(e.target.value)}
                      placeholder="مثال: حملة كويت، ريلز، SEO..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ الاستحقاق:</label>
                    <input
                      type="date"
                      value={modalEditDueDate}
                      onChange={e => setModalEditDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveModalEdit}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>حفظ التعديلات والصورة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsModalEditing(false)}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* وضع العرض والقراءة والنسخ */
              <div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-2 select-text">
                  <h3 className="text-sm font-black text-slate-900 leading-snug">
                    {selectedCardForModal.title}
                  </h3>

                  {selectedCardForModal.description && (
                    <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedCardForModal.description}
                    </div>
                  )}
                </div>

                {selectedCardForModal.linkUrl && (
                  <div className="mt-3">
                    <a
                      href={selectedCardForModal.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>زيارة الرابط: {selectedCardForModal.linkLabel || selectedCardForModal.linkUrl}</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('حذف هذا الكارت نهائياً؟')) {
                    deleteMarketingCard(selectedCardForModal.id);
                    setSelectedCardForModal(null);
                    showToast('تم حذف الكارت');
                  }
                }}
                className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الكارت</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCardForModal(null);
                  setIsModalEditing(false);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Add Card Full Modal */}
      {showTopAddCardModal && (
        <div
          onClick={() => setShowTopAddCardModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>إضافة كارت تسويقي جديد للوحة</span>
              </h3>
              <button
                onClick={() => setShowTopAddCardModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTopAddCardSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">القائمة المستهدفة:</label>
                <select
                  value={topAddCardData.listId}
                  onChange={e => setTopAddCardData({ ...topAddCardData, listId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {activeBoard.lists.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الكارت / الحملة: *</label>
                <input
                  type="text"
                  required
                  value={topAddCardData.title}
                  onChange={e => setTopAddCardData({ ...topAddCardData, title: e.target.value })}
                  placeholder="مثال: رسالة استقطاب عملاء الكويت أو فيديو ريلز"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف أو محتوى الرسالة:</label>
                <textarea
                  rows={3}
                  value={topAddCardData.description}
                  onChange={e => setTopAddCardData({ ...topAddCardData, description: e.target.value })}
                  placeholder="نص الرسالة التسويقية أو تفاصيل الحملة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* قسم رفع صورة للكارت الجديد */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>صورة الكارت (من جهازك أو رابط):</span>
                  </span>
                  {topAddCardData.coverImage && (
                    <button
                      type="button"
                      onClick={() => setTopAddCardData({ ...topAddCardData, coverImage: '' })}
                      className="text-rose-600 hover:underline text-[10px]"
                    >
                      حذف الصورة
                    </button>
                  )}
                </div>

                {topAddCardData.coverImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-900">
                    <img src={topAddCardData.coverImage} alt="معاينة" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <label className="w-full py-2 px-3 bg-white hover:bg-blue-50 border border-dashed border-blue-300 rounded-lg text-[11px] font-bold text-blue-700 cursor-pointer flex items-center justify-center gap-1.5 transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>رفع صورة من جهازك 📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await handleFileToDataUrl(f);
                          setTopAddCardData({ ...topAddCardData, coverImage: url });
                          showToast('تم تحميل الصورة بنجاح! 📸');
                        }
                      }}
                    />
                  </label>
                )}

                <input
                  type="url"
                  value={topAddCardData.coverImage}
                  onChange={e => setTopAddCardData({ ...topAddCardData, coverImage: e.target.value })}
                  placeholder="أو الصق رابط صورة مباشر (URL)..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رابط (Link URL):</label>
                  <input
                    type="url"
                    value={topAddCardData.linkUrl}
                    onChange={e => setTopAddCardData({ ...topAddCardData, linkUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الاستحقاق:</label>
                  <input
                    type="date"
                    value={topAddCardData.dueDate}
                    onChange={e => setTopAddCardData({ ...topAddCardData, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTopAddCardModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  إضافة الكارت للوحة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteModal && (
        <div
          onClick={() => setConfirmDeleteModal(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 cursor-default"
          >
            <h3 className="text-sm font-black text-slate-900">{confirmDeleteModal.title}</h3>
            <p className="text-xs text-slate-600">{confirmDeleteModal.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDeleteModal.onConfirm();
                  setConfirmDeleteModal(null);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Marketing Task Modal */}
      {showAddMarketingTaskModal && (
        <div
          onClick={() => setShowAddMarketingTaskModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>إضافة تاسك تسويقي جديد للوحة العمل</span>
              </h3>
              <button
                onClick={() => setShowAddMarketingTaskModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newMarketingTaskData.title.trim()) return;
                setMarketingTasks(prev => [
                  {
                    id: 'mtask-' + Date.now(),
                    title: newMarketingTaskData.title.trim(),
                    channel: newMarketingTaskData.channel,
                    deliverable: newMarketingTaskData.deliverable,
                    dueDate: newMarketingTaskData.dueDate,
                    priority: newMarketingTaskData.priority,
                    completed: false,
                    assignee: newMarketingTaskData.assignee,
                    notes: newMarketingTaskData.notes.trim()
                  },
                  ...prev
                ]);
                setShowAddMarketingTaskModal(false);
                setNewMarketingTaskData({
                  title: '',
                  channel: 'الكويت والخليج',
                  deliverable: 'تواصل مباشر',
                  dueDate: new Date().toISOString().split('T')[0],
                  priority: 'عالية',
                  assignee: 'هدير سعيد',
                  notes: ''
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان المهمة التسويقية: *</label>
                <input
                  type="text"
                  required
                  value={newMarketingTaskData.title}
                  onChange={e => setNewMarketingTaskData({ ...newMarketingTaskData, title: e.target.value })}
                  placeholder="مثال: تجهيز تصميم إعلان باقة الـ 2 سيستم لعملاء الكويت"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القناة المستهدفة:</label>
                  <select
                    value={newMarketingTaskData.channel}
                    onChange={e => setNewMarketingTaskData({ ...newMarketingTaskData, channel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="الكويت والخليج">الكويت والخليج</option>
                    <option value="سوشيال ميديا وريلز">سوشيال ميديا وريلز</option>
                    <option value="الهوست والدومينات">الهوست والدومينات</option>
                    <option value="سويفت ومنتجات السيلز">سويفت ومنتجات السيلز</option>
                    <option value="إعلانات ممولة">إعلانات ممولة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع المخرج (Deliverable):</label>
                  <select
                    value={newMarketingTaskData.deliverable}
                    onChange={e => setNewMarketingTaskData({ ...newMarketingTaskData, deliverable: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="تواصل مباشر">تواصل مباشر</option>
                    <option value="مونتاج ونشر">مونتاج ونشر</option>
                    <option value="تصميم جرافيك">تصميم جرافيك</option>
                    <option value="صياغة محتوى (Copy)">صياغة محتوى (Copy)</option>
                    <option value="إعداد تقني واستضافة">إعداد تقني واستضافة</option>
                    <option value="حملة إعلانية">حملة إعلانية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسؤول عن التنفيذ:</label>
                  <select
                    value={newMarketingTaskData.assignee}
                    onChange={e => setNewMarketingTaskData({ ...newMarketingTaskData, assignee: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="هدير سعيد">هدير سعيد (المدير)</option>
                    <option value="سارة المنصوري">سارة المنصوري (تسويق)</option>
                    <option value="طارق القحطاني">طارق القحطاني (تقنية وهست)</option>
                    <option value="أحمد الشريف">أحمد الشريف (مبيعات)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الاستحقاق:</label>
                  <input
                    type="date"
                    value={newMarketingTaskData.dueDate}
                    onChange={e => setNewMarketingTaskData({ ...newMarketingTaskData, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات وروابط المهمة:</label>
                <textarea
                  rows={2}
                  value={newMarketingTaskData.notes}
                  onChange={e => setNewMarketingTaskData({ ...newMarketingTaskData, notes: e.target.value })}
                  placeholder="أي روابط تصاميم، سكربتات، أو تفاصيل للمهمة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMarketingTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  إضافة التاسك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification for Copy/Paste/Edit */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in slide-in-from-bottom">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
