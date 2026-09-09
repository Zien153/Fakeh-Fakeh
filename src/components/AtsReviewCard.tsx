import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Zap,
  Filter,
  FileCheck,
  Search,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { AtsReviewData } from '../types';

interface AtsReviewCardProps {
  atsReview: AtsReviewData;
  onOpenComparison?: () => void;
  onOpenHeatmap?: () => void;
}

export const AtsReviewCard: React.FC<AtsReviewCardProps> = ({
  atsReview,
  onOpenComparison,
  onOpenHeatmap,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'matched' | 'missing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKeywords = atsReview.keywords.filter((kw) => {
    if (filterCategory === 'matched' && !kw.foundInResume) return false;
    if (filterCategory === 'missing' && kw.foundInResume) return false;
    if (searchQuery.trim() && !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Side-by-Side Comparison Banner */}
      {onOpenComparison && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-indigo-500/20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <SlidersHorizontal className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  مقارنة السيرة مع توصيات ATS وعرض نقاط التباين
                </h3>
                <span className="text-[10px] font-bold bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  واجهة جانبية للتحسين اليدوي
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تصفح الفروقات ونقاط النقص بين سيرتك وتوصيات الفرز الآلي، مع إمكانية التحسين اليدوي أو التطبيق التلقائي المباشر.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenComparison}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0 ring-2 ring-white/10"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فتح واجهة المقارنة الجانبية</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      )}

      {/* Top Metrics Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 items-center">
          {/* Main Score Circle */}
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-l md:border-slate-200 pb-4 md:pb-0 md:pl-4">
            <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
              <div className="text-center">
                <span className="text-2xl font-black">{atsReview.matchScore}%</span>
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-emerald-100">
                  توافق ATS
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>مطابقة ممتازة</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تجاوز حاجز الـ 80% المطلوب للفرز الآلي الأول في الشركات الكبرى
              </p>
            </div>
          </div>

          {/* Stat 1: Matched Keywords */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>الكلمات المدمجة</span>
              <span className="font-bold text-slate-900">{atsReview.matchedKeywordsCount} / {atsReview.totalKeywords}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((atsReview.matchedKeywordsCount / Math.max(1, atsReview.totalKeywords)) * 100)
                  )}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              نسبة تغطية متطلبات الإعلان
            </span>
          </div>

          {/* Stat 2: Quantified Metrics */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>إنجازات مرقمة ومقاسة</span>
              <span className="font-bold text-emerald-600">{atsReview.quantifiedAchievementsCount} نقاط</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (atsReview.quantifiedAchievementsCount / Math.max(1, atsReview.totalBulletsCount)) * 100
                    )
                  )}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              أرقام ونسب مئوية تثبت القيمة
            </span>
          </div>

          {/* Stat 3: Layout & Summary */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>هيكل قياسي صفحة واحدة</span>
            </div>
            <p className="text-[11px] text-slate-500">
              الملخص: {atsReview.summaryLineCount} أسطر (ضمن الحد الأقصى 4 أسطر)
            </p>
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              متوافق مع معيار الخبرة &lt; 10 سنوات
            </span>
          </div>
        </div>
      </div>

      {/* Rules Compliance Verification Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-indigo-600" />
          <span>التحقق من قواعد الصياغة الصارمة:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">أفعال قوية في البداية</span>
              <span className="text-[11px] text-slate-500">
                (قاد، طوّر، حقق، خفّض، صمم) في كل سطر خبرة
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">تجنب العبارات العامة</span>
              <span className="text-[11px] text-slate-500">
                تم استبعاد أي عبارات إنشائية بلا دليل
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">إجابة سؤال القيمة المضافة</span>
              <span className="text-[11px] text-slate-500">
                كل نقطة تشرح أثر العمل على الأعمال
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">ترتيب الأقسام الإلزامي</span>
              <span className="text-[11px] text-slate-500">
                ملخص | خبرات | مهارات | تعليم
              </span>
            </div>
          </div>
        </div>

        {/* Action Verbs Breakdown */}
        {atsReview.actionVerbsUsed && atsReview.actionVerbsUsed.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              الأفعال القيادية الأكثر استخداماً في سيرتك:
            </span>
            <div className="flex flex-wrap gap-2">
              {atsReview.actionVerbsUsed.map((v, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-indigo-600" />
                  <span>{v.verb}</span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1 rounded-full">
                    ×{v.count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Keywords Audit & Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              قائمة بالكلمات المفتاحية المدمجة لمراجعة ATS
            </h3>
            <p className="text-xs text-slate-500">
              مقارنة الكلمات المستخرجة من الإعلان الوظيفي مع نصوص سيرتك الذاتية
            </p>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenHeatmap && (
              <button
                type="button"
                onClick={onOpenHeatmap}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                title="عرض الخريطة الحرارية لكثافة الكلمات"
              >
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>خريطة التكرار الحرارية</span>
              </button>
            )}

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث عن كلمة..."
                className="text-xs pr-7 pl-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  filterCategory === 'all' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('matched')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  filterCategory === 'matched' ? 'bg-white font-bold text-emerald-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                المطابقة
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('missing')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  filterCategory === 'missing' ? 'bg-white font-bold text-amber-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                المفقودة
              </button>
            </div>
          </div>
        </div>

        {/* Table / List */}
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {filteredKeywords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              لا توجد كلمات مطابقة لمعايير الفلترة الحالية.
            </div>
          ) : (
            filteredKeywords.map((kw, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:px-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {kw.foundInResume ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">
                      {kw.keyword}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {kw.category === 'hard'
                          ? 'مهارة تقنية / صلبة'
                          : kw.category === 'soft'
                          ? 'مهارة قيادية / ناعمة'
                          : kw.category === 'tool'
                          ? 'أداة / نظام'
                          : 'مطلب وظيفي'}
                      </span>
                      {kw.importance === 'high' && (
                        <span className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded">
                          أولوية قصوى
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  {kw.foundInResume ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      مدمجة بنجاح (تكرار: {kw.count})
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      غير مدمجة مباشرة
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ATS Strengths & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {atsReview.atsStrengths && atsReview.atsStrengths.length > 0 && (
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              أبرز نقاط قوة التوافق مع ATS:
            </span>
            <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside">
              {atsReview.atsStrengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {atsReview.atsRecommendations && atsReview.atsRecommendations.length > 0 && (
          <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-200">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-700" />
              توصيات مسؤولي التوظيف والتقديم:
            </span>
            <ul className="space-y-1 text-xs text-indigo-800 list-disc list-inside">
              {atsReview.atsRecommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
