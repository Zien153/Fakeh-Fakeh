import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  FileText,
  Sparkles,
  User,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';

interface InputSectionProps {
  targetJobTitle: string;
  setTargetJobTitle: (val: string) => void;
  targetCompany: string;
  setTargetCompany: (val: string) => void;
  targetJobDescription: string;
  setTargetJobDescription: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  linkedin: string;
  setLinkedin: (val: string) => void;
  rawNotes: string;
  setRawNotes: (val: string) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  onSubmit: () => void;
  isLoading: boolean;
  onExtractKeywordsQuickly?: () => void;
  isExtractingKeywords?: boolean;
  quickKeywords?: {
    coreKeywords?: string[];
    hardSkills?: string[];
    softSkills?: string[];
  } | null;
}

export const InputSection: React.FC<InputSectionProps> = ({
  targetJobTitle,
  setTargetJobTitle,
  targetCompany,
  setTargetCompany,
  targetJobDescription,
  setTargetJobDescription,
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  location,
  setLocation,
  linkedin,
  setLinkedin,
  rawNotes,
  setRawNotes,
  language,
  setLanguage,
  onSubmit,
  isLoading,
  onExtractKeywordsQuickly,
  isExtractingKeywords,
  quickKeywords,
}) => {
  const [showAdvancedContact, setShowAdvancedContact] = useState(false);

  const hasJobDescription = targetJobDescription.trim().length >= 15;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden no-print">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2">
              <Cpu className="w-3.5 h-3.5 text-indigo-300" />
              <span>معالج الذكاء الاصطناعي لمطابقة أنظمة ATS</span>
            </div>
            <h2 className="text-xl font-bold">إدخال البيانات والوصف الوظيفي</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              أدخل وصف الوظيفة المستهدفة وخبراتك الخام ليقوم النظام باستخراج الكلمات المفتاحية وصياغة الإنجازات رقمياً
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                language === 'ar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              العربية (RTL)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Step 1 Requirement: Target Job & Mandatory Job Description */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                الوظيفة المستهدفة والوصف الوظيفي (إلزامي لمطابقة ATS)
              </h3>
            </div>
            {!hasJobDescription && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                الوصف مطلوب قبل المتابعة
              </span>
            )}
            {hasJobDescription && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                جاهز للمطابقة
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="target-job-title" className="block text-xs font-medium text-slate-700 mb-1">
                المسمى الوظيفي المستهدف:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  id="target-job-title"
                  type="text"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  placeholder="مثال: Senior Software Engineer أو مدير تسويق رقمي"
                  className="w-full pr-9 pl-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden transition-all placeholder:text-slate-400 font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="target-company" className="block text-xs font-medium text-slate-700 mb-1">
                اسم الشركة المحددة (لتخصيص رسالة التغطية):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  id="target-company"
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="مثال: شركة علم، أرامكو، نون، جاهز، أمازون..."
                  className="w-full pr-9 pl-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden transition-all placeholder:text-slate-400 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="target-job-description" className="block text-xs font-bold text-slate-800">
                نص الوصف الوظيفي المستهدف <span className="text-rose-700 font-normal">* (إلزامي)</span>
              </label>
              {onExtractKeywordsQuickly && hasJobDescription && (
                <button
                  type="button"
                  onClick={onExtractKeywordsQuickly}
                  disabled={isExtractingKeywords}
                  className="text-xs text-indigo-700 hover:text-indigo-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isExtractingKeywords ? 'جاري الاستخراج...' : 'فحص الكلمات المفتاحية فوراً'}</span>
                </button>
              )}
            </div>
            <textarea
              id="target-job-description"
              rows={5}
              value={targetJobDescription}
              onChange={(e) => setTargetJobDescription(e.target.value)}
              placeholder="الصق هنا الإعلان الوظيفي أو الوصف الكامل (المسؤوليات، المهارات والتقنيات المطلوبة). سيستخرج الذكاء الاصطناعي الكلمات المفتاحية منها لإعادة صياغة خبراتك بما يتطابق معها..."
              className={`w-full p-3 text-xs sm:text-sm border rounded-xl focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all placeholder:text-slate-400 font-sans ${
                hasJobDescription
                  ? 'border-slate-300 focus:border-indigo-500 bg-white'
                  : 'border-amber-300 bg-amber-50/20 focus:border-amber-500'
              }`}
            />
          </div>

          {/* Quick Extracted Keywords Preview if triggered */}
          {quickKeywords && (quickKeywords.coreKeywords?.length || quickKeywords.hardSkills?.length) ? (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-2">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                الكلمات المفتاحية المستخرجة التي سيتم دمجها في السيرة:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickKeywords.coreKeywords?.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-800 rounded-md font-medium">
                    {kw}
                  </span>
                ))}
                {quickKeywords.hardSkills?.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <hr className="border-slate-200" />

        {/* Step 2 Requirement: User Raw Experience and Notes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                معلومات وخبرات المستخدم الخام (Raw Experience & Notes)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedContact(!showAdvancedContact)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{showAdvancedContact ? 'إخفاء بيانات الاتصال' : 'بيانات الاتصال والموقع'}</span>
              {showAdvancedContact ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Contact Details (Collapsible or visible) */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ${showAdvancedContact ? 'block' : 'hidden sm:grid'}`}>
            <div>
              <label htmlFor="full-name" className="block text-xs font-medium text-slate-700 mb-1">
                الاسم الكامل:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله الغامدي"
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="user-phone" className="block text-xs font-medium text-slate-700 mb-1">
                رقم الهاتف:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="user-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5x xxx xxxx"
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="user-email" className="block text-xs font-medium text-slate-700 mb-1">
                البريد الإلكتروني:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="user-location" className="block text-xs font-medium text-slate-700 mb-1">
                المدينة والدولة:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="user-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="الرياض، المملكة العربية السعودية"
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden font-sans"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="user-linkedin" className="block text-xs font-medium text-slate-700 mb-1">
                رابط LinkedIn أو المعرض المهني:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Linkedin className="w-4 h-4" />
                </div>
                <input
                  id="user-linkedin"
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden font-sans"
                />
              </div>
            </div>
          </div>

          {/* Raw Text Notes Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="user-raw-notes" className="block text-xs font-bold text-slate-800">
                سرد الخبرات والمهام والتعليم بصيغة حرة أو نقاط أولية:
              </label>
              <span className="text-[11px] text-slate-500">
                لا تشغل بالك بالتنسيق، سيقوم النظام بإعادة الصياغة الاحترافية
              </span>
            </div>
            <textarea
              id="user-raw-notes"
              rows={7}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="اكتب أو الصق هنا كل ما تملكه من خبرات:
- الشركات السابقة والمشاريع التي عملت عليها
- المهام اليومية والتقنيات التي استخدمتها
- أي نتائج أو نجاحات حققتها حتى لو كانت عفوية
- شهادتك الجامعية والدورات التدريبية والمهارات

سيقوم الذكاء الاصطناعي بحساب الأرقام، وتطبيق أفعال قوية (قاد، طوّر، حقق، خفّض)، وحذف العبارات العامة."
              className="w-full p-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-hidden transition-all placeholder:text-slate-400 font-sans"
            />
          </div>
        </div>

        {/* Submit Execution Button */}
        <div className="pt-2">
          <button
            type="button"
            id="btn-generate-resume"
            onClick={onSubmit}
            disabled={isLoading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-800 hover:to-indigo-900 text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري معالجة الكلمات المفتاحية وبناء السيرة ورسالة التغطية...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span>تحويل المعلومات الخام إلى سيرة ذاتية ورسالة تغطية (مطابقة ATS)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
