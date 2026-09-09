import React, { useState } from 'react';
import {
  FileText,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Building2,
  Briefcase,
  ChevronLeft,
} from 'lucide-react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { JobDescriptionPromptModal } from './components/JobDescriptionPromptModal';
import { ExecutionStepsProgress } from './components/ExecutionStepsProgress';
import { ResumeView } from './components/ResumeView';
import { CoverLetterView } from './components/CoverLetterView';
import { AtsReviewCard } from './components/AtsReviewCard';
import { AtsComparisonSidebar } from './components/AtsComparisonSidebar';
import { KeywordHeatmapModal } from './components/KeywordHeatmapModal';
import { SAMPLE_PROFILES, SampleProfile } from './data/sampleProfiles';
import { ResumeData, CoverLetterData, AtsReviewData, StepsExecutionLog } from './types';
import { exportElementToPdf } from './utils/pdfExport';

export default function App() {
  // Input States
  const [targetJobTitle, setTargetJobTitle] = useState(SAMPLE_PROFILES[0].targetJobTitle);
  const [targetCompany, setTargetCompany] = useState(SAMPLE_PROFILES[0].targetCompany);
  const [targetJobDescription, setTargetJobDescription] = useState(SAMPLE_PROFILES[0].targetJobDescription);
  const [fullName, setFullName] = useState(SAMPLE_PROFILES[0].rawUserInfo.fullName);
  const [email, setEmail] = useState(SAMPLE_PROFILES[0].rawUserInfo.email);
  const [phone, setPhone] = useState(SAMPLE_PROFILES[0].rawUserInfo.phone);
  const [location, setLocation] = useState(SAMPLE_PROFILES[0].rawUserInfo.location);
  const [linkedin, setLinkedin] = useState(SAMPLE_PROFILES[0].rawUserInfo.linkedin);
  const [rawNotes, setRawNotes] = useState(SAMPLE_PROFILES[0].rawUserInfo.rawNotes);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  // Generation & Output States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData | null>(null);
  const [atsReviewData, setAtsReviewData] = useState<AtsReviewData | null>(null);
  const [stepsLogs, setStepsLogs] = useState<StepsExecutionLog[]>([]);

  // Navigation & View States
  const [activeOutputTab, setActiveOutputTab] = useState<'resume' | 'cover-letter' | 'ats-review'>('resume');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);
  const [isComparisonSidebarOpen, setIsComparisonSidebarOpen] = useState(false);
  const [isHeatmapModalOpen, setIsHeatmapModalOpen] = useState(false);
  const [quickKeywords, setQuickKeywords] = useState<{
    coreKeywords?: string[];
    hardSkills?: string[];
    softSkills?: string[];
  } | null>(null);

  // Load a sample profile
  const handleSelectSample = (sample: SampleProfile) => {
    setTargetJobTitle(sample.targetJobTitle);
    setTargetCompany(sample.targetCompany);
    setTargetJobDescription(sample.targetJobDescription);
    setFullName(sample.rawUserInfo.fullName);
    setEmail(sample.rawUserInfo.email);
    setPhone(sample.rawUserInfo.phone);
    setLocation(sample.rawUserInfo.location);
    setLinkedin(sample.rawUserInfo.linkedin);
    setRawNotes(sample.rawUserInfo.rawNotes);
    setQuickKeywords(null);
  };

  // Quick extract keywords
  const handleExtractKeywordsQuickly = async () => {
    if (!targetJobDescription || targetJobDescription.trim().length < 15) {
      setIsPromptModalOpen(true);
      return;
    }
    setIsExtractingKeywords(true);
    try {
      const res = await fetch('/api/resume/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetJobDescription }),
      });
      const data = await res.json();
      if (data.success) {
        setQuickKeywords({
          coreKeywords: data.coreKeywords,
          hardSkills: data.hardSkills,
          softSkills: data.softSkills,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtractingKeywords(false);
    }
  };

  // Main Generation Handler
  const handleGenerate = async (explicitJobDesc?: string) => {
    const jobDesc = explicitJobDesc || targetJobDescription;

    // MANDATORY RULE: "إذا غاب وصف الوظيفة، اطلبه قبل المتابعة."
    if (!jobDesc || jobDesc.trim().length < 15) {
      setIsPromptModalOpen(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const payload = {
        targetJobTitle,
        targetCompany,
        targetJobDescription: jobDesc,
        language,
        rawUserInfo: {
          fullName,
          phone,
          email,
          location,
          linkedin,
          rawNotes,
        },
      };

      const res = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.missingJobDescription) {
          setIsPromptModalOpen(true);
        }
        let msg = data.message || 'حدث خطأ أثناء معالجة البيانات.';
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
          msg = 'تشهد خوادم الذكاء الاصطناعي ضغطاً مؤقتاً في هذه اللحظة. يرجى الضغط على زر "إعادة المحاولة" للمتابعة.';
        }
        throw new Error(msg);
      }

      setResumeData(data.resume);
      setCoverLetterData(data.coverLetter);
      setAtsReviewData(data.atsReview);
      setStepsLogs(data.stepsLogs || []);
      if (data.notice) {
        setNoticeMessage(data.notice);
      }
      setActiveOutputTab('resume');

      // Smooth scroll to output container
      setTimeout(() => {
        const outputElem = document.getElementById('output-section');
        if (outputElem) {
          outputElem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      let rawMsg = err.message || 'تعذر استكمال المعالجة. يرجى المحاولة مرة أخرى.';
      if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
        rawMsg = 'تشهد خوادم الذكاء الاصطناعي ضغطاً مؤقتاً في هذه اللحظة. يرجى النقر على زر "إعادة المحاولة" لإعادة التنفيذ فوراً.';
      }
      setErrorMessage(rawMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    if (!resumeData) return;
    setIsExportingPdf(true);
    try {
      // Ensure the resume tab is active so that #resume-document exists in the DOM
      if (activeOutputTab !== 'resume') {
        setActiveOutputTab('resume');
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      const candidateName = (resumeData.personalInfo.fullName || 'Candidate').replace(/\s+/g, '_');
      const filename = `${candidateName}_ATS_Resume.pdf`;
      await exportElementToPdf({
        elementId: 'resume-document',
        filename,
        quality: 2,
      });
      setNoticeMessage('تم تصدير ملف السيرة الذاتية (PDF) بنجاح وبأعلى جودة مع الحفاظ التام على التنسيق.');
      setTimeout(() => setNoticeMessage(null), 5000);
    } catch (err: any) {
      console.warn('Export PDF notice:', err?.message || err);
      setErrorMessage('تعذر تصدير ملف PDF مباشرة. يمكنك النقر على زر الطباعة واختيار حفظ كـ PDF كبديل.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <Header
        onSelectSample={handleSelectSample}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        hasGeneratedData={!!resumeData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Notice Alert if any */}
        {noticeMessage && (
          <div className="no-print p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              onClick={() => setNoticeMessage(null)}
              className="text-indigo-600 hover:text-indigo-900 font-bold px-2 py-1 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Error Alert if any with Retry Action */}
        {errorMessage && (
          <div className="no-print p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة الآن</span>
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-600 hover:text-rose-900 font-bold px-2 py-1 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        {/* Input Section */}
        <InputSection
          targetJobTitle={targetJobTitle}
          setTargetJobTitle={setTargetJobTitle}
          targetCompany={targetCompany}
          setTargetCompany={setTargetCompany}
          targetJobDescription={targetJobDescription}
          setTargetJobDescription={setTargetJobDescription}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          location={location}
          setLocation={setLocation}
          linkedin={linkedin}
          setLinkedin={setLinkedin}
          rawNotes={rawNotes}
          setRawNotes={setRawNotes}
          language={language}
          setLanguage={setLanguage}
          onSubmit={() => handleGenerate()}
          isLoading={isLoading}
          onExtractKeywordsQuickly={handleExtractKeywordsQuickly}
          isExtractingKeywords={isExtractingKeywords}
          quickKeywords={quickKeywords}
        />

        {/* 5 Steps Execution Progress Indicator */}
        <ExecutionStepsProgress isLoading={isLoading} />

        {/* Output Section (Resume | Cover Letter | ATS Keywords Review) */}
        {resumeData && (
          <section id="output-section" className="space-y-4 pt-2">
            {/* Output Tabs Navigation (No Print) */}
            <div className="no-print bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  id="tab-resume"
                  onClick={() => setActiveOutputTab('resume')}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                    activeOutputTab === 'resume'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>1. سيرة ذاتية منسقة (ATS Resume)</span>
                </button>

                <button
                  type="button"
                  id="tab-cover-letter"
                  onClick={() => setActiveOutputTab('cover-letter')}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                    activeOutputTab === 'cover-letter'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>2. رسالة تغطية مخصصة للشركة</span>
                </button>

                <button
                  type="button"
                  id="tab-ats-review"
                  onClick={() => setActiveOutputTab('ats-review')}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                    activeOutputTab === 'ats-review'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. مراجعة وتدقيق كلمات ATS</span>
                  {atsReviewData && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {atsReviewData.matchScore}%
                    </span>
                  )}
                </button>
              </div>

              <div className="hidden md:flex items-center text-xs text-slate-500 gap-1.5 font-medium pr-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>الترتيب: ملخص | خبرات | مهارات | تعليم</span>
              </div>
            </div>

            {/* Tab Views */}
            {activeOutputTab === 'resume' && (
              <ResumeView
                resume={resumeData}
                atsReview={atsReviewData}
                onUpdateResume={(updated) => setResumeData(updated)}
                targetJobTitle={targetJobTitle}
                targetJobDescription={targetJobDescription}
                onPrint={handlePrint}
              />
            )}

            {activeOutputTab === 'cover-letter' && coverLetterData && (
              <CoverLetterView
                coverLetter={coverLetterData}
                personalInfo={resumeData.personalInfo}
                onPrint={handlePrint}
              />
            )}

            {activeOutputTab === 'ats-review' && atsReviewData && (
              <>
                <AtsReviewCard
                  atsReview={atsReviewData}
                  onOpenComparison={() => setIsComparisonSidebarOpen(true)}
                  onOpenHeatmap={() => setIsHeatmapModalOpen(true)}
                />
                <AtsComparisonSidebar
                  isOpen={isComparisonSidebarOpen}
                  onClose={() => setIsComparisonSidebarOpen(false)}
                  resume={resumeData}
                  atsReview={atsReviewData}
                  onUpdateResume={(updated) => setResumeData(updated)}
                  onNavigateToSection={() => {
                    setActiveOutputTab('resume');
                    setIsComparisonSidebarOpen(false);
                  }}
                />
                {resumeData && (
                  <KeywordHeatmapModal
                    isOpen={isHeatmapModalOpen}
                    onClose={() => setIsHeatmapModalOpen(false)}
                    resume={resumeData}
                    atsReview={atsReviewData}
                    targetJobDescription={targetJobDescription}
                    onAddSkill={(skillName, category) => {
                      const currentSkills = { ...resumeData.skills };
                      if (category === 'tools') {
                        currentSkills.tools = [...(currentSkills.tools || []), skillName];
                      } else if (category === 'soft') {
                        currentSkills.soft = [...(currentSkills.soft || []), skillName];
                      } else {
                        currentSkills.technical = [...(currentSkills.technical || []), skillName];
                      }
                      setResumeData({ ...resumeData, skills: currentSkills });
                    }}
                    onNavigateToSection={() => {
                      setActiveOutputTab('resume');
                      setIsHeatmapModalOpen(false);
                    }}
                  />
                )}
              </>
            )}
          </section>
        )}
      </main>

      {/* Mandatory Job Description Warning Modal */}
      <JobDescriptionPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSubmit={(desc) => {
          setTargetJobDescription(desc);
          setIsPromptModalOpen(false);
          handleGenerate(desc);
        }}
      />

      {/* Footer */}
      <footer className="no-print mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>منصة بناء السيرة الذاتية ورسالة التغطية وفق معايير ATS ومسؤولي التوظيف</span>
          <span className="text-[11px] text-slate-400">
            أفعال حركة قوية • إنجازات مرقمة • توافق 100% مع أنظمة الفرز الآلي
          </span>
        </div>
      </footer>
    </div>
  );
}
