import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Sparkles, X, FileText } from 'lucide-react';
import { SAMPLE_PROFILES } from '../data/sampleProfiles';

interface JobDescriptionPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
}

export const JobDescriptionPromptModal: React.FC<JobDescriptionPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [descriptionInput, setDescriptionInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (descriptionInput.trim().length >= 15) {
      onSubmit(descriptionInput.trim());
    }
  };

  const handleSelectSampleDesc = (desc: string) => {
    setDescriptionInput(desc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200/80 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900">
                مطلوب: وصف الوظيفة المستهدفة قبل المتابعة
              </h3>
              <p className="text-xs text-amber-750 mt-0.5">
                وفقاً لمعايير ATS، لا يمكن توليد سيرة مخصصة دون فحص الكلمات المفتاحية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-amber-800 hover:text-amber-950 p-1 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            أنظمة الفرز الآلي (ATS) تقارن السيرة الذاتية بمتطلبات الوصف الوظيفي بنسبة تتجاوز 80%. للحصول على نسبة قبول مرتفعة وأفعال قوية متطابقة، يرجى لصق الإعلان الوظيفي أو الوصف المستهدف هنا:
          </p>

          <div>
            <label htmlFor="modal-job-desc" className="block text-xs font-semibold text-slate-700 mb-1.5">
              نص الوصف الوظيفي (المسؤوليات والمهارات المطلوبة):
            </label>
            <textarea
              id="modal-job-desc"
              rows={6}
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="انسخ والصق نص الإعلان الوظيفي هنا (المسؤوليات، المهارات المطلوبة، المؤهلات التقنية)..."
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all placeholder:text-slate-400 font-sans"
              required
            />
          </div>

          {/* Quick presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              أو اختر وصفاً جاهزاً سريعاً:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectSampleDesc(p.targetJobDescription)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={descriptionInput.trim().length < 15}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>متابعة التوليد والمطابقة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
