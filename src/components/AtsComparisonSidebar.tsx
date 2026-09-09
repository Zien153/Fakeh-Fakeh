import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ArrowLeftRight,
  Plus,
  Copy,
  Check,
  Filter,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { ResumeData, AtsReviewData } from '../types';
import {
  computeAtsDiscrepancies,
  AtsDiscrepancyItem,
  DiscrepancySeverity,
} from '../utils/atsComparisonEngine';

interface AtsComparisonSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  atsReview?: AtsReviewData | null;
  onUpdateResume?: (updated: ResumeData) => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export const AtsComparisonSidebar: React.FC<AtsComparisonSidebarProps> = ({
  isOpen,
  onClose,
  resume,
  atsReview,
  onUpdateResume,
  onNavigateToSection,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'tip'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({});

  const comparison = computeAtsDiscrepancies(resume, atsReview);

  const filteredDiscrepancies = comparison.discrepancies.filter((item) => {
    if (severityFilter === 'all') return true;
    return item.severity === severityFilter;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Quick Action Handler for instant one-click manual enhancement
  const handleApplyQuickAction = (item: AtsDiscrepancyItem) => {
    if (!onUpdateResume) return;

    if (item.quickActionType === 'add_skill' && item.suggestedText) {
      const newTechSkills = [...(resume.skills.technical || [])];
      if (!newTechSkills.includes(item.suggestedText)) {
        newTechSkills.push(item.suggestedText);
      }
      onUpdateResume({
        ...resume,
        skills: {
          ...resume.skills,
          technical: newTechSkills,
        },
      });
      setAppliedActions((prev) => ({ ...prev, [item.id]: true }));
    } else if (
      item.quickActionType === 'replace_weak_verb' &&
      item.targetExpIndex !== undefined &&
      item.targetBulletIndex !== undefined &&
      item.suggestedText
    ) {
      const newExps = [...resume.experiences];
      if (newExps[item.targetExpIndex]) {
        const newBullets = [...newExps[item.targetExpIndex].bullets];
        newBullets[item.targetBulletIndex] = item.suggestedText;
        newExps[item.targetExpIndex] = {
          ...newExps[item.targetExpIndex],
          bullets: newBullets,
        };
        onUpdateResume({ ...resume, experiences: newExps });
        setAppliedActions((prev) => ({ ...prev, [item.id]: true }));
      }
    } else if (
      item.quickActionType === 'add_metric_example' &&
      item.targetExpIndex !== undefined &&
      item.targetBulletIndex !== undefined &&
      item.suggestedText
    ) {
      const newExps = [...resume.experiences];
      if (newExps[item.targetExpIndex]) {
        const newBullets = [...newExps[item.targetExpIndex].bullets];
        const currentB = newBullets[item.targetBulletIndex];
        newBullets[item.targetBulletIndex] = `${currentB}، ${item.suggestedText}`;
        newExps[item.targetExpIndex] = {
          ...newExps[item.targetExpIndex],
          bullets: newBullets,
        };
        onUpdateResume({ ...resume, experiences: newExps });
        setAppliedActions((prev) => ({ ...prev, [item.id]: true }));
      }
    } else if (item.quickActionType === 'improve_summary' && item.suggestedText) {
      onUpdateResume({
        ...resume,
        summary: item.suggestedText,
      });
      setAppliedActions((prev) => ({ ...prev, [item.id]: true }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (RTL: Slide in from the left or right) */}
      <aside
        className="fixed top-0 bottom-0 left-0 w-full sm:w-[480px] lg:w-[520px] bg-white shadow-2xl z-50 flex flex-col border-r border-slate-200 overflow-hidden animate-in slide-in-from-left duration-300"
        dir="rtl"
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <SlidersHorizontal className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">مقارنة السيرة مع توصيات ATS</h2>
                <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full font-bold border border-indigo-400/20">
                  لوحة التباين المباشر
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                رصد الفروقات ونقاط النقص لتسهيل التحسين اليدوي السريع
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق اللوحة الجانبية"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alignment Health Cards */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          {/* Top Score Comparison Row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
              <span className="block text-[10px] font-bold text-slate-500 mb-0.5">تطابق الكلمات</span>
              <span className="text-base sm:text-lg font-black text-indigo-700">
                {comparison.alignmentSummary.keywordAlignmentPercent}%
              </span>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${comparison.alignmentSummary.keywordAlignmentPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
              <span className="block text-[10px] font-bold text-slate-500 mb-0.5">الأرقام القياسية</span>
              <span className="text-base sm:text-lg font-black text-teal-700">
                {comparison.alignmentSummary.quantificationAlignmentPercent}%
              </span>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-1.5 rounded-full"
                  style={{ width: `${comparison.alignmentSummary.quantificationAlignmentPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
              <span className="block text-[10px] font-bold text-slate-500 mb-0.5">قوة الأفعال</span>
              <span className="text-base sm:text-lg font-black text-amber-700">
                {comparison.alignmentSummary.actionVerbStrengthPercent}%
              </span>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${comparison.alignmentSummary.actionVerbStrengthPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-600 font-semibold text-[11px]">الفلترة:</span>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSeverityFilter('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  severityFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({comparison.totalDiscrepancies})
              </button>

              <button
                type="button"
                onClick={() => setSeverityFilter('critical')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  severityFilter === 'critical'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>حرجة ({comparison.criticalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSeverityFilter('warning')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  severityFilter === 'warning'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>تحذير ({comparison.warningCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSeverityFilter('tip')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  severityFilter === 'tip'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>نصائح ({comparison.tipsCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Discrepancies Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100">
          {filteredDiscrepancies.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-200/80 my-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-emerald-950">لا توجد نقاط تباين في هذا التصنيف!</h3>
              <p className="text-xs text-emerald-800 mt-1 max-w-xs mx-auto">
                السيرة الذاتية متطابقة بشكل ممتاز مع التوصيات المختارة وتلبي معايير الفرز الآلي.
              </p>
            </div>
          ) : (
            filteredDiscrepancies.map((item) => {
              const isExpanded = expandedId === item.id;
              const isApplied = appliedActions[item.id];

              return (
                <div
                  key={item.id}
                  className={`pt-3.5 first:pt-0 transition-all rounded-xl p-3 border ${
                    item.severity === 'critical'
                      ? 'bg-rose-50/30 border-rose-200'
                      : item.severity === 'warning'
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {item.severity === 'critical' ? (
                        <span className="p-1 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                          <AlertCircle className="w-4 h-4" />
                        </span>
                      ) : item.severity === 'warning' ? (
                        <span className="p-1 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="p-1 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                          <Info className="w-4 h-4" />
                        </span>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                              item.severity === 'critical'
                                ? 'bg-rose-200/80 text-rose-900'
                                : item.severity === 'warning'
                                ? 'bg-amber-200/80 text-amber-900'
                                : 'bg-blue-200/80 text-blue-900'
                            }`}
                          >
                            {item.categoryLabel}
                          </span>
                          {isApplied && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>تم التطبيق</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      title={isExpanded ? 'طي التفاصيل' : 'توسيع التفاصيل'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Contrast Box: Current vs Recommended (نقاط التباين المباشرة) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                    {/* Current State */}
                    <div className="p-2.5 rounded-lg bg-white border border-rose-200/80">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>في سيرتك الحالية:</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-3">
                        {item.currentValue}
                      </p>
                    </div>

                    {/* Recommended ATS State */}
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>توصية ATS المستهدفة:</span>
                      </div>
                      <p className="text-emerald-950 font-medium text-[11px] leading-relaxed line-clamp-3">
                        {item.recommendedValue}
                      </p>
                    </div>
                  </div>

                  {/* Explanation of Why it Matters */}
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    <strong>الأثر في التوظيف:</strong> {item.explanation}
                  </p>

                  {/* Actions Bar: One-Click Quick Action & Copy */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/70 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {/* One-click Apply if supported */}
                      {item.quickActionType && onUpdateResume && (
                        <button
                          type="button"
                          onClick={() => handleApplyQuickAction(item)}
                          disabled={isApplied}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            isApplied
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs active:scale-98'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>مطبقة في السيرة</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>
                                {item.quickActionType === 'add_skill'
                                  ? 'إضافة للمهارات فوراً'
                                  : item.quickActionType === 'replace_weak_verb'
                                  ? 'استبدال بنقطة قوية'
                                  : item.quickActionType === 'add_metric_example'
                                  ? 'إلحاق نتيجة قياسية'
                                  : 'تحديث الملخص فوراً'}
                              </span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Copy snippet button */}
                      {item.suggestedText && (
                        <button
                          type="button"
                          onClick={() => handleCopy(item.suggestedText!, item.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          title="نسخ النص المقترح للتحسين اليدوي"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>نسخ المقترح</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Section Anchor link */}
                    {onNavigateToSection && (
                      <button
                        type="button"
                        onClick={() => {
                          const sec = item.targetSection === 'skills' ? 'resume-skills' : item.targetSection === 'summary' ? 'resume-summary' : 'resume-experiences';
                          onNavigateToSection(sec);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>الانتقال للقسم</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Guidance */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>يتم تحديث التحليل تلقائياً مع كل تعديل في السيرة.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 cursor-pointer"
          >
            إغلاق اللوحة
          </button>
        </div>
      </aside>
    </>
  );
};
