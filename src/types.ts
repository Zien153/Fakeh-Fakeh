export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: string[];
  matchedKeywords?: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  graduationYear: string;
  details?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface SkillCategory {
  technical: string[];
  soft: string[];
  tools: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  sectionOrder: ('summary' | 'experience' | 'skills' | 'education' | 'certifications')[];
  experiences: ExperienceItem[];
  skills: SkillCategory;
  education: EducationItem[];
  certifications?: CertificationItem[];
  languages?: string[];
}

export interface CoverLetterData {
  companyName: string;
  jobTitle: string;
  recipientName: string;
  date: string;
  greeting: string;
  opening: string;
  bodyParagraphs: string[];
  closing: string;
  signoff: string;
}

export interface ExtractedKeyword {
  keyword: string;
  category: 'hard' | 'soft' | 'tool' | 'general';
  importance: 'high' | 'medium';
  foundInResume: boolean;
  count: number;
}

export interface ActionVerbStat {
  verb: string;
  count: number;
}

export interface AtsReviewData {
  matchScore: number; // 0 - 100
  totalKeywords: number;
  matchedKeywordsCount: number;
  keywords: ExtractedKeyword[];
  missingKeywords: string[];
  actionVerbsUsed: ActionVerbStat[];
  quantifiedAchievementsCount: number;
  totalBulletsCount: number;
  summaryLineCount: number;
  singlePageEstimated: boolean;
  atsStrengths: string[];
  atsRecommendations: string[];
}

export interface StepsExecutionLog {
  step: number;
  title: string;
  description: string;
  status: 'completed' | 'running' | 'pending';
}

export interface GenerateResumeResponse {
  success: boolean;
  missingJobDescription?: boolean;
  message?: string;
  resume?: ResumeData;
  coverLetter?: CoverLetterData;
  atsReview?: AtsReviewData;
  stepsLogs?: StepsExecutionLog[];
}
