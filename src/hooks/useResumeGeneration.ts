import { useState, useCallback } from 'react';
import { ResumeData, CoverLetterData, AtsReviewData, StepsExecutionLog } from '@/src/types';

export interface ResumeGenerationState {
  targetJobTitle: string;
  targetCompany: string;
  targetJobDescription: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  rawNotes: string;
  language: 'ar' | 'en';
  isLoading: boolean;
  errorMessage: string | null;
  noticeMessage: string | null;
  resumeData: ResumeData | null;
  coverLetterData: CoverLetterData | null;
  atsReviewData: AtsReviewData | null;
  stepsLogs: StepsExecutionLog[];
  isExtractingKeywords: boolean;
  quickKeywords: { coreKeywords?: string[]; hardSkills?: string[]; softSkills?: string[] } | null;
}

export interface ResumeGenerationActions {
  // Input setters
  setTargetJobTitle: (value: string) => void;
  setTargetCompany: (value: string) => void;
  setTargetJobDescription: (value: string) => void;
  setFullName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  setLocation: (value: string) => void;
  setLinkedin: (value: string) => void;
  setRawNotes: (value: string) => void;
  setLanguage: (value: 'ar' | 'en') => void;

  // Generation & output
  generate: (explicitJobDesc?: string) => Promise<void>;
  extractKeywordsQuickly: () => Promise<void>;
  clearError: () => void;
  clearNotice: () => void;
  updateResume: (updated: ResumeData) => void;
  resetAll: () => void;
}

const DEFAULT_STATE: ResumeGenerationState = {
  targetJobTitle: '',
  targetCompany: '',
  targetJobDescription: '',
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  rawNotes: '',
  language: 'ar',
  isLoading: false,
  errorMessage: null,
  noticeMessage: null,
  resumeData: null,
  coverLetterData: null,
  atsReviewData: null,
  stepsLogs: [],
  isExtractingKeywords: false,
  quickKeywords: null,
};

/**
 * Custom hook for managing resume generation state and logic
 * Replaces 20+ useState calls in App.tsx
 */
export function useResumeGeneration(): [ResumeGenerationState, ResumeGenerationActions] {
  const [state, setState] = useState<ResumeGenerationState>(DEFAULT_STATE);

  // Input handlers
  const setTargetJobTitle = useCallback(
    (value: string) => setState((prev) => ({ ...prev, targetJobTitle: value })),
    []
  );
  const setTargetCompany = useCallback(
    (value: string) => setState((prev) => ({ ...prev, targetCompany: value })),
    []
  );
  const setTargetJobDescription = useCallback(
    (value: string) => setState((prev) => ({ ...prev, targetJobDescription: value })),
    []
  );
  const setFullName = useCallback(
    (value: string) => setState((prev) => ({ ...prev, fullName: value })),
    []
  );
  const setEmail = useCallback((value: string) => setState((prev) => ({ ...prev, email: value })), []);
  const setPhone = useCallback((value: string) => setState((prev) => ({ ...prev, phone: value })), []);
  const setLocation = useCallback(
    (value: string) => setState((prev) => ({ ...prev, location: value })),
    []
  );
  const setLinkedin = useCallback(
    (value: string) => setState((prev) => ({ ...prev, linkedin: value })),
    []
  );
  const setRawNotes = useCallback(
    (value: string) => setState((prev) => ({ ...prev, rawNotes: value })),
    []
  );
  const setLanguage = useCallback(
    (value: 'ar' | 'en') => setState((prev) => ({ ...prev, language: value })),
    []
  );

  // Generate resume
  const generate = useCallback(
    async (explicitJobDesc?: string) => {
      const jobDesc = explicitJobDesc || state.targetJobDescription;

      if (!jobDesc || jobDesc.trim().length < 15) {
        setState((prev) => ({
          ...prev,
          errorMessage: 'وصف الوظيفة المستهدفة مفقود. يرجى إدخال وصف الوظيفة قبل المتابعة.',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        errorMessage: null,
        noticeMessage: null,
      }));

      try {
        const payload = {
          targetJobTitle: state.targetJobTitle,
          targetCompany: state.targetCompany,
          targetJobDescription: jobDesc,
          language: state.language,
          rawUserInfo: {
            fullName: state.fullName,
            phone: state.phone,
            email: state.email,
            location: state.location,
            linkedin: state.linkedin,
            rawNotes: state.rawNotes,
          },
        };

        const res = await fetch('/api/resume/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'حدث خطأ أثناء معالجة البيانات.');
        }

        setState((prev) => ({
          ...prev,
          resumeData: data.resume,
          coverLetterData: data.coverLetter,
          atsReviewData: data.atsReview,
          stepsLogs: data.stepsLogs || [],
          noticeMessage: data.notice || null,
        }));

        // Smooth scroll to output
        setTimeout(() => {
          const outputElem = document.getElementById('output-section');
          outputElem?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          errorMessage: err.message || 'تعذر استكمال المعالجة. يرجى المحاولة مرة أخرى.',
        }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state.targetJobTitle, state.targetCompany, state.targetJobDescription, state.language, state.fullName, state.phone, state.email, state.location, state.linkedin, state.rawNotes]
  );

  // Extract keywords
  const extractKeywordsQuickly = useCallback(async () => {
    if (!state.targetJobDescription || state.targetJobDescription.trim().length < 15) {
      setState((prev) => ({
        ...prev,
        errorMessage: 'وصف الوظيفة المستهدفة مفقود.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isExtractingKeywords: true }));
    try {
      const res = await fetch('/api/resume/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetJobDescription: state.targetJobDescription }),
      });
      const data = await res.json();
      if (data.success) {
        setState((prev) => ({
          ...prev,
          quickKeywords: {
            coreKeywords: data.coreKeywords,
            hardSkills: data.hardSkills,
            softSkills: data.softSkills,
          },
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setState((prev) => ({ ...prev, isExtractingKeywords: false }));
    }
  }, [state.targetJobDescription]);

  // Utility functions
  const clearError = useCallback(
    () => setState((prev) => ({ ...prev, errorMessage: null })),
    []
  );
  const clearNotice = useCallback(
    () => setState((prev) => ({ ...prev, noticeMessage: null })),
    []
  );
  const updateResume = useCallback(
    (updated: ResumeData) => setState((prev) => ({ ...prev, resumeData: updated })),
    []
  );
  const resetAll = useCallback(() => setState(DEFAULT_STATE), []);

  const actions: ResumeGenerationActions = {
    setTargetJobTitle,
    setTargetCompany,
    setTargetJobDescription,
    setFullName,
    setEmail,
    setPhone,
    setLocation,
    setLinkedin,
    setRawNotes,
    setLanguage,
    generate,
    extractKeywordsQuickly,
    clearError,
    clearNotice,
    updateResume,
    resetAll,
  };

  return [state, actions];
}
