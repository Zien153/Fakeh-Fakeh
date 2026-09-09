import React, { useState } from 'react';
import { FileText, Mail, CheckCircle2, AlertTriangle, Sparkles, RotateCcw } from 'lucide-react';
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
import { exportElementToPdf } from './utils/pdfExport';
import { useResumeGeneration } from './hooks/useResumeGeneration';
import { useUIState } from './hooks/useUIState';
import { AppProvider } from './context/AppContext';

export default function App(): React.ReactElement {
  const [resumeState, resumeActions] = useResumeGeneration();
  const [uiState, uiActions] = useUIState();

  const handleSelectSample = (sample: SampleProfile): void => {
    resumeActions.setTargetJobTitle(sample.targetJobTitle);
    resumeActions.setTargetCompany(sample.targetCompany);
    resumeActions.setTargetJobDescription(sample.targetJobDescription);
    resumeActions.setFullName(sample.rawUserInfo.fullName);
    resumeActions.setEmail(sample.rawUserInfo.email);
    resumeActions.setPhone(sample.rawUserInfo.phone);
    resumeActions.setLocation(sample.rawUserInfo.location);
    resumeActions.setLinkedin(sample.rawUserInfo.linkedin);
    resumeActions.setRawNotes(sample.rawUserInfo.rawNotes);
  };

  const handleExportPdf = async (): Promise<void> => {
    if (!resumeState.resumeData) return;
    uiActions.setExportingPdf(true);
    try {
      if (uiState.activeOutputTab !== 'resume') {
        uiActions.setActiveOutputTab('resume');
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      const candidateName = (resumeState.resumeData.personalInfo.fullName || 'Candidate').replace(/\s+/g, '_');
      const filename = `${candidateName}_ATS_Resume.pdf`;
      await exportElementToPdf({ elementId: 'resume-document', filename, quality: 2 });
      resumeActions.clearNotice();
    } catch (err: any) {
      console.warn('Export PDF notice:', err?.message || err);
    } finally {
      uiActions.setExportingPdf(false);
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const appContextValue = {
    ...resumeState,
    setTargetJobTitle: resumeActions.setTargetJobTitle,
    setTargetCompany: resumeActions.setTargetCompany,
    setTargetJobDescription: resumeActions.setTargetJobDescription,
    setFullName: resumeActions.setFullName,
    setEmail: resumeActions.setEmail,
    setPhone: resumeActions.setPhone,
    setLocation: resumeActions.setLocation,
    setLinkedin: resumeActions.setLinkedin,
    setRawNotes: resumeActions.setRawNotes,
    setLanguage: resumeActions.setLanguage,
    updateResume: resumeActions.updateResume,
  };

  return (
    <AppProvider value={appContextValue}>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans" dir="rtl">
        <Header
          onSelectSample={handleSelectSample}
          onPrint={handlePrint}
          onExportPdf={handleExportPdf}
          isExportingPdf={uiState.isExportingPdf}
          hasGeneratedData={!!resumeState.resumeData}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
          {resumeState.noticeMessage && (
            <div className="no-print p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>{resumeState.noticeMessage}</span>
              </div>
              <button onClick={resumeActions.clearNotice} className="text-indigo-600 hover:text-indigo-900 font-bold px-2 py-1 cursor-pointer">
                إغلاق
              </button>
            </div>
          )}

          {resumeState.errorMessage && (
            <div className="no-print p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{resumeState.errorMessage}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => resumeActions.generate()} disabled={resumeState.isLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة الآن</span>
                </button>
                <button onClick={resumeActions.clearError} className="text-rose-600 hover:text-rose-900 font-bold px-2 py-1 cursor-pointer">إغلاق</button>
              </div>
            </div>
          )}

          <InputSection
            targetJobTitle={resumeState.targetJobTitle}
            setTargetJobTitle={resumeActions.setTargetJobTitle}
            targetCompany={resumeState.targetCompany}
            setTargetCompany={resumeActions.setTargetCompany}
            targetJobDescription={resumeState.targetJobDescription}
            setTargetJobDescription={resumeActions.setTargetJobDescription}
            fullName={resumeState.fullName}
            setFullName={resumeActions.setFullName}
            email={resumeState.email}
            setEmail={resumeActions.setEmail}
            phone={resumeState.phone}
            setPhone={resumeActions.setPhone}
            location={resumeState.location}
            setLocation={resumeActions.setLocation}
            linkedin={resumeState.linkedin}
            setLinkedin={resumeActions.setLinkedin}
            rawNotes={resumeState.rawNotes}
            setRawNotes={resumeActions.setRawNotes}
            language={resumeState.language}
            setLanguage={resumeActions.setLanguage}
            onSubmit={() => resumeActions.generate()}
            isLoading={resumeState.isLoading}
            onExtractKeywordsQuickly={resumeActions.extractKeywordsQuickly}
            isExtractingKeywords={resumeState.isExtractingKeywords}
            quickKeywords={resumeState.quickKeywords}
          />

          <ExecutionStepsProgress isLoading={resumeState.isLoading} />

          {resumeState.resumeData && (
            <section id="output-section" className="space-y-4 pt-2">
              <div className="no-print bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button type="button" onClick={() => uiActions.setActiveOutputTab('resume')} className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${uiState.activeOutputTab === 'resume' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                    <FileText className="w-4 h-4" /><span>1. سيرة ذاتية منسقة (ATS Resume)</span>
                  </button>
                  <button type="button" onClick={() => uiActions.setActiveOutputTab('cover-letter')} className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${uiState.activeOutputTab === 'cover-letter' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                    <Mail className="w-4 h-4" /><span>2. رسالة تغطية مخصصة للشركة</span>
                  </button>
                  <button type="button" onClick={() => uiActions.setActiveOutputTab('ats-review')} className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${uiState.activeOutputTab === 'ats-review' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                    <span>3. مراجعة وتدقيق كلمات ATS</span>
                    {resumeState.atsReviewData && <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{resumeState.atsReviewData.matchScore}%</span>}
                  </button>
                </div>
                <div className="hidden md:flex items-center text-xs text-slate-500 gap-1.5 font-medium pr-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>الترتيب: ملخص | خبرات | مهارات | تعليم</span>
                </div>
              </div>

              {uiState.activeOutputTab === 'resume' && (
                <ResumeView resume={resumeState.resumeData} atsReview={resumeState.atsReviewData} onUpdateResume={resumeActions.updateResume} targetJobTitle={resumeState.targetJobTitle} targetJobDescription={resumeState.targetJobDescription} onPrint={handlePrint} />
              )}
              {uiState.activeOutputTab === 'cover-letter' && resumeState.coverLetterData && (
                <CoverLetterView coverLetter={resumeState.coverLetterData} personalInfo={resumeState.resumeData.personalInfo} onPrint={handlePrint} />
              )}
              {uiState.activeOutputTab === 'ats-review' && resumeState.atsReviewData && (
                <>
                  <AtsReviewCard atsReview={resumeState.atsReviewData} onOpenComparison={() => uiActions.openComparisonSidebar()} onOpenHeatmap={() => uiActions.openHeatmapModal()} />
                  <AtsComparisonSidebar isOpen={uiState.isComparisonSidebarOpen} onClose={() => uiActions.closeComparisonSidebar()} resume={resumeState.resumeData} atsReview={resumeState.atsReviewData} onUpdateResume={resumeActions.updateResume} onNavigateToSection={() => { uiActions.setActiveOutputTab('resume'); uiActions.closeComparisonSidebar(); }} />
                  <KeywordHeatmapModal isOpen={uiState.isHeatmapModalOpen} onClose={() => uiActions.closeHeatmapModal()} resume={resumeState.resumeData} atsReview={resumeState.atsReviewData} targetJobDescription={resumeState.targetJobDescription} onAddSkill={(skillName, category) => {
                    const currentSkills = { ...resumeState.resumeData!.skills };
                    if (category === 'tools') currentSkills.tools = [...(currentSkills.tools || []), skillName];
                    else if (category === 'soft') currentSkills.soft = [...(currentSkills.soft || []), skillName];
                    else currentSkills.technical = [...(currentSkills.technical || []), skillName];
                    resumeActions.updateResume({ ...resumeState.resumeData!, skills: currentSkills });
                  }} onNavigateToSection={() => { uiActions.setActiveOutputTab('resume'); uiActions.closeHeatmapModal(); }} />
                </>
              )}
            </section>
          )}
        </main>

        <JobDescriptionPromptModal isOpen={uiState.isPromptModalOpen} onClose={() => uiActions.closePromptModal()} onSubmit={(desc) => { resumeActions.setTargetJobDescription(desc); uiActions.closePromptModal(); resumeActions.generate(desc); }} />

        <footer className="no-print mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>منصة بناء السيرة الذاتية ورسالة التغطية وفق معايير ATS ومسؤولي التوظيف</span>
            <span className="text-[11px] text-slate-400">أفعال حركة قوية • إنجازات مرقمة • توافق 100% مع أنظمة الفرز الآلي</span>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
