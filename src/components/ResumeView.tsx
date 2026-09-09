import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Sparkles,
  Edit2,
  Check,
  RotateCcw,
  Copy,
  Printer,
  CheckCircle2,
  ExternalLink,
  FileDown,
  Loader2,
  AlertCircle,
  Zap,
  AlertTriangle,
  ArrowLeftRight,
  HelpCircle,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { ResumeData, ExperienceItem, AtsReviewData } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import { ActionVerbsAuditCard } from './ActionVerbsAuditCard';
import { AtsComparisonSidebar } from './AtsComparisonSidebar';
import { KeywordHeatmapCard } from './KeywordHeatmapCard';
import { KeywordHeatmapModal } from './KeywordHeatmapModal';
import { computeAtsDiscrepancies } from '../utils/atsComparisonEngine';
import { analyzeResumeKeywordDensity } from '../utils/keywordHeatmapEngine';
import {
  analyzeBulletText,
  analyzeExperienceVerbs,
  replaceWeakVerbInBullet,
  VerbMatch,
} from '../utils/verbAnalyzer';

interface ResumeViewProps {
  resume: ResumeData;
  atsReview?: AtsReviewData | null;
  onUpdateResume?: (updated: ResumeData) => void;
  targetJobTitle?: string;
  targetJobDescription?: string;
  onPrint: () => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({
  resume,
  atsReview,
  onUpdateResume,
  targetJobTitle,
  targetJobDescription,
  onPrint,
}) => {
  const [theme, setTheme] = useState<'classic' | 'modern' | 'minimal'>('classic');
  const [highlightKeywords, setHighlightKeywords] = useState(true);
  const [editingBulletKey, setEditingBulletKey] = useState<string | null>(null);
  const [editingBulletText, setEditingBulletText] = useState('');
  const [isImprovingBullet, setIsImprovingBullet] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [activeWeakVerbKey, setActiveWeakVerbKey] = useState<string | null>(null);
  const [isComparisonSidebarOpen, setIsComparisonSidebarOpen] = useState(false);
  const [isHeatmapModalOpen, setIsHeatmapModalOpen] = useState(false);

  // Overall Verb Analysis
  const verbAnalysis = analyzeExperienceVerbs(resume.experiences);

  // ATS Discrepancies calculation for badge
  const discrepancyAnalysis = computeAtsDiscrepancies(resume, atsReview);

  // Keyword Density and Heatmap stats for toolbar indicator
  const heatmapAnalysis = analyzeResumeKeywordDensity(resume, atsReview, targetJobDescription);

  // PDF Export States
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setExportError(null);
    try {
      const candidateName = (resume.personalInfo.fullName || 'Candidate').replace(/\s+/g, '_');
      const filename = `${candidateName}_ATS_Resume.pdf`;
      await exportElementToPdf({
        elementId: 'resume-document',
        filename,
        quality: 2,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err: any) {
      console.warn('PDF export notice:', err?.message || err);
      setExportError('تعذر تصدير ملف PDF مباشرة. يمكنك النقر على زر الطباعة واختيار حفظ كـ PDF كخيار بديل.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Helper to copy resume in plain text (ideal for pasting into ATS forms)
  const handleCopyPlainText = () => {
    let plain = `${resume.personalInfo.fullName}\n${resume.personalInfo.jobTitle}\n`;
    plain += `${resume.personalInfo.email} | ${resume.personalInfo.phone} | ${resume.personalInfo.location}\n`;
    if (resume.personalInfo.linkedin) plain += `${resume.personalInfo.linkedin}\n`;
    plain += `\n--- الملخص المهني (PROFESSIONAL SUMMARY) ---\n${resume.summary}\n`;
    plain += `\n--- الخبرات المهنية (WORK EXPERIENCE) ---\n`;
    resume.experiences.forEach((exp) => {
      plain += `\n${exp.title} | ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
      exp.bullets.forEach((b) => {
        plain += `• ${b}\n`;
      });
    });
    plain += `\n--- المهارات (CORE SKILLS) ---\n`;
    plain += `المهارات التقنية: ${resume.skills.technical.join(', ')}\n`;
    plain += `الأدوات والأنظمة: ${resume.skills.tools.join(', ')}\n`;
    plain += `المهارات القيادية: ${resume.skills.soft.join(', ')}\n`;
    plain += `\n--- التعليم (EDUCATION) ---\n`;
    resume.education.forEach((edu) => {
      plain += `${edu.degree} - ${edu.institution} (${edu.graduationYear})\n`;
    });

    navigator.clipboard.writeText(plain);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleStartEditBullet = (expIndex: number, bulletIndex: number, text: string) => {
    setEditingBulletKey(`${expIndex}-${bulletIndex}`);
    setEditingBulletText(text);
  };

  const handleSaveBullet = (expIndex: number, bulletIndex: number) => {
    if (!onUpdateResume) return;
    const newExps = [...resume.experiences];
    newExps[expIndex].bullets[bulletIndex] = editingBulletText;
    onUpdateResume({ ...resume, experiences: newExps });
    setEditingBulletKey(null);
  };

  const handleSaveDirectBullet = (expIndex: number, bulletIndex: number, newBulletText: string) => {
    if (!onUpdateResume) return;
    const newExps = [...resume.experiences];
    newExps[expIndex] = {
      ...newExps[expIndex],
      bullets: newExps[expIndex].bullets.map((b, i) => (i === bulletIndex ? newBulletText : b)),
    };
    onUpdateResume({ ...resume, experiences: newExps });
  };

  const handleAiImproveBullet = async (expIndex: number, bulletIndex: number) => {
    setIsImprovingBullet(true);
    try {
      const res = await fetch('/api/resume/improve-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText: editingBulletText,
          targetJobTitle,
          targetJobDescription,
        }),
      });
      const data = await res.json();
      if (data.success && data.improvedBullet) {
        setEditingBulletText(data.improvedBullet);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsImprovingBullet(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar (No Print) */}
      <div className="no-print bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">نمط التنسيق:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setTheme('classic')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                theme === 'classic'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كلاسيكي ATS (موصى به)
            </button>
            <button
              type="button"
              onClick={() => setTheme('modern')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                theme === 'modern'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عصري أنيق
            </button>
            <button
              type="button"
              onClick={() => setTheme('minimal')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                theme === 'minimal'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مختزل دقيق
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Verbs Highlight toggle */}
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={highlightKeywords}
              onChange={(e) => setHighlightKeywords(e.target.checked)}
              className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>فحص وتلوين الأفعال</span>
              {verbAnalysis.weakVerbsCount > 0 ? (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {verbAnalysis.weakVerbsCount} ضعيفة
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" />
                  <span>100% قوية</span>
                </span>
              )}
            </span>
          </label>

          {/* Comparison with ATS Recommendations Drawer Trigger */}
          <button
            type="button"
            id="btn-open-ats-comparison"
            onClick={() => setIsComparisonSidebarOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="مقارنة السيرة مع توصيات ATS وعرض نقاط التباين في واجهة جانبية لتسهيل التحسين اليدوي"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>مقارنة توصيات ATS</span>
            {discrepancyAnalysis.totalDiscrepancies > 0 ? (
              <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                {discrepancyAnalysis.totalDiscrepancies} تباينات
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                مطابقة تامة
              </span>
            )}
          </button>

          {/* Keyword Heatmap Modal Trigger */}
          <button
            type="button"
            id="btn-open-keyword-heatmap"
            onClick={() => setIsHeatmapModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="عرض خريطة حرارية لتكرار الكلمات المفتاحية وكثافتها ومكافحة حشو الكلمات (Keyword Stuffing)"
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>خريطة تكرار الكلمات</span>
            {heatmapAnalysis.overusedCount > 0 ? (
              <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {heatmapAnalysis.overusedCount} حشو
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                تنوع ممتاز
              </span>
            )}
          </button>

          {/* Copy Plain Text */}
          <button
            type="button"
            onClick={handleCopyPlainText}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>نسخ كنص خام</span>
              </>
            )}
          </button>

          {/* Direct PDF Export Button */}
          <button
            type="button"
            id="btn-export-pdf"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 rounded-lg shadow-2xs transition-all cursor-pointer ring-1 ring-indigo-500/20"
            title="تصدير السيرة الذاتية كملف PDF عالي الجودة مع الحفاظ التام على التنسيق"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري إنشاء PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-white font-bold">تم تنزيل PDF!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>تصدير ملف PDF</span>
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="طباعة عبر المتصفح"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* Action Verbs Audit Card & Instant Replacer */}
      <ActionVerbsAuditCard
        resume={resume}
        onUpdateResume={onUpdateResume}
        targetJobTitle={targetJobTitle}
        targetJobDescription={targetJobDescription}
        highlightEnabled={highlightKeywords}
        onToggleHighlight={(enabled) => setHighlightKeywords(enabled)}
      />

      {/* Keyword Frequency & Heatmap Card (Keyword Stuffing & Vocabulary Diversification) */}
      <KeywordHeatmapCard
        resume={resume}
        atsReview={atsReview}
        targetJobDescription={targetJobDescription}
        onOpenFullHeatmap={() => setIsHeatmapModalOpen(true)}
      />

      {/* PDF Export Error Notification */}
      {exportError && (
        <div className="no-print p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{exportError}</span>
          </div>
          <button
            onClick={() => setExportError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold px-2 py-0.5"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Actual Resume Container - Single Page Layout */}
      <div
        id="resume-document"
        dir="rtl"
        className={`page-container mx-auto bg-white transition-all shadow-md sm:rounded-xl overflow-hidden print:shadow-none print:rounded-none ${
          theme === 'classic'
            ? 'p-8 sm:p-10 border border-slate-300 max-w-4xl text-slate-900'
            : theme === 'modern'
            ? 'p-8 sm:p-10 border border-indigo-100 max-w-4xl text-slate-900'
            : 'p-6 sm:p-8 border border-slate-200 max-w-3xl text-slate-900'
        }`}
      >
        {/* Header: Name & Contact Info (Centered for standard ATS) */}
        <div className={`pb-4 mb-4 border-b ${theme === 'modern' ? 'border-indigo-600' : 'border-slate-800'} text-center`}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            {resume.personalInfo.fullName}
          </h1>
          <p className="text-sm sm:text-base font-semibold text-indigo-700 mt-0.5">
            {resume.personalInfo.jobTitle}
          </p>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-700 mt-2.5 font-medium">
            {resume.personalInfo.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" />
                <span dir="ltr">{resume.personalInfo.email}</span>
              </span>
            )}
            {resume.personalInfo.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" />
                <span dir="ltr">{resume.personalInfo.phone}</span>
              </span>
            )}
            {resume.personalInfo.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{resume.personalInfo.location}</span>
              </span>
            )}
            {resume.personalInfo.linkedin && (
              <span className="inline-flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-slate-500" />
                <span dir="ltr">{resume.personalInfo.linkedin}</span>
              </span>
            )}
            {resume.personalInfo.portfolio && (
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-500" />
                <span dir="ltr">{resume.personalInfo.portfolio}</span>
              </span>
            )}
          </div>
        </div>

        {/* Structured Sections Order: ملخص | خبرات | مهارات | تعليم */}
        <div className="space-y-4 text-slate-800">
          {/* 1. ملخص مهني (Professional Summary <= 4 lines) */}
          <section id="resume-summary">
            <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-300">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                الملخص المهني (Professional Summary)
              </h2>
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 text-justify">
              {resume.summary}
            </p>
          </section>

          {/* 2. الخبرات المهنية (Work Experience) */}
          <section id="resume-experiences">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-300">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                الخبرات المهنية (Work Experience)
              </h2>
            </div>

            <div className="space-y-3.5">
              {resume.experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="space-y-1">
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                    <div className="font-bold text-xs sm:text-sm text-slate-950">
                      <span>{exp.title}</span>
                      <span className="text-slate-400 mx-1.5 font-normal">|</span>
                      <span className="text-indigo-800 font-semibold">{exp.company}</span>
                      {exp.location && (
                        <span className="text-slate-500 font-normal text-xs mr-2">({exp.location})</span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-600" dir="ltr">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>

                  {/* Bullet points strictly adhering to strong action verbs + metrics */}
                  <ul className="space-y-1 text-xs sm:text-[13px] text-slate-700 list-disc list-inside">
                    {exp.bullets.map((bullet, bIdx) => {
                      const isEditing = editingBulletKey === `${expIdx}-${bIdx}`;

                      if (isEditing) {
                        return (
                          <li key={bIdx} className="list-none pl-0 my-2 p-2.5 bg-indigo-50/70 rounded-lg border border-indigo-200">
                            <textarea
                              rows={2}
                              value={editingBulletText}
                              onChange={(e) => setEditingBulletText(e.target.value)}
                              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-hidden font-sans"
                            />
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => handleAiImproveBullet(expIdx, bIdx)}
                                disabled={isImprovingBullet}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                <span>{isImprovingBullet ? 'جاري التحسين...' : 'إعادة الصياغة بفعل أقوى ورقم'}</span>
                              </button>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingBulletKey(null)}
                                  className="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1 rounded cursor-pointer"
                                >
                                  إلغاء
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveBullet(expIdx, bIdx)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>حفظ</span>
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                      }

                      const bulletAnalysis = analyzeBulletText(bullet);
                      const isWeakVerbActive = activeWeakVerbKey === `${expIdx}-${bIdx}`;

                      return (
                        <li key={bIdx} className="leading-relaxed group relative pl-1 text-justify">
                          <span className="leading-relaxed">
                            {highlightKeywords && bulletAnalysis.tokens.length > 0 ? (
                              bulletAnalysis.tokens.map((token, tIdx) => {
                                if (token.type === 'text') {
                                  return <span key={tIdx}>{token.text}</span>;
                                }

                                if (token.match.isWeak) {
                                  return (
                                    <span
                                      key={tIdx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveWeakVerbKey(
                                          isWeakVerbActive ? null : `${expIdx}-${bIdx}`
                                        );
                                      }}
                                      className={`inline-flex items-center gap-1 font-bold cursor-pointer transition-all rounded px-1.5 py-0.5 border ${
                                        isWeakVerbActive
                                          ? 'bg-amber-300 text-amber-950 border-amber-500 ring-2 ring-amber-400/40 shadow-xs'
                                          : 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-2xs'
                                      } print:bg-transparent print:border-none print:p-0 print:text-inherit print:shadow-none`}
                                      title="فعل ضعيف وفق معايير التوظيف - انقر لعرض البدائل المقترحة الأكثر قوة وتأثيراً"
                                    >
                                      <span>{token.text}</span>
                                      <span className="no-print text-[10px] bg-amber-200/90 text-amber-900 px-1 py-0.2 rounded font-bold flex items-center gap-0.5">
                                        <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                                        <span>فعل ضعيف</span>
                                      </span>
                                    </span>
                                  );
                                }

                                // Strong action verb
                                return (
                                  <span
                                    key={tIdx}
                                    className="font-semibold text-slate-950 bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500 px-0.5 rounded-xs print:bg-transparent print:border-none print:p-0 print:text-inherit"
                                    title={`فعل قيادي قوي متوافق مع معايير ATS (${token.match.categoryLabel})`}
                                  >
                                    {token.text}
                                  </span>
                                );
                              })
                            ) : (
                              <span>{bullet}</span>
                            )}
                          </span>

                          {/* Quick inline edit trigger (No print) */}
                          <button
                            type="button"
                            onClick={() => handleStartEditBullet(expIdx, bIdx, bullet)}
                            className="no-print opacity-0 group-hover:opacity-100 mr-2 p-0.5 text-slate-400 hover:text-indigo-600 transition-opacity inline-flex items-center cursor-pointer"
                            title="تعديل أو تحسين هذه النقطة"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          {/* Interactive Weak Verb Suggestions Popover (No Print) */}
                          {highlightKeywords &&
                            bulletAnalysis.hasWeak &&
                            bulletAnalysis.primaryVerb &&
                            isWeakVerbActive && (
                              <div className="no-print mt-2 p-3.5 bg-amber-50/95 border border-amber-300 rounded-xl shadow-md text-xs space-y-2.5 animate-in fade-in slide-in-from-top-1 text-right">
                                <div className="flex items-center justify-between gap-2 border-b border-amber-200 pb-2">
                                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>
                                      فعل ضعيف وفق معايير التوظيف: «
                                      {bulletAnalysis.primaryVerb.matchedText}»
                                    </span>
                                    <span className="text-[10px] font-semibold bg-amber-200 text-amber-800 px-1.5 py-0.2 rounded">
                                      {bulletAnalysis.primaryVerb.category}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setActiveWeakVerbKey(null)}
                                    className="text-amber-800 hover:text-amber-950 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {bulletAnalysis.primaryVerb.reason && (
                                  <p className="text-[11px] text-amber-900 leading-relaxed">
                                    <strong>لماذا يضعف السيرة:</strong>{' '}
                                    {bulletAnalysis.primaryVerb.reason}
                                  </p>
                                )}

                                <div>
                                  <span className="text-[11px] font-bold text-slate-800 block mb-1.5">
                                    البدائل المقترحة الأكثر قوة وتأثيراً (Action Verbs) - انقر للاستبدال الفوري:
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {bulletAnalysis.primaryVerb.alternatives.map((alt, aIdx) => (
                                      <button
                                        key={aIdx}
                                        type="button"
                                        onClick={() => {
                                          if (bulletAnalysis.primaryVerb) {
                                            const newBullet = replaceWeakVerbInBullet(
                                              bullet,
                                              bulletAnalysis.primaryVerb,
                                              alt.verb
                                            );
                                            handleSaveDirectBullet(expIdx, bIdx, newBullet);
                                            setActiveWeakVerbKey(null);
                                          }
                                        }}
                                        className="group inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-white hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg shadow-2xs transition-all cursor-pointer"
                                        title={alt.contextHint}
                                      >
                                        <ArrowLeftRight className="w-3 h-3 text-indigo-500 group-hover:text-white transition-colors" />
                                        <span>{alt.verb}</span>
                                        <span className="text-[10px] opacity-75 font-normal">
                                          ({alt.category})
                                        </span>
                                      </button>
                                    ))}

                                    {/* AI Rephrase full sentence button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleStartEditBullet(expIdx, bIdx, bullet);
                                        handleAiImproveBullet(expIdx, bIdx);
                                        setActiveWeakVerbKey(null);
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer mr-auto"
                                    >
                                      <Sparkles className="w-3 h-3 text-indigo-600" />
                                      <span>إعادة صياغة ذكية بالكامل (AI)</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* 3. المهارات (Skills) */}
          <section id="resume-skills">
            <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-300">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                المهارات والكفاءات (Skills & Competencies)
              </h2>
            </div>
            <div className="space-y-1 text-xs sm:text-[13px] leading-relaxed">
              {resume.skills.technical?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900">المهارات التقنية والصلبة: </span>
                  <span className="text-slate-700">{resume.skills.technical.join(' • ')}</span>
                </div>
              )}
              {resume.skills.tools?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900">الأدوات والأنظمة: </span>
                  <span className="text-slate-700">{resume.skills.tools.join(' • ')}</span>
                </div>
              )}
              {resume.skills.soft?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900">المهارات القيادية والشخصية: </span>
                  <span className="text-slate-700">{resume.skills.soft.join(' • ')}</span>
                </div>
              )}
            </div>
          </section>

          {/* 4. التعليم (Education) */}
          <section id="resume-education">
            <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-300">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                التعليم والمؤهلات (Education)
              </h2>
            </div>
            <div className="space-y-1.5">
              {resume.education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs sm:text-[13px]">
                  <div>
                    <span className="font-bold text-slate-950">{edu.degree}</span>
                    <span className="text-slate-400 mx-1.5 font-normal">-</span>
                    <span className="text-slate-800 font-semibold">{edu.institution}</span>
                    {edu.details && (
                      <span className="text-slate-500 mr-2 text-[11px]">({edu.details})</span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600" dir="ltr">
                    {edu.graduationYear}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Optional: Certifications */}
          {resume.certifications && resume.certifications.length > 0 && (
            <section id="resume-certifications">
              <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-300">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                  الشهادات المهنية (Certifications)
                </h2>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-[13px]">
                {resume.certifications.map((cert, idx) => (
                  <div key={cert.id || idx}>
                    <span className="font-semibold text-slate-900">{cert.name}</span>
                    <span className="text-slate-500 text-[11px] mr-1">({cert.issuer} - {cert.year})</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Side-by-Side ATS Comparison Drawer */}
      <AtsComparisonSidebar
        isOpen={isComparisonSidebarOpen}
        onClose={() => setIsComparisonSidebarOpen(false)}
        resume={resume}
        atsReview={atsReview}
        onUpdateResume={onUpdateResume}
        onNavigateToSection={(sectionId) => {
          const elem = document.getElementById(sectionId);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            elem.classList.add('ring-2', 'ring-indigo-400', 'rounded-lg');
            setTimeout(() => {
              elem.classList.remove('ring-2', 'ring-indigo-400', 'rounded-lg');
            }, 2500);
          }
        }}
      />

      {/* Visual Keyword Heatmap Modal (Density & Repetition Analyzer) */}
      <KeywordHeatmapModal
        isOpen={isHeatmapModalOpen}
        onClose={() => setIsHeatmapModalOpen(false)}
        resume={resume}
        atsReview={atsReview}
        targetJobDescription={targetJobDescription}
        onAddSkill={(skillName, category) => {
          if (!onUpdateResume) return;
          const currentSkills = { ...resume.skills };
          if (category === 'tools') {
            currentSkills.tools = [...(currentSkills.tools || []), skillName];
          } else if (category === 'soft') {
            currentSkills.soft = [...(currentSkills.soft || []), skillName];
          } else {
            currentSkills.technical = [...(currentSkills.technical || []), skillName];
          }
          onUpdateResume({ ...resume, skills: currentSkills });
        }}
        onNavigateToSection={(sectionId) => {
          const elem = document.getElementById(sectionId);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            elem.classList.add('ring-2', 'ring-rose-400', 'rounded-lg');
            setTimeout(() => {
              elem.classList.remove('ring-2', 'ring-rose-400', 'rounded-lg');
            }, 2500);
          }
        }}
      />
    </div>
  );
};
