import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Star,
  ChevronDown,
  HelpCircle,
  BarChart3,
  Download,
  Calendar,
  X,
  CheckCircle2,
  Filter,
  Trash2,
  AlertTriangle,
  FileText,
  Check,
  FileSpreadsheet,
  Upload,
  Link2,
  ExternalLink,
  Sparkles,
  Paperclip,
  FileCheck,
  Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useCRM } from '../../context/CRMContext';
import { ReportItem } from '../../types/crm';

export const ReportsListView: React.FC = () => {
  const { reports, addReport, deleteReport, currentUser } = useCRM();

  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<'all' | 'pdf' | 'sheet' | 'system'>('all');
  const [reportSearch, setReportSearch] = useState<string>('');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [starredReports, setStarredReports] = useState<string[]>(['rep-1', 'rep-8']);
  const [activeReportModal, setActiveReportModal] = useState<ReportItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'link' | 'system'>('file');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: 'pdf' | 'sheet';
    dataUrl?: string;
  } | null>(null);
  const [sheetUrlInput, setSheetUrlInput] = useState('');

  // Delete Confirmation Modal State
  const [reportToDelete, setReportToDelete] = useState<{
    isMultiple: boolean;
    ids: string[];
    title?: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New report form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFolder, setNewFolder] = useState('شيتات ومستندات العملاء');

  // Folders list
  const folders = [
    { id: 'all', label: 'كافة التقارير' },
    { id: 'شيتات ومستندات العملاء', label: 'شيتات ومستندات العملاء 📊' },
    { id: 'تقارير المبيعات', label: 'تقارير المبيعات 📈' },
    { id: 'تقارير البريد الإلكتروني', label: 'تقارير البريد الإلكتروني ✉️' },
    { id: 'تقارير الاجتماع', label: 'تقارير الاجتماع 🗓️' },
    { id: 'تقارير المهام والأنشطة', label: 'تقارير المهام والأنشطة ✅' }
  ];

  // Handle local file selection (PDF or Sheet)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const lowerName = fileName.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf');
    const isSheet =
      lowerName.endsWith('.xlsx') ||
      lowerName.endsWith('.xls') ||
      lowerName.endsWith('.csv');

    if (!isPdf && !isSheet) {
      alert('يرجى اختيار ملف PDF أو ملف شيت إكسيل (XLSX, XLS, CSV)');
      return;
    }

    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${fileSizeMb} MB`;

    // Auto-set title if empty
    if (!newTitle.trim()) {
      setNewTitle(fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setUploadedFile({
        name: fileName,
        size: sizeStr,
        type: isPdf ? 'pdf' : 'sheet',
        dataUrl
      });
    };
    reader.readAsDataURL(file);
  };

  // Filter reports
  const filteredReports = reports.filter(r => {
    if (selectedFolder !== 'all' && r.folder !== selectedFolder) return false;
    if (selectedFileType !== 'all') {
      const type = r.fileType || 'system';
      if (type !== selectedFileType) return false;
    }
    if (reportSearch.trim()) {
      const q = reportSearch.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.fileName && r.fileName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedReports(filteredReports.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedReports(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredReports(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Trigger delete for single report
  const handleRequestDeleteSingle = (rep: ReportItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReportToDelete({
      isMultiple: false,
      ids: [rep.id],
      title: rep.title
    });
  };

  // Trigger bulk delete for selected reports
  const handleRequestDeleteMultiple = () => {
    if (selectedReports.length === 0) return;
    setReportToDelete({
      isMultiple: true,
      ids: selectedReports
    });
  };

  // Execute deletion
  const handleConfirmDelete = () => {
    if (!reportToDelete) return;

    reportToDelete.ids.forEach(id => {
      deleteReport(id);
    });

    setSelectedReports(prev => prev.filter(id => !reportToDelete.ids.includes(id)));
    if (activeReportModal && reportToDelete.ids.includes(activeReportModal.id)) {
      setActiveReportModal(null);
    }

    const count = reportToDelete.ids.length;
    setToastMessage(
      count === 1
        ? `تم حذف التقرير "${reportToDelete.title || ''}" بنجاح 🗑️`
        : `تم حذف ${count} تقارير محددة بنجاح 🗑️`
    );

    setReportToDelete(null);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Download a report file
  const handleDownloadReportFile = (rep: ReportItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (rep.sheetLink) {
      window.open(rep.sheetLink, '_blank');
      return;
    }

    if (rep.fileUrl) {
      const a = document.createElement('a');
      a.href = rep.fileUrl;
      a.download = rep.fileName || `${rep.title}.${rep.fileType === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Fallback: Generate CSV/XLSX text for system report
    const sampleData = [
      { 'عنوان التقرير': rep.title, 'التصنيف': rep.folder, 'الوصف': rep.description, 'المنشئ': rep.createdBy, 'التاريخ': rep.lastAccessed }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تقرير');
    XLSX.writeFile(wb, `${rep.title}.xlsx`);
  };

  // Export current list to Excel
  const handleExportReportsTableToExcel = () => {
    const data = filteredReports.map(r => ({
      'عنوان التقرير': r.title,
      'نوع التقرير': r.fileType === 'pdf' ? 'ملف PDF' : r.fileType === 'sheet' ? 'شيت إكسيل' : 'تقرير نظام',
      'المجلد': r.folder,
      'الوصف': r.description,
      'اسم الملف': r.fileName || '-',
      'حجم الملف': r.fileSize || '-',
      'المنشئ': r.createdBy,
      'آخر وصول': r.lastAccessed
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قائمة_التقارير');
    XLSX.writeFile(wb, `سجل_التقارير_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Handle Create / Upload Report
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let finalFileType: 'pdf' | 'sheet' | 'system' = 'system';
    let finalFileName: string | undefined = undefined;
    let finalFileSize: string | undefined = undefined;
    let finalFileUrl: string | undefined = undefined;
    let finalSheetLink: string | undefined = undefined;

    if (uploadMode === 'file' && uploadedFile) {
      finalFileType = uploadedFile.type;
      finalFileName = uploadedFile.name;
      finalFileSize = uploadedFile.size;
      finalFileUrl = uploadedFile.dataUrl;
    } else if (uploadMode === 'link' && sheetUrlInput.trim()) {
      finalFileType = 'sheet';
      finalSheetLink = sheetUrlInput.trim();
      finalFileName = 'شيت جوجل شيت مباشر';
      finalFileSize = 'Google Cloud';
    }

    addReport({
      title: newTitle.trim(),
      description: newDesc.trim() || (finalFileName ? `ملف مرفق: ${finalFileName}` : 'تقرير مساحة العمل...'),
      folder: newFolder,
      lastAccessed: 'اليوم',
      createdBy: currentUser?.name || 'المدير العام',
      fileType: finalFileType,
      fileName: finalFileName,
      fileSize: finalFileSize,
      fileUrl: finalFileUrl,
      sheetLink: finalSheetLink
    });

    setNewTitle('');
    setNewDesc('');
    setUploadedFile(null);
    setSheetUrlInput('');
    setShowCreateModal(false);

    setToastMessage(
      finalFileType === 'pdf'
        ? 'تم رفع وحفظ تقرير الـ PDF بنجاح 📄'
        : finalFileType === 'sheet'
        ? 'تم رفع وحفظ شيت الإكسيل بنجاح 📊'
        : 'تم إنشاء التقرير الجديد بنجاح ✨'
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden text-xs relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-l from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight">
                مركز التقارير والشيتات وملفات PDF (Reports & Sheets Hub)
              </h1>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                {reports.length} تقرير
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              رفع وتخزين تقارير العمل كملفات PDF أو شيتات إكسيل (XLSX, CSV) وروابط Google Sheets مع التحميل والمعاينة الفورية.
            </p>
          </div>
        </div>

        {/* Action Buttons: رفع تقرير PDF / شيت + تصدير */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setUploadMode('file');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
          >
            <Upload className="w-4 h-4" />
            <span>📄 رفع تقرير PDF أو شيت إكسيل</span>
          </button>

          <button
            onClick={handleExportReportsTableToExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs transition-all cursor-pointer"
            title="تصدير جدول التقارير كملف إكسيل كامل"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير السجل إكسيل</span>
          </button>
        </div>
      </div>

      {/* Top Toolbar Bar: Filters & Search */}
      <div className="p-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        {/* Right side: Folders & Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Folders Dropdown */}
          <div className="relative">
            <select
              value={selectedFolder}
              onChange={e => setSelectedFolder(e.target.value)}
              className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl pr-3 pl-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
            >
              {folders.map(f => (
                <option key={f.id} value={f.id}>
                  {f.label} ({f.id === 'all' ? reports.length : reports.filter(r => r.folder === f.id).length})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* File Type Filter Pill */}
          <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-xl shadow-2xs text-[11px]">
            <button
              onClick={() => setSelectedFileType('all')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                selectedFileType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedFileType('pdf')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                selectedFileType === 'pdf' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <span>📄</span>
              <span>ملفات PDF</span>
            </button>
            <button
              onClick={() => setSelectedFileType('sheet')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                selectedFileType === 'sheet' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <span>📊</span>
              <span>شيتات إكسيل</span>
            </button>
          </div>

          {/* Bulk Selection Actions (زر حذف التقارير المحددة) */}
          {selectedReports.length > 0 && (
            <div className="flex items-center gap-2 bg-rose-50/90 border border-rose-200 px-2.5 py-1 rounded-lg animate-in fade-in">
              <span className="text-[11px] font-bold text-rose-800">
                محدد: {selectedReports.length}
              </span>
              <button
                type="button"
                onClick={handleRequestDeleteMultiple}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                title="حذف جميع التقارير التي تم تحديدها"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف التقارير المحددة</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReports([])}
                className="text-[10px] text-slate-500 hover:text-slate-800 font-bold px-1 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* Left side: Search & Fast Upload Button */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              value={reportSearch}
              onChange={e => setReportSearch(e.target.value)}
              placeholder="البحث في التقارير والشيتات..."
              className="w-full bg-white pr-3 pl-8 py-1.5 rounded-xl border border-slate-200 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-200/80 font-bold">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onChange={handleSelectAll}
                  className="rounded text-blue-600 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-1 w-8"></th>
              <th className="py-2.5 px-4">نوع الملف</th>
              <th className="py-2.5 px-4">عنوان التقرير</th>
              <th className="py-2.5 px-4">المجلد والتصنيف</th>
              <th className="py-2.5 px-4">الملف / الشيت المرفق</th>
              <th className="py-2.5 px-4">المنشئ</th>
              <th className="py-2.5 px-4">آخر تعديل</th>
              <th className="py-2.5 px-4 text-center">تحميل / معاينة</th>
              <th className="py-2.5 px-3 w-10 text-center">حذف</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <span className="font-bold">لا توجد تقارير أو شيتات تطابق البحث</span>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-2 text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      + انقر لرفع أول تقرير PDF أو شيت إكسيل الآن
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredReports.map(rep => {
                const isSelected = selectedReports.includes(rep.id);
                const isStarred = starredReports.includes(rep.id);
                const isPdf = rep.fileType === 'pdf';
                const isSheet = rep.fileType === 'sheet';

                return (
                  <tr
                    key={rep.id}
                    onClick={() => setActiveReportModal(rep)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rep.id)}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-1 text-center" onClick={e => toggleStar(rep.id, e)}>
                      <Star
                        className={`w-3.5 h-3.5 transition-colors cursor-pointer ${
                          isStarred
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </td>

                    {/* File Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isPdf ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span>📄</span>
                          <span>PDF</span>
                        </span>
                      ) : isSheet ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>📊</span>
                          <span>إكسيل / شيت</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <span>⚙️</span>
                          <span>تقرير نظام</span>
                        </span>
                      )}
                    </td>

                    {/* Report Title */}
                    <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{rep.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                        {rep.description}
                      </p>
                    </td>

                    {/* Folder */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
                        {rep.folder}
                      </span>
                    </td>

                    {/* Attached File / Sheet Info */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {rep.fileName ? (
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span className="max-w-[140px] truncate" title={rep.fileName}>
                            {rep.fileName}
                          </span>
                          {rep.fileSize && (
                            <span className="text-[10px] text-slate-400">({rep.fileSize})</span>
                          )}
                        </div>
                      ) : rep.sheetLink ? (
                        <a
                          href={rep.sheetLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold text-[11px]"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>فتح جوجل شيت ↗</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">تقرير إلكتروني</span>
                      )}
                    </td>

                    {/* Creator */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {rep.createdBy}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {rep.lastAccessed}
                    </td>

                    {/* Download / Open Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={e => handleDownloadReportFile(rep, e)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                          title="تحميل الملف أو الشيت"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">تحميل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveReportModal(rep)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="معاينة التقرير"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Row Delete Button */}
                    <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={e => handleRequestDeleteSingle(rep, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={`حذف التقرير: ${rep.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600 shrink-0 mt-0.5">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-900">
                  {reportToDelete.isMultiple ? 'تأكيد حذف التقارير المحددة' : 'تأكيد حذف التقرير'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {reportToDelete.isMultiple
                    ? `هل أنت متأكد من حذف ${reportToDelete.ids.length} تقارير تم تحديدها نهائياً من المنظومة؟`
                    : `هل أنت متأكد من حذف التقرير "${reportToDelete.title}" نهائياً من قائمة التقارير؟`}
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl text-[11px] text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>لا يمكن التراجع عن هذا الإجراء بعد الحذف.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold rounded-xl cursor-pointer text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف التقرير</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Report View Modal */}
      {activeReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                    {activeReportModal.folder}
                  </span>
                  {activeReportModal.fileType === 'pdf' ? (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      📄 ملف PDF
                    </span>
                  ) : activeReportModal.fileType === 'sheet' ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      📊 شيت إكسيل
                    </span>
                  ) : null}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {activeReportModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveReportModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {activeReportModal.description}
            </p>

            {/* If has attached file */}
            {activeReportModal.fileName && (
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-blue-900 font-bold">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span>الملف المرفق: {activeReportModal.fileName}</span>
                  {activeReportModal.fileSize && (
                    <span className="text-[10px] text-slate-500 font-mono">({activeReportModal.fileSize})</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadReportFile(activeReportModal)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الملف الآن</span>
                </button>
              </div>
            )}

            {/* If has direct Google Sheet Link */}
            {activeReportModal.sheetLink && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>رابط Google Sheet المباشر: {activeReportModal.sheetLink}</span>
                </div>
                <a
                  href={activeReportModal.sheetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح في نافذة جديدة</span>
                </a>
              </div>
            )}

            {/* Simulated Live Analytics Data for this report */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-800 text-xs">بيانات وملخص التحليل:</h4>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <div className="text-[10px] text-blue-600 font-bold">معدل الفتح والاطلاع</div>
                  <div className="text-xl font-black text-blue-700 mt-1">74.2%</div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <div className="text-[10px] text-emerald-600 font-bold">نسبة اكتمال العمل</div>
                  <div className="text-xl font-black text-emerald-700 mt-1">88.5%</div>
                </div>
                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
                  <div className="text-[10px] text-purple-600 font-bold">إجمالي السجلات المحللة</div>
                  <div className="text-xl font-black text-purple-700 mt-1">1,240</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadReportFile(activeReportModal)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل التقرير</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestDeleteSingle(activeReportModal)}
                  className="px-3.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-xs border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف التقرير</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveReportModal(null)}
                className="px-5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateReport}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span>رفع تقرير جديد (PDF أو شيت إكسيل)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ارفع ملف التقرير لتخزينه وتوفيره للتحميل والمطالعة
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadMode === 'file'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📁</span>
                <span>رفع ملف (PDF / شيت)</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('link')}
                className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadMode === 'link'
                    ? 'bg-white text-emerald-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🔗</span>
                <span>رابط Google Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('system')}
                className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadMode === 'system'
                    ? 'bg-white text-purple-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⚙️</span>
                <span>تقرير إلكتروني</span>
              </button>
            </div>

            {/* File Upload Zone */}
            {uploadMode === 'file' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf, .xlsx, .xls, .csv, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 p-5 rounded-xl text-center transition-all cursor-pointer space-y-1.5"
                >
                  <Upload className="w-7 h-7 text-blue-600 mx-auto" />
                  <div className="font-bold text-slate-800 text-xs">
                    انقر لاختيار ملف التقرير (PDF أو شيت إكسيل)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    الصيغ المدعومة: PDF (.pdf)، إكسيل (.xlsx, .xls)، جداول CSV
                  </div>
                </div>

                {uploadedFile && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>{uploadedFile.name}</span>
                      <span className="text-[10px] font-mono text-emerald-600">({uploadedFile.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Google Sheet URL Zone */}
            {uploadMode === 'link' && (
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold text-xs">
                  رابط شيت جوجل (Google Sheets URL):
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={sheetUrlInput}
                    onChange={e => setSheetUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                    dir="ltr"
                  />
                  <Link2 className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>
            )}

            {/* Title & Folder Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-xs">عنوان التقرير</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثال: تقرير إغلاق صفقات شهر أكتوبر"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-xs">المجلد والتصنيف</label>
                <select
                  value={newFolder}
                  onChange={e => setNewFolder(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold text-xs"
                >
                  <option value="شيتات ومستندات العملاء">شيتات ومستندات العملاء 📊</option>
                  <option value="تقارير المبيعات">تقارير المبيعات 📈</option>
                  <option value="تقارير البريد الإلكتروني">تقارير البريد الإلكتروني ✉️</option>
                  <option value="تقارير الاجتماع">تقارير الاجتماع 🗓️</option>
                  <option value="تقارير المهام والأنشطة">تقارير المهام والأنشطة ✅</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-xs">وصف وملاحظات التقرير</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="اكتب تفاصيل أو ملاحظات حول التقرير..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-normal text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ ورفع التقرير</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
