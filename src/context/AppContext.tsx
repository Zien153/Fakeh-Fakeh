/**
 * Central context for resume generation state
 * Eliminates prop drilling from App.tsx → InputSection → child components
 */

import React, { createContext, useContext } from 'react';
import { ResumeData, CoverLetterData, AtsReviewData } from '@/src/types';

export interface AppContextType {
  // Input states
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

  // Output states
  resumeData: ResumeData | null;
  coverLetterData: CoverLetterData | null;
  atsReviewData: AtsReviewData | null;

  // Setters
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
  updateResume: (updated: ResumeData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ value: AppContextType; children: React.ReactNode }> = ({
  value,
  children,
}) => <AppContext.Provider value={value}>{children}</AppContext.Provider>;

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
