import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileCode,
  FolderGit2,
  HelpCircle,
  Sparkles,
  ArrowDownToLine,
  ArrowUpFromLine,
  Database,
  Lock,
  GitBranch
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCRM } from '../../context/CRMContext';

export const GitHubSyncModal: React.FC = () => {
  const {
    isGitHubModalOpen,
    setIsGitHubModalOpen,
    getSystemBackupJson,
    importSystemBackup,
    exportSystemBackup,
    team,
    tasks,
    deals,
    leads
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'guide'>('export');

  // GitHub Repository Configurations
  const [repo, setRepo] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('swift_github_repo')) || 'hadeersaid985-sys/SWIFT';
  });
  const [branch, setBranch] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('swift_github_branch')) || 'main';
  });
  const [filePath, setFilePath] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('swift_github_path')) || 'backup/latest-data.json';
  });
  const [token, setToken] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('swift_github_token')) || '';
  });
  const [saveTokenLocally, setSaveTokenLocally] = useState(true);

  // Raw URL for quick import
  const [rawUrl, setRawUrl] = useState('');

  // Status and feedback
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);

  const localFileInputRef = useRef<HTMLInputElement>(null);

  // Save configs to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('swift_github_repo', repo);
        localStorage.setItem('swift_github_branch', branch);
        localStorage.setItem('swift_github_path', filePath);
        if (saveTokenLocally && token) {
          localStorage.setItem('swift_github_token', token);
        } else if (!token) {
          localStorage.removeItem('swift_github_token');
        }
      } catch (e) {}
    }
  }, [repo, branch, filePath, token, saveTokenLocally]);

  if (!isGitHubModalOpen) return null;

  // 1. Export: Direct Push to GitHub via REST API
  const handleDirectPushToGitHub = async () => {
    if (!token.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'يرجى إدخال GitHub Personal Access Token (PAT) ليتمكن السيستم من الحفظ في المستودع مباشرة.'
      });
      return;
    }

    const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (!cleanRepo || !cleanRepo.includes('/')) {
      setStatusMessage({
        type: 'error',
        text: 'يرجى كتابة اسم المستودع بالصيغة: username/repository (مثال: hadeersaid985-sys/SWIFT)'
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    setCommitUrl(null);

    try {
      const backupJson = getSystemBackupJson();
      const contentBase64 = btoa(unescape(encodeURIComponent(backupJson)));
      const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${filePath.trim()}`;

      // Check if file already exists to get its SHA
      let existingSha: string | undefined = undefined;
      try {
        const checkRes = await fetch(`${apiUrl}?ref=${branch.trim()}`, {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });
        if (checkRes.ok) {
          const fileData = await checkRes.json();
          existingSha = fileData.sha;
        }
      } catch (err) {
        // file doesn't exist yet, which is fine
      }

      const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const commitMessage = `تحديث النسخة الاحتياطية للبيانات - ${dateStr} [SWIFTMYND]`;

      const bodyPayload: any = {
        message: commitMessage,
        content: contentBase64,
        branch: branch.trim()
      };
      if (existingSha) {
        bodyPayload.sha = existingSha;
      }

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        throw new Error(errJson.message || `خطأ كود (${putRes.status})`);
      }

      const resData = await putRes.json();
      const htmlUrl = resData?.commit?.html_url || `https://github.com/${cleanRepo}/blob/${branch.trim()}/${filePath.trim()}`;
      setCommitUrl(htmlUrl);

      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      setStatusMessage({
        type: 'success',
        text: `تم تصدير وحفظ أحدث نسخة من بيانات النظام في GitHub بنجاح! مسار الملف: ${filePath}`
      });
    } catch (err: any) {
      console.error('GitHub Push Error:', err);
      setStatusMessage({
        type: 'error',
        text: `فشل الحفظ في GitHub: ${err?.message || 'تأكدي من صلاحيات الـ Token واسم المستودع'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Export: Copy JSON to Clipboard
  const handleCopyBackupJson = () => {
    try {
      const json = getSystemBackupJson();
      navigator.clipboard.writeText(json);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      setStatusMessage({
        type: 'info',
        text: 'تم نسخ كود الـ JSON كاملاً للحافظة! يمكنك لصقه مباشرة في ملف جديد داخل GitHub.'
      });
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'فشل النسخ للحافظة.' });
    }
  };

  // 3. Import: Pull from GitHub Repo
  const handlePullFromGitHub = async () => {
    const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (!cleanRepo || !cleanRepo.includes('/')) {
      setStatusMessage({
        type: 'error',
        text: 'يرجى كتابة اسم المستودع بالصيغة: username/repository (مثال: hadeersaid985-sys/SWIFT)'
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      let jsonData = '';

      // Try raw link first (works for public repos without token)
      const rawTargetUrl = `https://raw.githubusercontent.com/${cleanRepo}/${branch.trim()}/${filePath.trim()}?t=${Date.now()}`;
      
      const headers: Record<string, string> = {};
      if (token.trim()) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const res = await fetch(rawTargetUrl, { headers });

      if (res.ok) {
        jsonData = await res.text();
      } else {
        // Fallback: Use GitHub API with Authorization header
        const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${filePath.trim()}?ref=${branch.trim()}`;
        const apiRes = await fetch(apiUrl, {
          headers: {
            ...(token.trim() && { Authorization: `Bearer ${token.trim()}` }),
            Accept: 'application/vnd.github.v3.raw'
          }
        });
        if (!apiRes.ok) {
          throw new Error(`تعذر العثور على الملف في المسار (${filePath}) على الفرع (${branch}). تأكدي من وجود الملف في GitHub.`);
        }
        jsonData = await apiRes.text();
      }

      if (!jsonData || !jsonData.trim()) {
        throw new Error('الملف المسترجع فارغ.');
      }

      // Restore system backup
      const importResult = importSystemBackup(jsonData);
      if (importResult.success) {
        try {
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}

        setStatusMessage({
          type: 'success',
          text: `تم استيراد واسترجاع أحدث نسخة من GitHub بنجاح! جميع الحسابات والموظفين والمهام محدثة بالكامل.`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: importResult.message
        });
      }
    } catch (err: any) {
      console.error('GitHub Import Error:', err);
      setStatusMessage({
        type: 'error',
        text: `فشل استيراد النسخة من GitHub: ${err?.message || 'تأكدي من صحة الرابط واسم الملف'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Import: From Custom Raw URL
  const handleImportFromRawUrl = async () => {
    if (!rawUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى كتابة أو لصق رابط GitHub Raw.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(rawUrl.trim());
      if (!res.ok) throw new Error(`تعذر تنزيل الملف، كود الخطأ (${res.status})`);
      const text = await res.text();
      const importResult = importSystemBackup(text);
      if (importResult.success) {
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        setStatusMessage({
          type: 'success',
          text: `تم استيراد النسخة الاحتياطية من الرابط بنجاح!`
        });
      } else {
        setStatusMessage({ type: 'error', text: importResult.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل قراءة الملف: ${err?.message || ''}` });
    } finally {
      setLoading(false);
    }
  };

  // 5. Import: Local JSON file
  const handleImportLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const res = importSystemBackup(content);
        if (res.success) {
          try {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          } catch (e) {}
          setStatusMessage({ type: 'success', text: res.message });
        } else {
          setStatusMessage({ type: 'error', text: res.message });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      onClick={() => setIsGitHubModalOpen(false)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden text-slate-800 my-auto cursor-default"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-inner">
              <FolderGit2 className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">
                  تصدير واستيراد أحدث نسخة عبر GitHub
                </h3>
                <span className="text-[10px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full font-bold font-mono">
                  SWIFT Cloud
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                حماية شاملة لبيانات الفريق والموظفين والتاسكات من المسح عند عمل تحديث أو Deploy
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGitHubModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`px-5 py-3 text-xs font-bold flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>

            {commitUrl && (
              <a
                href={commitUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline flex items-center gap-1 hover:text-blue-900"
              >
                <span>مشاهدة الملف في GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-50 px-5 pt-3 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t-2 ${
              activeTab === 'export'
                ? 'bg-white text-blue-600 border-blue-600 shadow-2xs'
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>1. تصدير أحدث نسخة إلى GitHub 📤</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t-2 ${
              activeTab === 'import'
                ? 'bg-white text-emerald-600 border-emerald-600 shadow-2xs'
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4" />
            <span>2. استيراد أحدث نسخة من GitHub 📥</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t-2 ${
              activeTab === 'guide'
                ? 'bg-white text-amber-600 border-amber-600 shadow-2xs'
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>دليل عدم مسح البيانات 🛡️</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* GitHub Config Bar (Used in both export and import) */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span>إعدادات مستودع GitHub المستهدف:</span>
              </span>
              <span className="text-[11px] text-slate-400">يتم حفظ هذه الإعدادات تلقائياً</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  المستودع (Repository)
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={e => setRepo(e.target.value)}
                  placeholder="hadeersaid985-sys/SWIFT"
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  الفرع (Branch)
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  مسار ملف البيانات (Path)
                </label>
                <input
                  type="text"
                  value={filePath}
                  onChange={e => setFilePath(e.target.value)}
                  placeholder="backup/latest-data.json"
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none dir-ltr text-right"
                />
              </div>
            </div>

            {/* Optional Personal Access Token for Direct API Commit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>GitHub Personal Access Token (اختياري للحفظ التلقائي بنقرة واحدة):</span>
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>إنشاء Token من GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono outline-none dir-ltr text-right"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                الـ Token يبقى محفوظاً بأمان على متصفحك فقط ولا يغادر جهازك.
              </p>
            </div>
          </div>

          {/* TAB 1: EXPORT TO GITHUB */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200/80 text-xs text-blue-900 leading-relaxed">
                <strong>حجم البيانات الحالية الجاهزة للتصدير:</strong> {team.length} موظفين وحسابات، {tasks.length} مهمة مسجلة، {deals.length} صفقة، و {leads.length} عميل محتمل.
              </div>

              {/* Action 1: Direct API Commit */}
              <div className="p-4 rounded-2xl border-2 border-blue-500/30 bg-white hover:border-blue-500 transition-all shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">
                      A
                    </span>
                    <span>تصدير وحفظ في GitHub مباشرة بنقرة واحدة (Direct API Push)</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                    موصى به ⭐
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  يقوم بإنشاء Commit فوري في مستودع <strong className="text-slate-800">{repo}</strong> على الفرع <strong className="text-slate-800">{branch}</strong> في المسار <code className="text-blue-600 font-bold">{filePath}</code> مباشرة دون الحاجة لأي خطوات يدوية!
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDirectPushToGitHub}
                  className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'جارٍ الحفظ على GitHub...' : 'تصدير وحفظ أحدث نسخة على GitHub الآن 🚀'}</span>
                </button>
              </div>

              {/* Action 2: Download File */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                      B
                    </span>
                    <span>تنزيل ملف النسخة الأحدث (JSON)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    تنزيل الملف فوراً على جهازك لتتمكني من رفعه على GitHub يدوياً بأي وقت.
                  </p>
                  <button
                    type="button"
                    onClick={() => exportSystemBackup()}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل ملف النسخة الاحتياطية</span>
                  </button>
                </div>

                {/* Action 3: Copy JSON */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                      C
                    </span>
                    <span>نسخ كود الـ JSON للحافظة</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    نسخ الكود بالكامل للصقه في محرر GitHub الإلكتروني مباشرة.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyBackupJson}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'تم النسخ بنجاح!' : 'نسخ كود الـ JSON كاملاً'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT FROM GITHUB */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                <strong>الاستيراد الذكي:</strong> سيقوم النظام بجلب أحدث نسخة تم حفظها في GitHub وتطبيقها على الفور دون حذف أي موظف أو إعداد أساسي.
              </div>

              {/* Option A: Direct Pull from configured repo */}
              <div className="p-4 rounded-2xl border-2 border-emerald-500/30 bg-white hover:border-emerald-500 transition-all shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                      1
                    </span>
                    <span>استيراد أحدث نسخة من مستودع GitHub مباشرة</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    تلقائي ⚡
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  سيتم جلب الملف من <code className="text-emerald-700 font-bold">{repo}/{filePath}</code> واستعادة كافة الموظفين والتاسكات والبيانات في ثوانٍ.
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePullFromGitHub}
                  className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'جارٍ جلب البيانات واستعادتها...' : 'جلب واسترجاع أحدث نسخة من GitHub الآن 📥'}</span>
                </button>
              </div>

              {/* Option B: Custom Raw URL */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>أو الاستيراد عبر رابط GitHub Raw مباشر</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={rawUrl}
                    onChange={e => setRawUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/hadeersaid985-sys/SWIFT/main/backup/latest-data.json"
                    className="flex-1 bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono outline-none dir-ltr text-right"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleImportFromRawUrl}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                  >
                    استيراد من الرابط
                  </button>
                </div>
              </div>

              {/* Option C: Local File Fallback */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>أو رفع ملف النسخة الاحتياطية من الكمبيوتر / الهاتف</span>
                </div>
                <input
                  type="file"
                  ref={localFileInputRef}
                  onChange={handleImportLocalFile}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => localFileInputRef.current?.click()}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-200 flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>اختيار ملف .JSON واستعادته محلياً</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SAFETY GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-800">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>كيف تضمنين عدم مسح أي داتا أبداً من الموقع عند عمل Deploy أو تحديث؟</span>
                </div>
                <p>
                  المتصفحات ومواقع الاستضافة قد تعيد تعيين الذاكرة المؤقتة (Cache / LocalStorage) في بعض الحالات عند تغيير الدومين أو نشر كود جديد. لذلك صممنا لكِ هذه الميزة لحفظ أحدث نسخة مباشرة على حسابك في GitHub.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900">تصدير قبل التعديل الكبير</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    قبل إجراء أي تغييرات كبرى أو عمل Deploy جديد، افتحي هذه النافذة واضغطي <strong>"تصدير وحفظ في GitHub"</strong> أو نزّلي ملف JSON.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900">الملف محفوظ في المستودع</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    سيكون ملف <code className="text-blue-600 font-bold">backup/latest-data.json</code> متواجداً في مستودعك <code className="text-slate-800 font-bold">{repo}</code> بأمان تام.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900">استرجاع فوري بنقرة واحدة</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    بعد فتح النسخة المحدثة، اضغطي على <strong>"استيراد أحدث نسخة من GitHub"</strong> لتعود كل البيانات والمهام كما كانت تماماً!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            المستودع النشط: <strong className="text-slate-800 font-mono">{repo}</strong>
          </span>

          <button
            onClick={() => setIsGitHubModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
