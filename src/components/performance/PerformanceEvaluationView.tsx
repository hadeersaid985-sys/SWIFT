import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Star,
  TrendingUp,
  Plus,
  Search,
  Filter,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Rocket,
  Target,
  Calendar,
  Eye,
  MessageSquare,
  Edit2,
  Trash2,
  Download,
  Printer,
  ChevronDown,
  Sparkles,
  BookOpen,
  Info,
  Building,
  CheckSquare,
  Layers,
  ArrowRight,
  Send,
  HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useCRM } from '../../context/CRMContext';
import {
  PerformanceEvaluationRecord,
  DelayRecord,
  CompanyRule,
  RuleViolationRecord,
  MonthlyPerformanceReview,
  EvaluationType,
  EvaluationCategory,
  EvaluationStatus,
  DelayRangeCategory,
  DelayReasonCategory,
  DelayReviewStatus,
  CompanyRuleCategory,
  ViolationReviewStatus,
  Task
} from '../../types/crm';
import {
  calculateDelayMinutes,
  getDelayRangeCategory,
  calculateEmployeeKPIs,
  qualityRatingToScore
} from '../../utils/performanceLogic';

export interface PerformanceEvaluationViewProps {
  initialTab?: 'dashboard' | 'evaluations' | 'delays' | 'rules' | 'monthly_reviews';
}

export const PerformanceEvaluationView: React.FC<PerformanceEvaluationViewProps> = ({ initialTab }) => {
  const {
    activeTab,
    currentUser,
    isManager,
    team,
    tasks,
    performanceEvaluations,
    addPerformanceEvaluation,
    updatePerformanceEvaluation,
    deletePerformanceEvaluation,
    approvePerformanceEvaluation,
    addEvaluationClarification,
    delays,
    addDelayRecord,
    updateDelayRecord,
    deleteDelayRecord,
    reviewDelayRecord,
    companyRules,
    addCompanyRule,
    updateCompanyRule,
    deleteCompanyRule,
    acknowledgeCompanyRule,
    ruleViolations,
    addRuleViolation,
    updateRuleViolation,
    deleteRuleViolation,
    reviewRuleViolation,
    addViolationClarification,
    monthlyPerformanceReviews,
    saveMonthlyPerformanceReview,
    deleteMonthlyPerformanceReview
  } = useCRM();

  // Active top-level subtab synced with activeTab & initialTab
  const getComputedSubTab = (): 'dashboard' | 'evaluations' | 'delays' | 'rules' | 'monthly_reviews' => {
    if (activeTab === 'delays' || initialTab === 'delays') return 'delays';
    if (activeTab === 'company_rules' || initialTab === 'rules') return 'rules';
    if (initialTab && initialTab !== 'dashboard') return initialTab;
    return 'dashboard';
  };

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'evaluations' | 'delays' | 'rules' | 'monthly_reviews'>(getComputedSubTab);

  useEffect(() => {
    setActiveSubTab(getComputedSubTab());
  }, [activeTab, initialTab]);

  // Filters
  const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    if (!isManager && currentUser?.id) {
      return currentUser.id;
    }
    return 'all';
  });

  // Evaluation form modal state
  const [isAddEvalModalOpen, setIsAddEvalModalOpen] = useState(false);
  const [evalFormData, setEvalFormData] = useState({
    employeeId: '',
    type: 'positive' as EvaluationType,
    category: 'quality' as EvaluationCategory,
    date: new Date().toISOString().split('T')[0],
    description: '',
    relatedTaskId: '',
    evidenceUrl: '',
    actionTaken: '',
    followUpDate: '',
    pointsWeight: 5
  });

  // Delay form modal state
  const [isAddDelayModalOpen, setIsAddDelayModalOpen] = useState(false);
  const [delayFormData, setDelayFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    scheduledStartTime: '09:00',
    actualArrivalTime: '09:20',
    reasonCategory: 'traffic_commute' as DelayReasonCategory,
    reasonDetails: '',
    reviewStatus: 'pending' as DelayReviewStatus,
    actionTaken: ''
  });

  // Rule form modal state
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [ruleFormData, setRuleFormData] = useState({
    title: '',
    category: 'attendance' as CompanyRuleCategory,
    description: '',
    targetDepartment: 'كل الشركة',
    effectiveDate: new Date().toISOString().split('T')[0],
    approvedBy: currentUser?.name || 'هدير سعيد',
    version: 'v1.0',
    violationProcedure: 'التنبيه ودياً في المرة الأولى، ومراجعة الإدارة عند التكرار.',
    severityLevel: 'medium' as 'critical' | 'high' | 'medium' | 'guideline'
  });

  // Violation modal state
  const [isAddViolationModalOpen, setIsAddViolationModalOpen] = useState(false);
  const [violationFormData, setViolationFormData] = useState({
    ruleId: '',
    employeeId: '',
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
    evidence: ''
  });

  // Monthly Review Generator Modal
  const [isGenerateMonthlyModalOpen, setIsGenerateMonthlyModalOpen] = useState(false);
  const [monthlyReviewForm, setMonthlyReviewForm] = useState({
    employeeId: '',
    month: selectedMonth,
    strengths: '',
    areasForImprovement: '',
    nextMonthGoals: '',
    managerNotes: ''
  });

  // Clarification reply modal (for employee)
  const [clarificationTarget, setClarificationTarget] = useState<{ id: string; type: 'eval' | 'violation'; title: string } | null>(null);
  const [clarificationText, setClarificationText] = useState('');

  // Active evaluation filter inside evaluations tab
  const [evalTypeFilter, setEvalTypeFilter] = useState<'all' | EvaluationType>('all');
  const [evalSearch, setEvalSearch] = useState('');

  // Active rule category filter
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<'all' | CompanyRuleCategory>('all');

  // Filtered employees list based on role
  const effectiveEmployeeId = useMemo(() => {
    if (!isManager && currentUser?.id) {
      return currentUser.id;
    }
    return selectedEmployeeId;
  }, [isManager, currentUser, selectedEmployeeId]);

  // Target employee object when viewing single employee
  const targetEmployee = useMemo(() => {
    if (effectiveEmployeeId === 'all') return null;
    return team.find(m => m.id === effectiveEmployeeId) || currentUser;
  }, [team, effectiveEmployeeId, currentUser]);

  // Filtered Team Members
  const visibleTeamMembers = useMemo(() => {
    return team.filter(m => {
      if (selectedDepartment !== 'all' && m.department !== selectedDepartment) return false;
      return true;
    });
  }, [team, selectedDepartment]);

  // KPIs for the selected employee or overall company
  const employeeKPIs = useMemo(() => {
    const empId = effectiveEmployeeId === 'all' ? (visibleTeamMembers[0]?.id || 'user-amira') : effectiveEmployeeId;
    return calculateEmployeeKPIs(
      empId,
      tasks,
      delays,
      performanceEvaluations,
      ruleViolations,
      selectedMonth
    );
  }, [effectiveEmployeeId, visibleTeamMembers, tasks, delays, performanceEvaluations, ruleViolations, selectedMonth]);

  // Calculate live delay minutes for the modal
  const calculatedLiveDelayMinutes = useMemo(() => {
    return calculateDelayMinutes(delayFormData.scheduledStartTime, delayFormData.actualArrivalTime);
  }, [delayFormData.scheduledStartTime, delayFormData.actualArrivalTime]);

  // Filtered evaluations
  const filteredEvaluations = useMemo(() => {
    return performanceEvaluations.filter(e => {
      // Role security: employee only sees their own
      if (!isManager && e.employeeId !== currentUser?.id) return false;
      if (effectiveEmployeeId !== 'all' && e.employeeId !== effectiveEmployeeId) return false;
      if (evalTypeFilter !== 'all' && e.type !== evalTypeFilter) return false;
      if (selectedMonth && !e.date.startsWith(selectedMonth)) return false;
      if (evalSearch.trim()) {
        const query = evalSearch.toLowerCase();
        return (
          e.employeeName.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          (e.relatedTaskTitle || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [performanceEvaluations, isManager, currentUser, effectiveEmployeeId, evalTypeFilter, selectedMonth, evalSearch]);

  // Filtered delays
  const filteredDelays = useMemo(() => {
    return delays.filter(d => {
      if (!isManager && d.employeeId !== currentUser?.id) return false;
      if (effectiveEmployeeId !== 'all' && d.employeeId !== effectiveEmployeeId) return false;
      if (selectedMonth && !d.date.startsWith(selectedMonth)) return false;
      return true;
    });
  }, [delays, isManager, currentUser, effectiveEmployeeId, selectedMonth]);

  // Filtered rules
  const filteredRules = useMemo(() => {
    return companyRules.filter(r => {
      if (ruleCategoryFilter !== 'all' && r.category !== ruleCategoryFilter) return false;
      return true;
    });
  }, [companyRules, ruleCategoryFilter]);

  // Filtered violations
  const filteredViolations = useMemo(() => {
    return ruleViolations.filter(v => {
      if (!isManager && v.employeeId !== currentUser?.id) return false;
      if (effectiveEmployeeId !== 'all' && v.employeeId !== effectiveEmployeeId) return false;
      if (selectedMonth && !v.incidentDate.startsWith(selectedMonth)) return false;
      return true;
    });
  }, [ruleViolations, isManager, currentUser, effectiveEmployeeId, selectedMonth]);

  // Filtered monthly reviews
  const filteredMonthlyReviews = useMemo(() => {
    return monthlyPerformanceReviews.filter(r => {
      if (!isManager && r.employeeId !== currentUser?.id) return false;
      if (effectiveEmployeeId !== 'all' && r.employeeId !== effectiveEmployeeId) return false;
      if (selectedMonth && r.month !== selectedMonth) return false;
      return true;
    });
  }, [monthlyPerformanceReviews, isManager, currentUser, effectiveEmployeeId, selectedMonth]);

  // Export to Excel function
  const handleExportExcel = () => {
    const rows = filteredEvaluations.map(e => ({
      'الموظف': e.employeeName,
      'القسم': e.department,
      'التاريخ': e.date,
      'نوع التقييم': e.type === 'positive' ? 'إيجابيات' : e.type === 'negative' ? 'تقصير' : e.type === 'extra_work' ? 'شغل إضافي' : 'فرصة تحسين',
      'التصنيف': e.category,
      'الوصف': e.description,
      'التاسك المرتبطة': e.relatedTaskTitle || '-',
      'الحالة': e.status === 'approved' ? 'معتمدة' : 'بانتظار المراجعة',
      'الإجراء المتخذ': e.actionTaken || '-',
      'المسؤول عن التسجيل': e.createdByName
    }));

    const delayRows = filteredDelays.map(d => ({
      'الموظف': d.employeeName,
      'القسم': d.department,
      'التاريخ': d.date,
      'بداية الدوام': d.scheduledStartTime,
      'وقت الحضور': d.actualArrivalTime,
      'دقائق التأخير': d.delayMinutes,
      'الفئة': d.delayRange,
      'سبب التأخير': d.reasonCategory,
      'العذر المقدم': d.reasonDetails,
      'حالة المراجعة': d.reviewStatus === 'excused' ? 'عذر معتمد' : d.reviewStatus === 'reviewed' ? 'تمت المراجعة' : 'بانتظار المراجعة',
      'الإجراء': d.actionTaken || '-'
    }));

    const wb = XLSX.utils.book_new();
    const wsEvals = XLSX.utils.json_to_sheet(rows);
    const wsDelays = XLSX.utils.json_to_sheet(delayRows);
    XLSX.utils.book_append_sheet(wb, wsEvals, 'تقييمات_الأداء');
    XLSX.utils.book_append_sheet(wb, wsDelays, 'سجل_التأخيرات');

    XLSX.writeFile(wb, `تقرير_أداء_سويفت_مايند_${selectedMonth}.xlsx`);
  };

  // Submit new evaluation
  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = team.find(m => m.id === evalFormData.employeeId) || team[0];
    const relatedT = tasks.find(t => t.id === evalFormData.relatedTaskId);

    addPerformanceEvaluation({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: evalFormData.date,
      type: evalFormData.type,
      category: evalFormData.category,
      description: evalFormData.description,
      relatedTaskId: evalFormData.relatedTaskId || undefined,
      relatedTaskTitle: relatedT ? relatedT.title : undefined,
      evidenceUrl: evalFormData.evidenceUrl || undefined,
      createdById: currentUser?.id || 'user-1',
      createdByName: currentUser?.name || 'هدير سعيد',
      status: isManager ? 'approved' : 'pending_review',
      reviewedBy: isManager ? currentUser?.name : undefined,
      reviewedAt: isManager ? new Date().toISOString() : undefined,
      actionTaken: evalFormData.actionTaken || (evalFormData.type === 'positive' ? 'شكر وتقدير' : undefined),
      followUpDate: evalFormData.followUpDate || undefined,
      pointsWeight: evalFormData.pointsWeight
    });

    setIsAddEvalModalOpen(false);
    setEvalFormData({
      employeeId: '',
      type: 'positive',
      category: 'quality',
      date: new Date().toISOString().split('T')[0],
      description: '',
      relatedTaskId: '',
      evidenceUrl: '',
      actionTaken: '',
      followUpDate: '',
      pointsWeight: 5
    });
  };

  // Submit new delay
  const handleCreateDelay = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = team.find(m => m.id === delayFormData.employeeId) || team[0];
    const delayMins = calculateDelayMinutes(delayFormData.scheduledStartTime, delayFormData.actualArrivalTime);
    const delayRange = getDelayRangeCategory(delayMins);

    addDelayRecord({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: delayFormData.date,
      scheduledStartTime: delayFormData.scheduledStartTime,
      actualArrivalTime: delayFormData.actualArrivalTime,
      delayMinutes: delayMins,
      delayRange,
      reasonCategory: delayFormData.reasonCategory,
      reasonDetails: delayFormData.reasonDetails,
      reviewStatus: delayFormData.reviewStatus,
      reviewedBy: isManager ? currentUser?.name : undefined,
      reviewedAt: isManager ? new Date().toISOString() : undefined,
      actionTaken: delayFormData.actionTaken || undefined
    });

    setIsAddDelayModalOpen(false);
    setDelayFormData({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      scheduledStartTime: '09:00',
      actualArrivalTime: '09:20',
      reasonCategory: 'traffic_commute',
      reasonDetails: '',
      reviewStatus: 'pending',
      actionTaken: ''
    });
  };

  // Submit new company rule
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    addCompanyRule({
      title: ruleFormData.title,
      category: ruleFormData.category,
      description: ruleFormData.description,
      targetDepartment: ruleFormData.targetDepartment,
      effectiveDate: ruleFormData.effectiveDate,
      approvedBy: ruleFormData.approvedBy,
      version: ruleFormData.version,
      violationProcedure: ruleFormData.violationProcedure,
      severityLevel: ruleFormData.severityLevel
    });
    setIsAddRuleModalOpen(false);
    setRuleFormData({
      title: '',
      category: 'attendance',
      description: '',
      targetDepartment: 'كل الشركة',
      effectiveDate: new Date().toISOString().split('T')[0],
      approvedBy: currentUser?.name || 'هدير سعيد',
      version: 'v1.0',
      violationProcedure: 'التنبيه ودياً في المرة الأولى، ومراجعة الإدارة عند التكرار.',
      severityLevel: 'medium'
    });
  };

  // Submit violation
  const handleCreateViolation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRule = companyRules.find(r => r.id === violationFormData.ruleId) || companyRules[0];
    const targetEmp = team.find(m => m.id === violationFormData.employeeId) || team[0];

    addRuleViolation({
      ruleId: targetRule.id,
      ruleTitle: targetRule.title,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      department: targetEmp.department,
      incidentDate: violationFormData.incidentDate,
      description: violationFormData.description,
      evidence: violationFormData.evidence || undefined,
      reviewStatus: 'under_review'
    });

    setIsAddViolationModalOpen(false);
    setViolationFormData({
      ruleId: '',
      employeeId: '',
      incidentDate: new Date().toISOString().split('T')[0],
      description: '',
      evidence: ''
    });
  };

  // Submit clarification reply
  const handleSubmitClarification = () => {
    if (!clarificationTarget || !clarificationText.trim()) return;
    if (clarificationTarget.type === 'eval') {
      addEvaluationClarification(clarificationTarget.id, clarificationText);
    } else {
      addViolationClarification(clarificationTarget.id, clarificationText);
    }
    setClarificationTarget(null);
    setClarificationText('');
  };

  // Handle Save Monthly Review
  const handleSaveMonthlyReview = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = team.find(m => m.id === monthlyReviewForm.employeeId) || visibleTeamMembers[0];
    const kpis = calculateEmployeeKPIs(
      emp.id,
      tasks,
      delays,
      performanceEvaluations,
      ruleViolations,
      monthlyReviewForm.month
    );

    const reviewObj: MonthlyPerformanceReview = {
      id: `mpr-${monthlyReviewForm.month}-${emp.id}`,
      month: monthlyReviewForm.month,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      totalAssignedTasks: kpis.totalTasks,
      completedTasks: kpis.completedTasks,
      tasksCompletionRate: kpis.tasksCompletionRate,
      onTimeDeliveries: kpis.onTimeDeliveries,
      onTimeDeliveryRate: kpis.onTimeDeliveryRate,
      qualityScore: kpis.averageQualityScore,
      revisionsRequestedCount: kpis.revisionsRequestedCount,
      delayedTasksCount: kpis.delayedTasksCount,
      delaysCount: kpis.delaysCount,
      totalDelayMinutes: kpis.totalDelayMinutes,
      excusedDelaysCount: kpis.excusedDelaysCount,
      unexcusedDelaysCount: kpis.unexcusedDelaysCount,
      positiveNotesCount: kpis.positiveNotesCount,
      negativeNotesCount: kpis.negativeNotesCount,
      extraWorkCount: kpis.extraWorkCount,
      improvementCount: kpis.improvementCount,
      violationsCount: kpis.violationsCount,
      overallScore: kpis.overallScore,
      overallRating: kpis.ratingText,
      strengths: monthlyReviewForm.strengths || 'الالتزام التام بمتطلبات العمل وجودة التنفيذ.',
      areasForImprovement: monthlyReviewForm.areasForImprovement || 'مواصلة التطوير وزيادة سرعة الاستجابة.',
      nextMonthGoals: monthlyReviewForm.nextMonthGoals || 'تحقيق 100% تسليم في الموعد والارتقاء بالمخرجات.',
      managerNotes: monthlyReviewForm.managerNotes || 'أداء معتمد من الإدارة.',
      status: 'approved',
      reviewedBy: currentUser?.name || 'هدير سعيد',
      reviewedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    saveMonthlyPerformanceReview(reviewObj);
    setIsGenerateMonthlyModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto text-slate-800">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-l from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 md:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-400/30 text-blue-200 text-xs px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>منظومة تقييم الأداء والحضور والالتزام المؤسسي</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>تقييم الأداء ومتابعة الموظفين</span>
              <span className="text-xs bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-md">SWIFTMYND HR</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              توثيق شامل لإيجابيات وسلبيات الموظف، الشغل الإضافي والمبادرات، متابعة التأخيرات بنظام الأعذار العادلة، جودة التاسكات، ومكتبة قواعد وسياسات الشركة الرسمية.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isManager && (
              <>
                <button
                  onClick={() => setIsAddEvalModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل تقييم</span>
                </button>
                <button
                  onClick={() => setIsAddDelayModalOpen(true)}
                  className="bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600 text-slate-100 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>سجل تأخير</span>
                </button>
                <button
                  onClick={() => setIsAddRuleModalOpen(true)}
                  className="bg-indigo-700/80 hover:bg-indigo-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-indigo-300" />
                  <span>إضافة قاعدة</span>
                </button>
              </>
            )}
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="تصدير شيت إكسيل للتقييم والتأخيرات"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
          </div>
        </div>

        {/* Global Selectors Toolbar (Month, Department, Employee) */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Month Selector */}
          <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-300 shrink-0" />
            <div className="flex-1">
              <span className="text-[10px] text-blue-200 block font-medium">الشهر المستهدف:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Department Selector */}
          {isManager && (
            <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-300 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] text-blue-200 block font-medium">القسم المعني:</span>
                <select
                  value={selectedDepartment}
                  onChange={e => {
                    setSelectedDepartment(e.target.value);
                    setSelectedEmployeeId('all');
                  }}
                  className="w-full bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all" className="text-slate-900">كل الأقسام</option>
                  <option value="التطوير والتقنية" className="text-slate-900">التطوير والتقنية</option>
                  <option value="المبيعات" className="text-slate-900">المبيعات</option>
                  <option value="التسويق" className="text-slate-900">التسويق</option>
                  <option value="الإدارة المالية" className="text-slate-900">الإدارة المالية</option>
                </select>
              </div>
            </div>
          )}

          {/* Employee Selector */}
          <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <div className="flex-1">
              <span className="text-[10px] text-blue-200 block font-medium">
                {isManager ? 'تصفية الموظف:' : 'الملف الشخصي للموظف:'}
              </span>
              {isManager ? (
                <select
                  value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all" className="text-slate-900">جميع موظفي الفريق (نظرة شاملة)</option>
                  {visibleTeamMembers.map(m => (
                    <option key={m.id} value={m.id} className="text-slate-900">
                      {m.name} ({m.role || m.department})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-white font-bold text-xs truncate">
                  {currentUser?.name || 'المستخدم الحالي'} - {currentUser?.role || ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-1.5 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>لوحة المتابعة الشاملة</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evaluations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'evaluations'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400" />
          <span>سجل تقييمات الأداء</span>
          <span className="bg-slate-200/80 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {filteredEvaluations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('delays')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'delays'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-rose-500" />
          <span>متابعة التأخيرات والأعذار</span>
          <span className="bg-slate-200/80 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {filteredDelays.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'rules'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>قواعد وسياسات الشركة</span>
          <span className="bg-slate-200/80 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {companyRules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('monthly_reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'monthly_reviews'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-500" />
          <span>التقييم الشهري الرسمي</span>
          <span className="bg-slate-200/80 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {filteredMonthlyReviews.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. لوحة المتابعة الشاملة (DASHBOARD) */}
      {/* ========================================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Target Profile Card */}
          {targetEmployee && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={targetEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={targetEmployee.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{targetEmployee.name}</h2>
                    <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      {targetEmployee.employeeCode}
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full">
                      {targetEmployee.role || targetEmployee.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    القسم: <strong className="text-slate-700">{targetEmployee.department}</strong> | تقرير الأداء المجمع لشهر: <strong className="text-blue-600">{selectedMonth}</strong>
                  </p>
                </div>
              </div>

              {/* Overall Score Badge */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-bold">التقييم العام الموزون</span>
                  <span className="text-xs font-black text-slate-800">تقدير: {employeeKPIs.ratingText}</span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md ${
                  employeeKPIs.overallScore >= 90 ? 'bg-emerald-600' :
                  employeeKPIs.overallScore >= 75 ? 'bg-blue-600' :
                  employeeKPIs.overallScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}>
                  {employeeKPIs.overallScore}%
                </div>
              </div>
            </div>
          )}

          {/* Interactive KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tasks Completion */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>إنجاز التاسكات</span>
                </span>
                <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {employeeKPIs.completedTasks} / {employeeKPIs.totalTasks} مهمة
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-2">
                {employeeKPIs.tasksCompletionRate}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${employeeKPIs.tasksCompletionRate}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block mt-2">
                وزن التقييم: <strong>{employeeKPIs.taskCompletionWeightedScore} / 25 نقطة</strong>
              </span>
            </div>

            {/* Card 2: On-Time Delivery */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>التسليم في الموعد</span>
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  employeeKPIs.onTimeDeliveryRate >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {employeeKPIs.onTimeDeliveries} منجزة بوقتها
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-2">
                {employeeKPIs.onTimeDeliveryRate}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${employeeKPIs.onTimeDeliveryRate}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block mt-2">
                مهام متأخرة: <strong className="text-rose-600">{employeeKPIs.delayedTasksCount}</strong>
              </span>
            </div>

            {/* Card 3: Quality & Revisions */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>مستوى جودة التنفيذ</span>
                </span>
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-800 mr-1">{employeeKPIs.averageQualityScore} / 5</span>
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-2">
                {employeeKPIs.qualityWeightedScore} <span className="text-xs font-normal text-slate-400">/ 30 نقطة</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(employeeKPIs.qualityWeightedScore / 30) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block mt-2">
                طلبات التعديلات: <strong className="text-slate-700">{employeeKPIs.revisionsRequestedCount} مرة</strong>
              </span>
            </div>

            {/* Card 4: Attendance & Delays */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>الحضور والتأخيرات</span>
                </span>
                <span className="text-[11px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                  {employeeKPIs.delaysCount} مرات
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-2">
                {employeeKPIs.totalDelayMinutes} <span className="text-xs font-normal text-slate-500">دقيقة تأخير</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <span>أعذار معتمدة: <strong className="text-emerald-700">{employeeKPIs.excusedDelaysCount}</strong></span>
                <span>غير معتمدة: <strong className="text-rose-700">{employeeKPIs.unexcusedDelaysCount}</strong></span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-2">
                التزام المواعيد: <strong>{employeeKPIs.punctualityWeightedScore} / 25 نقطة</strong>
              </span>
            </div>
          </div>

          {/* Secondary KPIs Row: Positive, Negative, Extra Work, Rules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-center">
              <div className="w-9 h-9 mx-auto bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-2">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-emerald-900">{employeeKPIs.positiveNotesCount}</div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">ملاحظات إيجابية معتمدة</div>
              <div className="text-[10px] text-emerald-600/90 mt-1">جودة، التزام، وتعاون</div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl text-center">
              <div className="w-9 h-9 mx-auto bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-2">
                <Rocket className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-indigo-900">{employeeKPIs.extraWorkCount}</div>
              <div className="text-xs font-bold text-indigo-700 mt-0.5">شغل إضافي ومبادرات</div>
              <div className="text-[10px] text-indigo-600/90 mt-1">حل مشكلات ومساعدة زملاء</div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-center">
              <div className="w-9 h-9 mx-auto bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-2">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-amber-900">{employeeKPIs.improvementCount}</div>
              <div className="text-xs font-bold text-amber-700 mt-0.5">فرص للتحسين</div>
              <div className="text-[10px] text-amber-600/90 mt-1">تطوير مهارات ومتابعة</div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl text-center">
              <div className="w-9 h-9 mx-auto bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-rose-900">{employeeKPIs.negativeNotesCount + employeeKPIs.violationsCount}</div>
              <div className="text-xs font-bold text-rose-700 mt-0.5">تقصير / مخالفات معتمدة</div>
              <div className="text-[10px] text-rose-600/90 mt-1">بعد استنفاد المراجعة والتوضيح</div>
            </div>
          </div>

          {/* Quick Recent Performance Notes & Delays preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Evaluations Preview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>أحدث ملاحظات التقييم والشغل الإضافي</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('evaluations')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض الكل</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>

              <div className="space-y-3">
                {filteredEvaluations.slice(0, 3).map(e => (
                  <div
                    key={e.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          e.type === 'positive' ? 'bg-emerald-500' :
                          e.type === 'extra_work' ? 'bg-indigo-500' :
                          e.type === 'negative' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        {e.employeeName}
                      </span>
                      <span className="text-[10px] text-slate-400">{e.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {e.description}
                    </p>
                    {e.actionTaken && (
                      <div className="mt-2 text-[11px] bg-white p-1.5 rounded-md border border-slate-200/80 text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>الإجراء: <strong>{e.actionTaken}</strong></span>
                      </div>
                    )}
                  </div>
                ))}
                {filteredEvaluations.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    لا توجد ملاحظات تقييم مسجلة في هذا الشهر
                  </div>
                )}
              </div>
            </div>

            {/* Recent Delays Preview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>سجل التأخيرات والأعذار الحديثة</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('delays')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض السجل</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>

              <div className="space-y-3">
                {filteredDelays.slice(0, 3).map(d => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">{d.employeeName}</span>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        تأخير {d.delayMinutes} دقيقة
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-3">
                      <span>الدوام: {d.scheduledStartTime}</span>
                      <span>الوصول: {d.actualArrivalTime}</span>
                      <span>التاريخ: {d.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 leading-snug">
                      العذر: {d.reasonDetails || 'لم يُذكر عذر'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        d.reviewStatus === 'excused' ? 'bg-emerald-100 text-emerald-800' :
                        d.reviewStatus === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        d.reviewStatus === 'unexcused' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.reviewStatus === 'excused' ? 'تم اعتماد العذر' :
                         d.reviewStatus === 'reviewed' ? 'تمت المراجعة' :
                         d.reviewStatus === 'unexcused' ? 'عذر غير مقبول' : 'بانتظار المراجعة'}
                      </span>
                      {d.actionTaken && (
                        <span className="text-slate-500 truncate max-w-[200px]">{d.actionTaken}</span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredDelays.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    سجل ممتاز! لا توجد حالات تأخير مسجلة في هذا الشهر.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. سجل تقييمات الموظفين (PERFORMANCE PROFILES & RECORDS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'evaluations' && (
        <div className="space-y-5">
          {/* Controls Bar: Type Filters & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setEvalTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  evalTypeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({performanceEvaluations.length})
              </button>
              <button
                onClick={() => setEvalTypeFilter('positive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  evalTypeFilter === 'positive' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>إيجابيات</span>
              </button>
              <button
                onClick={() => setEvalTypeFilter('extra_work')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  evalTypeFilter === 'extra_work' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>شغل إضافي مميز</span>
              </button>
              <button
                onClick={() => setEvalTypeFilter('improvement')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  evalTypeFilter === 'improvement' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>فرص للتحسين</span>
              </button>
              <button
                onClick={() => setEvalTypeFilter('negative')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  evalTypeFilter === 'negative' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>تقصير وسلبيات</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث في الملاحظات والتاسكات..."
                  value={evalSearch}
                  onChange={e => setEvalSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {isManager && (
                <button
                  onClick={() => setIsAddEvalModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة ملاحظة</span>
                </button>
              )}
            </div>
          </div>

          {/* Evaluations Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvaluations.map(item => {
              const typeBadge = {
                positive: { label: 'إيجابيات والتزام', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: ThumbsUp },
                extra_work: { label: 'شغل إضافي ومبادرة', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Rocket },
                improvement: { label: 'فرصة للتحسين', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Target },
                negative: { label: 'تقصير أو ملاحظة', bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: ThumbsDown }
              }[item.type];
              const Icon = typeBadge.icon;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${typeBadge.bg}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{typeBadge.label}</span>
                        </span>
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          {item.category === 'quality' ? 'جودة العمل' :
                           item.category === 'commitment' ? 'الالتزام والمواعيد' :
                           item.category === 'teamwork' ? 'التعاون مع الفريق' :
                           item.category === 'initiative' ? 'المبادرة وحل المشاكل' : 'عام'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </div>
                    </div>

                    {/* Employee & Reporter Info */}
                    <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[11px]">الموظف: </span>
                        <strong className="text-slate-900 font-bold text-xs">{item.employeeName}</strong>
                        <span className="text-slate-500 text-[11px]"> ({item.department})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        سجّلها: <span className="text-slate-600">{item.createdByName}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-3">
                      {item.description}
                    </p>

                    {/* Related Task info if any */}
                    {item.relatedTaskTitle && (
                      <div className="mb-3 text-[11px] bg-blue-50/60 border border-blue-200/60 text-blue-900 p-2 rounded-lg flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>التاسك المرتبطة: <strong className="font-bold underline">{item.relatedTaskTitle}</strong></span>
                      </div>
                    )}

                    {/* Action Taken & Follow Up */}
                    {item.actionTaken && (
                      <div className="text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-3 text-slate-700">
                        <span className="font-bold text-slate-900 block mb-0.5">الإجراء المعتمد:</span>
                        <span>{item.actionTaken}</span>
                        {item.followUpDate && (
                          <span className="text-slate-500 block text-[10px] mt-1">موعد المتابعة: {item.followUpDate}</span>
                        )}
                      </div>
                    )}

                    {/* Employee Clarification */}
                    {item.employeeClarification ? (
                      <div className="text-[11px] bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-200/80 mb-3 text-indigo-950">
                        <div className="flex items-center justify-between font-bold text-indigo-900 mb-0.5">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>توضيح ورد الموظف:</span>
                          </span>
                          <span className="text-[10px] text-indigo-400 font-normal">
                            {item.employeeClarificationDate?.split('T')[0] || ''}
                          </span>
                        </div>
                        <p className="leading-relaxed text-indigo-900 text-xs">{item.employeeClarification}</p>
                      </div>
                    ) : (
                      // Show button for the employee to reply if this is their record
                      (!isManager || currentUser?.id === item.employeeId) && (
                        <button
                          onClick={() => {
                            setClarificationTarget({ id: item.id, type: 'eval', title: item.description });
                            setClarificationText('');
                          }}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold mb-3 flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>إضافة رد أو توضيح على الملاحظة</span>
                        </button>
                      )
                    )}
                  </div>

                  {/* Footer status & manager controls */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'pending_review' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status === 'approved' ? 'معتمدة رسمياً' :
                         item.status === 'pending_review' ? 'بانتظار المراجعة' : 'مسودة'}
                      </span>
                      {item.reviewedBy && (
                        <span className="text-[10px] text-slate-400">راجعها: {item.reviewedBy}</span>
                      )}
                    </div>

                    {isManager && (
                      <div className="flex items-center gap-1.5">
                        {item.status !== 'approved' && (
                          <button
                            onClick={() => approvePerformanceEvaluation(item.id, 'تمت المراجعة والاعتماد')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            اعتماد
                          </button>
                        )}
                        <button
                          onClick={() => deletePerformanceEvaluation(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="حذف الملاحظة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvaluations.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
              <Star className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-sm text-slate-600">لا توجد ملاحظات تقييم مطابقة</p>
              <p className="text-xs text-slate-400 mt-1">جرّب تغيير فلتر النوع أو الشهر المحدد أعلاه.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. متابعة التأخيرات والأعذار (ATTENDANCE & DELAYS LOG) */}
      {/* ========================================================================= */}
      {activeSubTab === 'delays' && (
        <div className="space-y-5">
          {/* Delays Summary Header Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0">
                <Clock className="w-6 h-6" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-amber-950">سياسة وضوابط متابعة التأخيرات</h4>
                <p className="text-amber-800/90 text-xs mt-0.5">
                  السيستم يعتمد آلية الفصل بين تسجيل الواقعة واعتماد العذر. <strong>لا تطبق أي خصومات أو جزاءات تلقائية</strong> قبل مراجعة الحالة واعتماد الإجراء من الإدارة.
                </p>
              </div>
            </div>

            {isManager && (
              <button
                onClick={() => setIsAddDelayModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 cursor-pointer shadow-sm"
              >
                + تسجيل واقعة تأخير
              </button>
            )}
          </div>

          {/* Delays Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>سجل حالات التأخير المسجلة لشهر:</span>
                <span className="bg-slate-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{selectedMonth}</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                إجمالي الدقائق المسجلة: <strong className="text-rose-600 font-bold">{filteredDelays.reduce((s, d) => s + d.delayMinutes, 0)} دقيقة</strong>
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredDelays.map(delay => (
                <div key={delay.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-slate-900">{delay.employeeName}</strong>
                      <span className="text-xs text-slate-500">({delay.department})</span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {delay.date}
                      </span>
                      <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                        تأخير {delay.delayMinutes} دقيقة ({delay.delayRange} د)
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-4">
                      <span>بداية الدوام: <strong className="text-slate-700">{delay.scheduledStartTime}</strong></span>
                      <span>وقت الحضور الفعلي: <strong className="text-slate-700">{delay.actualArrivalTime}</strong></span>
                      <span>تصنيف السبب: <strong className="text-slate-700">{
                        delay.reasonCategory === 'traffic_commute' ? 'ازدحام مواصلات' :
                        delay.reasonCategory === 'emergency' ? 'ظرف طارئ' :
                        delay.reasonCategory === 'personal' ? 'سبب شخصي' :
                        delay.reasonCategory === 'attendance_device_issue' ? 'مشكلة تسجيل حضور' : 'أخرى'
                      }</strong></span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                      العذر والتوضيح: <strong>{delay.reasonDetails || 'غير موضح حتى الآن'}</strong>
                    </p>

                    {delay.actionTaken && (
                      <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>الإجراء المتخذ: <strong>{delay.actionTaken}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Review Badge */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      delay.reviewStatus === 'excused' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      delay.reviewStatus === 'reviewed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      delay.reviewStatus === 'unexcused' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {delay.reviewStatus === 'excused' ? 'تم اعتماد العذر' :
                       delay.reviewStatus === 'reviewed' ? 'تمت المراجعة' :
                       delay.reviewStatus === 'unexcused' ? 'عذر غير مقبول' : 'بانتظار المراجعة'}
                    </span>

                    {isManager && (
                      <div className="flex items-center gap-1 mt-1">
                        {delay.reviewStatus !== 'excused' && (
                          <button
                            onClick={() => reviewDelayRecord(delay.id, 'excused', 'تم اعتماد العذر بدون أي خصم')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                            title="اعتماد العذر وإعفاء الموظف من الجزاء"
                          >
                            اعتماد العذر
                          </button>
                        )}
                        {delay.reviewStatus !== 'unexcused' && (
                          <button
                            onClick={() => reviewDelayRecord(delay.id, 'unexcused', 'تم رفض العذر لعدم وجود إفادة مسبقة')}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                            title="رفض العذر"
                          >
                            رفض
                          </button>
                        )}
                        <button
                          onClick={() => deleteDelayRecord(delay.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredDelays.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-xs">
                  لا توجد أي تأخيرات مسجلة للموظف أو القسم المختار خلال هذا الشهر.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. قواعد وسياسات الشركة (COMPANY RULES & POLICIES) */}
      {/* ========================================================================= */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          {/* Rules Category Filters */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setRuleCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  ruleCategoryFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                كل القواعد ({companyRules.length})
              </button>
              <button
                onClick={() => setRuleCategoryFilter('attendance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  ruleCategoryFilter === 'attendance' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                }`}
              >
                الحضور والانصراف
              </button>
              <button
                onClick={() => setRuleCategoryFilter('work_quality')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  ruleCategoryFilter === 'work_quality' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                جودة الشغل
              </button>
              <button
                onClick={() => setRuleCategoryFilter('task_delivery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  ruleCategoryFilter === 'task_delivery' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                تسليم التاسكات
              </button>
              <button
                onClick={() => setRuleCategoryFilter('confidentiality')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  ruleCategoryFilter === 'confidentiality' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
                }`}
              >
                سرية المعلومات
              </button>
              <button
                onClick={() => setRuleCategoryFilter('tools_usage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  ruleCategoryFilter === 'tools_usage' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
                }`}
              >
                أدوات الشركة
              </button>
            </div>

            {isManager && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddViolationModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>تسجيل حالة عدم التزام</span>
                </button>
                <button
                  onClick={() => setIsAddRuleModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة قاعدة جديدة</span>
                </button>
              </div>
            )}
          </div>

          {/* Rules Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map(rule => {
              const hasCurrentUserAcknowledged = rule.acknowledgments?.some(a => a.employeeId === currentUser?.id);

              return (
                <div key={rule.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        {rule.version} | سارية من {rule.effectiveDate}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        rule.severityLevel === 'critical' ? 'bg-rose-100 text-rose-800' :
                        rule.severityLevel === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rule.severityLevel === 'critical' ? 'قاعدة جوهرية حرجة' :
                         rule.severityLevel === 'high' ? 'أولوية عالية' : 'إرشادات وضوابط'}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 mb-2">{rule.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {rule.description}
                    </p>

                    <div className="text-[11px] text-slate-600 bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-lg mb-3">
                      <strong className="text-amber-900 block mb-0.5">آلية التعامل مع عدم الالتزام:</strong>
                      <span>{rule.violationProcedure}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between mb-3">
                      <span>القسم المعني: <strong className="text-slate-700">{rule.targetDepartment}</strong></span>
                      <span>معتمدة من: <strong className="text-slate-700">{rule.approvedBy}</strong></span>
                    </div>
                  </div>

                  {/* Acknowledgment & Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>اطّلع عليها <strong>{rule.acknowledgments?.length || 0}</strong> موظف</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasCurrentUserAcknowledged ? (
                        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>أقررت بالاطلاع</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => acknowledgeCompanyRule(rule.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>إقرار بالاطلاع والفهم</span>
                        </button>
                      )}

                      {isManager && (
                        <button
                          onClick={() => deleteCompanyRule(rule.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="حذف القاعدة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Violations Log Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>سجل حالات عدم الالتزام والمخالفات الموثقة</span>
              </h3>
              <span className="text-xs text-slate-500">
                الحالات تخضع للمراجعة والرد قبل اعتماد أي إجراء
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredViolations.map(viol => (
                <div key={viol.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-slate-900">{viol.employeeName}</strong>
                      <span className="text-xs text-slate-500">({viol.department})</span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{viol.incidentDate}</span>
                      <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200">
                        القاعدة: {viol.ruleTitle}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                      تفاصيل الواقعة: {viol.description}
                    </p>

                    {viol.employeeClarification && (
                      <div className="text-[11px] bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200 text-indigo-950">
                        <span className="font-bold block text-indigo-900">توضيح الموظف:</span>
                        <span>{viol.employeeClarification}</span>
                      </div>
                    )}

                    {(!isManager || currentUser?.id === viol.employeeId) && !viol.employeeClarification && (
                      <button
                        onClick={() => {
                          setClarificationTarget({ id: viol.id, type: 'violation', title: viol.description });
                          setClarificationText('');
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>تقديم توضيح ورد على الواقعة</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      viol.reviewStatus === 'confirmed' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      viol.reviewStatus === 'excused' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {viol.reviewStatus === 'confirmed' ? 'مخالفة مؤكدة ومعتمدة' :
                       viol.reviewStatus === 'excused' ? 'تم قبول التوضيح' : 'قيد المراجعة'}
                    </span>

                    {isManager && (
                      <div className="flex items-center gap-1 mt-1">
                        {viol.reviewStatus !== 'excused' && (
                          <button
                            onClick={() => reviewRuleViolation(viol.id, 'excused', 'تم قبول توضيح الموظف')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            قبول التوضيح
                          </button>
                        )}
                        {viol.reviewStatus !== 'confirmed' && (
                          <button
                            onClick={() => reviewRuleViolation(viol.id, 'confirmed', 'مخالفة مؤكدة - تنبيه كتابي')}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            تأكيد المخالفة
                          </button>
                        )}
                        <button
                          onClick={() => deleteRuleViolation(viol.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredViolations.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  لا توجد أي مخالفات مسجلة. بيئة عمل منضبطة وواعية.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. التقييم الشهري الرسمي (MONTHLY PERFORMANCE REVIEWS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'monthly_reviews' && (
        <div className="space-y-6">
          {/* Header Action */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>سجل التقييمات الشهرية المعتمدة رسمياً</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                حفظ وأرشفة تقييمات الشهور السابقة لكل موظف، مع ربط المؤشرات بالأهداف القادمة.
              </p>
            </div>

            {isManager && (
              <button
                onClick={() => {
                  const empId = effectiveEmployeeId === 'all' ? (visibleTeamMembers[0]?.id || 'user-amira') : effectiveEmployeeId;
                  setMonthlyReviewForm({
                    employeeId: empId,
                    month: selectedMonth,
                    strengths: '',
                    areasForImprovement: '',
                    nextMonthGoals: '',
                    managerNotes: ''
                  });
                  setIsGenerateMonthlyModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>إنشاء تقييم شهري رسمي</span>
              </button>
            )}
          </div>

          {/* Monthly Reviews Cards */}
          <div className="space-y-4">
            {filteredMonthlyReviews.map(review => (
              <div
                key={review.id}
                className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg ${
                      review.overallScore >= 90 ? 'bg-emerald-600' :
                      review.overallScore >= 75 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}>
                      {review.overallScore}%
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <span>{review.employeeName}</span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-normal">
                          {review.department}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        تقييم شهر: <strong className="text-blue-600">{review.month}</strong> | التقدير العام: <strong className="text-emerald-700 font-bold">{review.overallRating}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                      معتمد رسمياً من الإدارة
                    </span>
                    {isManager && (
                      <button
                        onClick={() => deleteMonthlyPerformanceReview(review.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="حذف التقييم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Score breakdown metrics bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">إنجاز التاسكات</span>
                    <strong className="text-slate-800 font-black text-sm">{review.tasksCompletionRate}%</strong>
                    <span className="text-[10px] text-slate-500 block">({review.completedTasks}/{review.totalAssignedTasks})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">التسليم في الموعد</span>
                    <strong className="text-slate-800 font-black text-sm">{review.onTimeDeliveryRate}%</strong>
                    <span className="text-[10px] text-slate-500 block">({review.onTimeDeliveries} مهام)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">متوسط الجودة</span>
                    <strong className="text-amber-700 font-black text-sm flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {review.qualityScore} / 5
                    </strong>
                    <span className="text-[10px] text-slate-500 block">({review.revisionsRequestedCount} تعديلات)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">التأخيرات والحضور</span>
                    <strong className="text-slate-800 font-black text-sm">{review.totalDelayMinutes} دقيقة</strong>
                    <span className="text-[10px] text-emerald-600 block">({review.excusedDelaysCount} أعذار معتمدة)</span>
                  </div>
                </div>

                {/* Qualitative Review Points */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                    <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>نقاط القوة والإشادة:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">{review.strengths}</p>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
                    <span className="font-bold text-amber-900 block mb-1 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-amber-600" />
                      <span>مجالات تحتاج تطوير:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">{review.areasForImprovement}</p>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                    <span className="font-bold text-blue-900 block mb-1 flex items-center gap-1">
                      <Rocket className="w-3.5 h-3.5 text-blue-600" />
                      <span>أهداف الشهر القادم:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">{review.nextMonthGoals}</p>
                  </div>
                </div>

                {/* Manager Notes & Employee Feedback */}
                <div className="pt-2 text-xs space-y-2 border-t border-slate-100">
                  <div className="text-slate-700 flex items-start gap-2">
                    <strong className="text-slate-900 shrink-0">ملاحظات المدير:</strong>
                    <span>{review.managerNotes}</span>
                  </div>
                  {review.employeeFeedback && (
                    <div className="text-indigo-900 flex items-start gap-2 bg-indigo-50/60 p-2 rounded-lg">
                      <strong className="shrink-0">رد الموظف:</strong>
                      <span>{review.employeeFeedback}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredMonthlyReviews.length === 0 && (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-sm text-slate-600">لا توجد تقييمات شهرية معتمدة لهذا الشهر</p>
                <p className="text-xs text-slate-400 mt-1">اضغط على "إنشاء تقييم شهري رسمي" لتوليد تقييم متكامل بنقرة واحدة.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD PERFORMANCE EVALUATION */}
      {/* ========================================================================= */}
      {isAddEvalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span>تسجيل ملاحظة تقييم أداء جديدة</span>
              </h3>
              <button
                onClick={() => setIsAddEvalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الموظف المعني *</label>
                  <select
                    value={evalFormData.employeeId}
                    onChange={e => setEvalFormData({ ...evalFormData, employeeId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">اختر الموظف...</option>
                    {visibleTeamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ الواقعة *</label>
                  <input
                    type="date"
                    value={evalFormData.date}
                    onChange={e => setEvalFormData({ ...evalFormData, date: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع التقييم *</label>
                  <select
                    value={evalFormData.type}
                    onChange={e => setEvalFormData({ ...evalFormData, type: e.target.value as EvaluationType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="positive">🌟 إيجابيات والتزام ممتاز</option>
                    <option value="extra_work">🚀 شغل إضافي ومبادرة متميزة</option>
                    <option value="improvement">🎯 فرصة للتحسين والتطوير</option>
                    <option value="negative">⚠️ تقصير أو ملاحظة سلبية</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">التصنيف *</label>
                  <select
                    value={evalFormData.category}
                    onChange={e => setEvalFormData({ ...evalFormData, category: e.target.value as EvaluationCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="quality">جودة العمل والتدقيق</option>
                    <option value="commitment">الالتزام والمواعيد</option>
                    <option value="teamwork">التعاون مع الفريق</option>
                    <option value="initiative">المبادرة وحل المشاكل</option>
                    <option value="communication">التواصل والاجتماعات</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">وصف الموقف بالتفصيل *</label>
                <textarea
                  rows={3}
                  value={evalFormData.description}
                  onChange={e => setEvalFormData({ ...evalFormData, description: e.target.value })}
                  placeholder="اشرح ما حدث بدقة وموضوعية، مع التركيز على النتيجة وليس الشخص..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ربط بتاسك محددة (اختياري)</label>
                  <select
                    value={evalFormData.relatedTaskId}
                    onChange={e => setEvalFormData({ ...evalFormData, relatedTaskId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">غير مرتبط بتاسك</option>
                    {tasks.slice(0, 30).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الإجراء المتخذ (إن وجد)</label>
                  <input
                    type="text"
                    placeholder="مثال: شكر وتقدير، توجيه ودي، بونص..."
                    value={evalFormData.actionTaken}
                    onChange={e => setEvalFormData({ ...evalFormData, actionTaken: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                💡 <strong>قاعدة إدارية عادلة:</strong> مش كل غلطة تستحق خصماً، ومش كل شغل إضافي يمثل أفضلية مطلقة. التقييم العادل يعتمد على معايير معلنة، وظروف العمل، وجودة النتيجة.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddEvalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD DELAY RECORD */}
      {/* ========================================================================= */}
      {isAddDelayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-600" />
                <span>تسجيل واقعة تأخير حضور</span>
              </h3>
              <button
                onClick={() => setIsAddDelayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDelay} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">الموظف المتأخر *</label>
                <select
                  value={delayFormData.employeeId}
                  onChange={e => setDelayFormData({ ...delayFormData, employeeId: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">اختر الموظف...</option>
                  {visibleTeamMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التاريخ *</label>
                  <input
                    type="date"
                    value={delayFormData.date}
                    onChange={e => setDelayFormData({ ...delayFormData, date: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">بداية الدوام</label>
                  <input
                    type="time"
                    value={delayFormData.scheduledStartTime}
                    onChange={e => setDelayFormData({ ...delayFormData, scheduledStartTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الحضور الفعلي</label>
                  <input
                    type="time"
                    value={delayFormData.actualArrivalTime}
                    onChange={e => setDelayFormData({ ...delayFormData, actualArrivalTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-rose-600"
                  />
                </div>
              </div>

              {/* Automatic delay calculation badge */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">مدة التأخير المحسوبة تلقائياً:</span>
                <span className="text-base font-black text-rose-600">
                  {calculatedLiveDelayMinutes} دقيقة ({getDelayRangeCategory(calculatedLiveDelayMinutes)})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">سبب التأخير</label>
                  <select
                    value={delayFormData.reasonCategory}
                    onChange={e => setDelayFormData({ ...delayFormData, reasonCategory: e.target.value as DelayReasonCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="traffic_commute">ازدحام مواصلات / طريق</option>
                    <option value="emergency">ظرف طارئ</option>
                    <option value="personal">سبب شخصي</option>
                    <option value="attendance_device_issue">مشكلة في تسجيل الحضور</option>
                    <option value="not_specified">غير موضح حتى الآن</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">حالة مراجعة العذر</label>
                  <select
                    value={delayFormData.reviewStatus}
                    onChange={e => setDelayFormData({ ...delayFormData, reviewStatus: e.target.value as DelayReviewStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  >
                    <option value="pending">بانتظار المراجعة</option>
                    <option value="reviewed">تمت المراجعة</option>
                    <option value="excused">تم اعتماد العذر</option>
                    <option value="unexcused">عذر غير مقبول</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">العذر والتوضيح المقدم</label>
                <textarea
                  rows={2}
                  value={delayFormData.reasonDetails}
                  onChange={e => setDelayFormData({ ...delayFormData, reasonDetails: e.target.value })}
                  placeholder="سجل عذر الموظف المقدم للإدارة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddDelayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  تسجيل الواقعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD COMPANY RULE */}
      {/* ========================================================================= */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>إضافة قاعدة وسياسة جديدة للشركة</span>
              </h3>
              <button
                onClick={() => setIsAddRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم القاعدة / السياسة *</label>
                <input
                  type="text"
                  placeholder="مثال: ضوابط تسليم تقارير السيو الشهرية"
                  value={ruleFormData.title}
                  onChange={e => setRuleFormData({ ...ruleFormData, title: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التصنيف *</label>
                  <select
                    value={ruleFormData.category}
                    onChange={e => setRuleFormData({ ...ruleFormData, category: e.target.value as CompanyRuleCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  >
                    <option value="attendance">الحضور والانصراف</option>
                    <option value="work_quality">جودة الشغل والتدقيق</option>
                    <option value="task_delivery">تسليم ومتابعة التاسكات</option>
                    <option value="confidentiality">سرية المعلومات</option>
                    <option value="tools_usage">أدوات الشركة والذكاء الاصطناعي</option>
                    <option value="communication">التواصل والاجتماعات</option>
                    <option value="general">عام</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ السريان (لا تطبق بأثر رجعي)</label>
                  <input
                    type="date"
                    value={ruleFormData.effectiveDate}
                    onChange={e => setRuleFormData({ ...ruleFormData, effectiveDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شرح وتفاصيل القاعدة بدقة *</label>
                <textarea
                  rows={3}
                  value={ruleFormData.description}
                  onChange={e => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  placeholder="اشرح المطلوب بدقة حتى يفهم كل موظف واجبه بوضوح..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">آلية التعامل مع عدم الالتزام</label>
                <input
                  type="text"
                  value={ruleFormData.violationProcedure}
                  onChange={e => setRuleFormData({ ...ruleFormData, violationProcedure: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  نشر القاعدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD RULE VIOLATION */}
      {/* ========================================================================= */}
      {isAddViolationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>تسجيل حالة عدم التزام بقواعد الشركة</span>
              </h3>
              <button
                onClick={() => setIsAddViolationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateViolation} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">القاعدة المنتهكة *</label>
                <select
                  value={violationFormData.ruleId}
                  onChange={e => setViolationFormData({ ...violationFormData, ruleId: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                >
                  <option value="">اختر القاعدة من المكتبة...</option>
                  {companyRules.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الموظف المعني *</label>
                  <select
                    value={violationFormData.employeeId}
                    onChange={e => setViolationFormData({ ...violationFormData, employeeId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="">اختر الموظف...</option>
                    {visibleTeamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ الواقعة *</label>
                  <input
                    type="date"
                    value={violationFormData.incidentDate}
                    onChange={e => setViolationFormData({ ...violationFormData, incidentDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">تفاصيل الواقعة والأدلة *</label>
                <textarea
                  rows={3}
                  value={violationFormData.description}
                  onChange={e => setViolationFormData({ ...violationFormData, description: e.target.value })}
                  placeholder="سجل الواقعة بموضوعية تامة مع ذكر التواريخ والوقائع المؤكدة..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px]">
                ℹ️ تسجيل الحالة يُدرجها فوراً في حالة <strong>"قيد المراجعة"</strong> ويتيح للموظف تقديم توضيحه قبل تأكيد أي إجراء.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddViolationModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  حفظ وتسجيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EMPLOYEE CLARIFICATION / REPLY */}
      {/* ========================================================================= */}
      {clarificationTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>إضافة توضيح ورد على الملاحظة</span>
              </h3>
              <button
                onClick={() => setClarificationTarget(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <span className="text-slate-400 block text-[11px] font-bold mb-1">نص الملاحظة المسجلة:</span>
              <p>{clarificationTarget.title}</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">توضيحك أو ردك المهني *</label>
              <textarea
                rows={4}
                value={clarificationText}
                onChange={e => setClarificationText(e.target.value)}
                placeholder="اكتب توضيحك وظروف الموقف بدقة وموضوعية..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setClarificationTarget(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSubmitClarification}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer text-xs"
              >
                إرسال التوضيح
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: GENERATE MONTHLY PERFORMANCE REVIEW */}
      {/* ========================================================================= */}
      {isGenerateMonthlyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>اعتماد التقييم الشهري الرسمي للموظف</span>
              </h3>
              <button
                onClick={() => setIsGenerateMonthlyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMonthlyReview} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الموظف *</label>
                  <select
                    value={monthlyReviewForm.employeeId}
                    onChange={e => setMonthlyReviewForm({ ...monthlyReviewForm, employeeId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  >
                    {visibleTeamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الشهر المستهدف *</label>
                  <input
                    type="month"
                    value={monthlyReviewForm.month}
                    onChange={e => setMonthlyReviewForm({ ...monthlyReviewForm, month: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Live Preview of Calculated KPIs */}
              {(() => {
                const liveEmp = team.find(m => m.id === monthlyReviewForm.employeeId) || visibleTeamMembers[0];
                const liveKpis = calculateEmployeeKPIs(
                  liveEmp.id,
                  tasks,
                  delays,
                  performanceEvaluations,
                  ruleViolations,
                  monthlyReviewForm.month
                );

                return (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block text-[11px]">
                      المؤشرات المحسوبة تلقائياً لشهر ({monthlyReviewForm.month}):
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">إنجاز التاسكات</span>
                        <strong className="text-blue-600 font-bold text-xs">{liveKpis.tasksCompletionRate}%</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">التسليم في الموعد</span>
                        <strong className="text-emerald-600 font-bold text-xs">{liveKpis.onTimeDeliveryRate}%</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">التقييم الإجمالي الموزون</span>
                        <strong className="text-slate-900 font-black text-xs">{liveKpis.overallScore}% ({liveKpis.ratingText})</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="font-bold text-slate-700 block mb-1">نقاط القوة والإشادة *</label>
                <textarea
                  rows={2}
                  value={monthlyReviewForm.strengths}
                  onChange={e => setMonthlyReviewForm({ ...monthlyReviewForm, strengths: e.target.value })}
                  placeholder="أبرز الإنجازات والصفات المميزة خلال الشهر..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الجوانب التي تحتاج إلى تحسين *</label>
                <textarea
                  rows={2}
                  value={monthlyReviewForm.areasForImprovement}
                  onChange={e => setMonthlyReviewForm({ ...monthlyReviewForm, areasForImprovement: e.target.value })}
                  placeholder="المهارات أو النقاط العملية المستهدفة للتطوير..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">أهداف قابلة للمتابعة للشهر القادم *</label>
                <input
                  type="text"
                  value={monthlyReviewForm.nextMonthGoals}
                  onChange={e => setMonthlyReviewForm({ ...monthlyReviewForm, nextMonthGoals: e.target.value })}
                  placeholder="مثال: تسليم 100% من المهام في موعدها وتطوير تقارير السيو"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات المدير الختامية</label>
                <input
                  type="text"
                  value={monthlyReviewForm.managerNotes}
                  onChange={e => setMonthlyReviewForm({ ...monthlyReviewForm, managerNotes: e.target.value })}
                  placeholder="كلمة تشجيعية أو توجيه ختامي من الإدارة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGenerateMonthlyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد وحفظ التقييم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
