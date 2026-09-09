import React, { useMemo, useState } from 'react';
import {
  Flame,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Maximize2,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { ResumeData, AtsReviewData } from '../types';
import { analyzeResumeKeywordDensity } from '../utils/keywordHeatmapEngine';

interface KeywordHeatmapCardProps {
  resume: ResumeData;
  atsReview?: AtsReviewData | null;
  targetJobDescription?: string;
  onOpenFullHeatmap: () => void;
}

export const KeywordHeatmapCard: React.FC<KeywordHeatmapCardProps> = ({
  resume,
  atsReview,
  targetJobDescription,
  onOpenFullHeatmap,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute keyword analysis
  const analysis = useMemo(() => {
    return analyzeResumeKeywordDensity(resume, atsReview, targetJobDescription);
  }, [resume, atsReview, targetJobDescription]);

  // Top repeated or stuffing risk terms
  const topRepeated = useMemo(() => {
    return analysis.items.slice(0, 8);
  }, [analysis.items]);

  return (
    <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Summary Header */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-50 via-rose-50/20 to-indigo-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                خريطة تكرار الكلمات وكثافة المصطلحات (Heatmap)
              </h3>
              {analysis.overusedCount > 0 ? (
                <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  <span>{analysis.overusedCount} حشو محتمل</span>
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>تنوع مثالي 100%</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              مراقبة الكلمات الزائدة لتفادي الفلترة التلقائية وخفض مخاطر الـ Keyword Stuffing.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onOpenFullHeatmap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="عرض الخريطة الحرارية التفاعلية الموسعة"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>فتح الخريطة الحرارية</span>
            <Maximize2 className="w-3 h-3 opacity-80" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isExpanded ? 'طي الملخص' : 'توسيع الملخص'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Visual Badges Bar */}
      <div className="p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 bg-white">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500">أعلى الكلمات تكراراً:</span>
          {topRepeated.length === 0 ? (
            <span className="text-[11px] text-slate-400">لا توجد كلمات مكررة بشكل ملفت.</span>
          ) : (
            topRepeated.map((item) => {
              const isOverused = item.status === 'overused';
              const isMissing = item.status === 'missing';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={onOpenFullHeatmap}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isOverused
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                      : isMissing
                      ? 'bg-slate-100 text-slate-600 border border-slate-200 border-dashed hover:bg-slate-200'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title={`${item.term}: تكرر ${item.count} مرات (${item.densityPercent}%)`}
                >
                  <span>{item.term}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                      isOverused
                        ? 'bg-rose-600 text-white'
                        : isMissing
                        ? 'bg-slate-400 text-white'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {item.count > 0 ? `×${item.count}` : '0'}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>
            كثافة المفردات: <strong className="text-slate-800">{analysis.densityScore}%</strong>
          </span>
          <span>•</span>
          <span>
            خطر الحشو: <strong className={analysis.stuffingRisk === 'high' ? 'text-rose-600' : 'text-emerald-700'}>{analysis.stuffingRiskLabel}</strong>
          </span>
        </div>
      </div>

      {/* Collapsible Details */}
      {isExpanded && (
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 text-xs space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">تكرار زائد (5+ مرات)</span>
              <span className="text-lg font-black text-rose-600 mt-0.5 block">
                {analysis.overusedCount} كلمات
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                يُنصح باستبدالها بمرادفات متنوعة لتفادي حشو الكلمات.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">تكرار متوازن (2-4 مرات)</span>
              <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                {analysis.optimalCount} كلمات
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                تكرار طبيعي يعزز توافق الكلمة المفتاحية في مسار ATS.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">كلمات الوظيفة المفقودة</span>
              <span className="text-lg font-black text-slate-700 mt-0.5 block">
                {analysis.missingCount} كلمات
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                موجودة بالإعلان وغير مذكورة بسيرتك الذاتية.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              اضغط على زر فتح الخريطة الحرارية للاطلاع على بدائل المرادفات اللغوية لكل مصطلح.
            </span>
            <button
              type="button"
              onClick={onOpenFullHeatmap}
              className="text-xs text-rose-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>فتح خريطة الكلمات الكاملة</span>
              <ArrowRight className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
