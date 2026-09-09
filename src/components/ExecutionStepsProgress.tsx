import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ExecutionStepsProgressProps {
  isLoading: boolean;
}

const STEPS = [
  {
    step: 1,
    title: 'استخراج الكلمات المفتاحية من وصف الوظيفة المستهدفة',
    detail: 'تحليل المهارات الصلبة والناعمة والأدوات ومتطلبات الفحص الآلي (ATS).',
  },
  {
    step: 2,
    title: 'إعادة صياغة خبرات المستخدم بلغة تتوافق مع تلك الكلمات',
    detail: 'تضمين الكلمات المفتاحية بشكل متناسق وطبيعي لتجاوز خوارزميات الفرز.',
  },
  {
    step: 3,
    title: 'حساب الإنجازات بأرقام ونسب قابلة للقياس (Quantifiable Metrics)',
    detail: 'تحويل المهام الوصفية العادية إلى نسب مئوية، أرقام توفير، ونمو فعلي.',
  },
  {
    step: 4,
    title: 'ترتيب الأقسام حسب أولوية الوظيفة المستهدفة',
    detail: 'اعتماد تسلسل القياس القياسي: ملخص | خبرات | مهارات | تعليم.',
  },
  {
    step: 5,
    title: 'كتابة ملخص مهني لا يتجاوز 4 أسطر يجمع أبرز نقاط القوة',
    detail: 'صياغة فقرة افتتاحية مكثفة تجيب مباشرة على: "ما القيمة التي أضفتها؟".',
  },
];

export const ExecutionStepsProgress: React.FC<ExecutionStepsProgressProps> = ({ isLoading }) => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!isLoading) {
      setActiveStep(1);
      return;
    }

    // Simulate progressive step highlight while backend generates
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 1400);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-lg p-6 my-6 no-print animate-in fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            جاري تطبيق مراحل معالجة السيرة الذاتية (وفق البروتوكول الإلزامي)
          </h3>
          <p className="text-xs text-slate-500">
            تتم المعالجة عبر 5 خطوات متتابعة لضمان التوافق المطلق مع أنظمة ATS
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {STEPS.map((item) => {
          const isDone = item.step < activeStep;
          const isCurrent = item.step === activeStep;

          return (
            <div
              key={item.step}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-100/70'
                  : isDone
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-slate-400 text-[10px] font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    الخطوة {item.step}: {item.title}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded font-semibold animate-pulse">
                      قيد التنفيذ...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                      مكتملة
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
