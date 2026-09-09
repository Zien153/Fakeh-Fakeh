import React from 'react';
import { Sparkles, Printer, FileCheck, FileDown, Loader2 } from 'lucide-react';
import { SAMPLE_PROFILES, SampleProfile } from '../data/sampleProfiles';

interface HeaderProps {
  onSelectSample: (sample: SampleProfile) => void;
  onPrint: () => void;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
  hasGeneratedData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectSample,
  onPrint,
  onExportPdf,
  isExportingPdf = false,
  hasGeneratedData,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                منصة بناء السيرة الذاتية الاحترافية
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                مطابقة أنظمة ATS
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              صياغة دقيقة، مؤشرات قياسية، وأفعال قوية لتجاوز الفرز الآلي وإقناع مسؤولي التوظيف
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Preset Profiles dropdown */}
          <div className="relative group">
            <button
              type="button"
              id="btn-sample-profiles"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>نماذج سريعة للتجربة</span>
            </button>
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 hidden group-hover:block z-40">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 mb-1">
                اختر تخصصاً لتعبئة البيانات تلقائياً:
              </div>
              {SAMPLE_PROFILES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  type="button"
                  className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center justify-between"
                >
                  <span>{sample.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">تجربة</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export PDF Button */}
          {hasGeneratedData && onExportPdf && (
            <button
              onClick={onExportPdf}
              disabled={isExportingPdf}
              type="button"
              id="btn-header-export-pdf"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="تصدير السيرة الذاتية بصيغة PDF مباشرة"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">جاري التصدير...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>تصدير PDF</span>
                </>
              )}
            </button>
          )}

          {/* Print/PDF Export Button */}
          {hasGeneratedData && (
            <button
              onClick={onPrint}
              type="button"
              id="btn-print-resume"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="طباعة عبر المتصفح"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
