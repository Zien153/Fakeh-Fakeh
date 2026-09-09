import React, { useState } from 'react';
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Wand2,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { ExperienceItem, ResumeData } from '../types';
import {
  analyzeExperienceVerbs,
  replaceWeakVerbInBullet,
  VerbMatch,
} from '../utils/verbAnalyzer';

interface ActionVerbsAuditCardProps {
  resume: ResumeData;
  onUpdateResume?: (updated: ResumeData) => void;
  targetJobTitle?: string;
  targetJobDescription?: string;
  highlightEnabled: boolean;
  onToggleHighlight: (enabled: boolean) => void;
}

export const ActionVerbsAuditCard: React.FC<ActionVerbsAuditCardProps> = ({
  resume,
  onUpdateResume,
  targetJobTitle,
  targetJobDescription,
  highlightEnabled,
  onToggleHighlight,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const analysis = analyzeExperienceVerbs(resume.experiences);

  // Handle instant verb replacement
  const handleApplyAlternative = (
    expIndex: number,
    bulletIndex: number,
    weakMatch: VerbMatch,
    newVerb: string
  ) => {
    if (!onUpdateResume) return;
    const experiencesCopy = [...resume.experiences];
    const originalBullet = experiencesCopy[expIndex].bullets[bulletIndex];
    const updatedBullet = replaceWeakVerbInBullet(originalBullet, weakMatch, newVerb);

    experiencesCopy[expIndex] = {
      ...experiencesCopy[expIndex],
      bullets: experiencesCopy[expIndex].bullets.map((b, idx) =>
        idx === bulletIndex ? updatedBullet : b
      ),
    };

    onUpdateResume({
      ...resume,
      experiences: experiencesCopy,
    });

    setSuccessNotice(`تم استبدال "${weakMatch.matchedText}" بـ "${newVerb}" بنجاح!`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Handle AI rephrasing of the entire bullet
  const handleAiRephrase = async (
    expIndex: number,
    bulletIndex: number,
    bulletText: string
  ) => {
    const key = `${expIndex}-${bulletIndex}`;
    setImprovingKey(key);
    try {
      const res = await fetch('/api/resume/improve-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText,
          targetJobTitle,
          targetJobDescription,
        }),
      });
      const data = await res.json();
      if (data.success && data.improvedBullet && onUpdateResume) {
        const experiencesCopy = [...resume.experiences];
        experiencesCopy[expIndex] = {
          ...experiencesCopy[expIndex],
          bullets: experiencesCopy[expIndex].bullets.map((b, idx) =>
            idx === bulletIndex ? data.improvedBullet : b
          ),
        };
        onUpdateResume({
          ...resume,
          experiences: experiencesCopy,
        });
        setSuccessNotice('تمت إعادة صياغة النقطة بالذكاء الاصطناعي مع فعل قيادي وأرقام إنجاز!');
        setTimeout(() => setSuccessNotice(null), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImprovingKey(null);
    }
  };

  return (
    <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all mb-4">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-l from-slate-50 via-white to-slate-50 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              analysis.weakVerbsCount > 0
                ? 'bg-amber-100 text-amber-700 ring-4 ring-amber-50'
                : 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50'
            }`}
          >
            {analysis.weakVerbsCount > 0 ? (
              <Zap className="w-5 h-5 text-amber-600 fill-amber-500/20" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                محلل الأفعال الحركية والقيادية (Action Verbs Audit)
              </h3>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  analysis.weakVerbsCount === 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {analysis.weakVerbsCount === 0
                  ? 'سيرة قوية ومؤثرة'
                  : `${analysis.weakVerbsCount} أفعال ضعيفة بحاجة لبدائل`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              فحص جودة أفعال الخبرات المهنية وفق معايير التوظيف العالمية لتجنب الأفعال السلبية والروتينية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Highlight Toggle Switch */}
          <button
            type="button"
            onClick={() => onToggleHighlight(!highlightEnabled)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              highlightEnabled
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${highlightEnabled ? 'bg-indigo-600' : 'bg-slate-400'}`} />
            <span>{highlightEnabled ? 'إخفاء التلوين' : 'تلوين الأفعال في السيرة'}</span>
          </button>

          {/* Expand Details Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض البدائل والتفاصيل'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-4 bg-slate-50/70 border-b border-slate-100 text-center">
        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] text-slate-500 block mb-0.5">مؤشر قوة الأفعال</span>
          <span
            className={`text-lg font-black ${
              analysis.powerScore >= 80
                ? 'text-emerald-600'
                : analysis.powerScore >= 60
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}
          >
            {analysis.powerScore}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            التقييم: <strong className="text-slate-700">{analysis.grade}</strong>
          </span>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] text-slate-500 block mb-0.5">أفعال قوية مستخدمة</span>
          <span className="text-lg font-black text-indigo-600">
            {analysis.strongVerbsCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">أفعال قيادية وإنجازية</span>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] text-slate-500 block mb-0.5">أفعال ضعيفة مرصودة</span>
          <span
            className={`text-lg font-black ${
              analysis.weakVerbsCount > 0 ? 'text-amber-600' : 'text-slate-400'
            }`}
          >
            {analysis.weakVerbsCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {analysis.weakVerbsCount > 0 ? 'تستدعي الاستبدال' : 'خالية تماماً'}
          </span>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] text-slate-500 block mb-0.5">إجمالي نقاط الخبرة</span>
          <span className="text-lg font-black text-slate-800">
            {analysis.totalBullets}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">نقاط مهنية مفحوصة</span>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Recruitment Standard Explanation */}
          <div className="bg-indigo-50/70 rounded-xl p-4 border border-indigo-200/70 text-xs text-indigo-950">
            <div className="flex items-center gap-2 font-bold mb-1 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>معايير مسؤولي التوظيف وخوارزميات ATS للأفعال:</span>
            </div>
            <p className="leading-relaxed text-indigo-900/90">
              يبحث مسؤولو التوظيف وأنظمة الفحص الآلي عن أفعال قوية تدل على المبادرة (مثل: <strong>طوّر، قاد، صمم، أدار، حقق، وفّر</strong>) في مستهل كل نقطة، لأنها تثبت امتلاكك لزمام المبادرة والنتيجة. في المقابل، تضعف الأفعال الروتينية (مثل: <strong>ساعد في، عمل على، كان مسؤولاً عن، شارك في</strong>) من وقع سيرتك الذاتية وتجعل إنجازك يبدو ثانوياً أو غير محدد.
            </p>
          </div>

          {/* Detected Weak Verbs with One-Click Replacement */}
          {analysis.weakOccurrences.length > 0 ? (
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>الأفعال الضعيفة المرصودة والبدائل المقترحة فورياً:</span>
              </h4>

              <div className="space-y-3">
                {analysis.weakOccurrences.map((occ, idx) => {
                  const key = `${occ.expIndex}-${occ.bulletIndex}`;
                  const isImproving = improvingKey === key;

                  return (
                    <div
                      key={idx}
                      className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-3 transition-all hover:bg-amber-50/70"
                    >
                      {/* Context & Location */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{occ.expCompany}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{occ.expTitle}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md self-start sm:self-auto">
                          تصنيف الضعف: {occ.match.category}
                        </span>
                      </div>

                      {/* Current Bullet with Highlight */}
                      <div className="text-xs sm:text-sm text-slate-800 bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-500 font-semibold ml-1">النص الحالي:</span>
                        <span className="bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded border border-amber-400 ml-1">
                          {occ.match.matchedText}
                        </span>
                        <span>{occ.bulletText.slice(occ.match.endIndex)}</span>
                      </div>

                      {/* Why it's weak */}
                      {occ.match.reason && (
                        <p className="text-[11px] text-amber-900/90 leading-relaxed flex items-start gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span><strong>لماذا يُعد ضعيفاً:</strong> {occ.match.reason}</span>
                        </p>
                      )}

                      {/* Recommended Alternatives */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                          اختر بديلاً قوياً ومؤثراً للاستبدال الفوري بنقرة واحدة:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {occ.match.alternatives.map((alt, altIdx) => (
                            <button
                              key={altIdx}
                              type="button"
                              onClick={() =>
                                handleApplyAlternative(
                                  occ.expIndex,
                                  occ.bulletIndex,
                                  occ.match,
                                  alt.verb
                                )
                              }
                              className="group inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 bg-white hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg shadow-2xs transition-all cursor-pointer"
                              title={alt.contextHint}
                            >
                              <ArrowLeftRight className="w-3 h-3 text-indigo-500 group-hover:text-white transition-colors" />
                              <span>{alt.verb}</span>
                              <span className="text-[10px] opacity-75 font-normal">({alt.category})</span>
                            </button>
                          ))}

                          {/* AI Rewrite option */}
                          <button
                            type="button"
                            onClick={() =>
                              handleAiRephrase(occ.expIndex, occ.bulletIndex, occ.bulletText)
                            }
                            disabled={isImproving}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer mr-auto"
                          >
                            <Wand2 className={`w-3.5 h-3.5 ${isImproving ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                            <span>{isImproving ? 'جاري الصياغة...' : 'إعادة صياغة ذكية بالكامل'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-emerald-950">
                ممتاز! لا توجد أي أفعال ضعيفة أو سلبية في سيرتك الذاتية
              </h4>
              <p className="text-xs text-emerald-800 max-w-lg mx-auto">
                كافة نقاط الخبرة تبدأ بأفعال حركية قوية ومباشرة تدل على القيادة، التطوير، والتأثير القياسي وفق أفضل معايير أنظمة ATS.
              </p>
              {onUpdateResume && resume.experiences.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newExps = [...resume.experiences];
                      newExps[0] = {
                        ...newExps[0],
                        bullets: [
                          `ساعد في تطوير وتحسين معايير الجودة التقنية، مما قلص الأخطاء التشغيلية بنسبة 25%.`,
                          ...newExps[0].bullets,
                        ],
                      };
                      onUpdateResume({ ...resume, experiences: newExps });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>إضافة نقطة تجريبية تحتوي على «فعل ضعيف» لاختبار الكشف والاستبدال الفوري</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Strong Verbs Currently Utilized */}
          {analysis.strongVerbsList.length > 0 && (
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>أبرز الأفعال القوية المستخدمة حالياً في سيرتك:</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.strongVerbsList.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80 px-2.5 py-1 rounded-lg"
                  >
                    <span>{item.verb}</span>
                    <span className="text-[10px] bg-indigo-200/70 text-indigo-900 px-1.5 py-0.2 rounded-full font-bold">
                      {item.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
