import React, { useState } from 'react';
import { Copy, Check, Printer, Building2, Send, FileText } from 'lucide-react';
import { CoverLetterData, PersonalInfo } from '../types';

interface CoverLetterViewProps {
  coverLetter: CoverLetterData;
  personalInfo: PersonalInfo;
  onPrint: () => void;
}

export const CoverLetterView: React.FC<CoverLetterViewProps> = ({
  coverLetter,
  personalInfo,
  onPrint,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    let text = `${personalInfo.fullName}\n`;
    text += `${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}\n\n`;
    text += `التاريخ: ${coverLetter.date}\n`;
    text += `إلى: ${coverLetter.recipientName}\n`;
    text += `الشركة: ${coverLetter.companyName}\n`;
    text += `الموضوع: التقدم لشغل وظيفة ${coverLetter.jobTitle}\n\n`;
    text += `${coverLetter.greeting}\n\n`;
    text += `${coverLetter.opening}\n\n`;
    coverLetter.bodyParagraphs.forEach((p) => {
      text += `${p}\n\n`;
    });
    text += `${coverLetter.closing}\n\n`;
    text += `${coverLetter.signoff}\n`;
    text += `${personalInfo.fullName}\n`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Action Bar (No print) */}
      <div className="no-print bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            رسالة تغطية مخصصة لشركة: <span className="text-indigo-600">{coverLetter.companyName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>نسخ الرسالة</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة / PDF</span>
          </button>
        </div>
      </div>

      {/* Document Body */}
      <div
        id="cover-letter-document"
        className="page-container mx-auto bg-white p-8 sm:p-12 max-w-3xl rounded-xl border border-slate-300 shadow-md text-slate-800 leading-relaxed font-sans text-xs sm:text-sm"
      >
        {/* Candidate Info */}
        <div className="border-b border-slate-200 pb-4 mb-6 text-center sm:text-right">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
            {personalInfo.fullName}
          </h2>
          <p className="text-xs font-semibold text-indigo-700 mt-0.5">
            {coverLetter.jobTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
            <span>{personalInfo.email}</span>
            <span>•</span>
            <span dir="ltr">{personalInfo.phone}</span>
            <span>•</span>
            <span>{personalInfo.location}</span>
          </div>
        </div>

        {/* Date and Recipient */}
        <div className="space-y-1 mb-6 text-xs text-slate-700">
          <div><span className="font-semibold text-slate-900">التاريخ: </span>{coverLetter.date}</div>
          <div><span className="font-semibold text-slate-900">إلى: </span>{coverLetter.recipientName}</div>
          <div><span className="font-semibold text-slate-900">الشركة: </span>{coverLetter.companyName}</div>
          <div className="pt-2 text-sm font-bold text-slate-900">
            الموضوع: التقدم لشغل وظيفة {coverLetter.jobTitle}
          </div>
        </div>

        {/* Greeting */}
        <p className="font-bold text-slate-900 mb-4">
          {coverLetter.greeting}
        </p>

        {/* Opening */}
        <p className="mb-4 text-justify leading-relaxed">
          {coverLetter.opening}
        </p>

        {/* Body Paragraphs */}
        <div className="space-y-4 mb-6 text-justify leading-relaxed">
          {coverLetter.bodyParagraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {/* Closing */}
        <p className="mb-6 leading-relaxed">
          {coverLetter.closing}
        </p>

        {/* Signoff */}
        <div className="pt-2">
          <p className="font-semibold text-slate-900">{coverLetter.signoff}</p>
          <p className="font-bold text-slate-950 mt-1">{personalInfo.fullName}</p>
        </div>
      </div>
    </div>
  );
};
