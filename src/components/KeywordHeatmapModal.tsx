import React, { useState, useMemo } from 'react';
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  Copy,
  Check,
  Eye,
  Info,
} from 'lucide-react';
import { ResumeData, AtsReviewData } from '../types';
import {
  analyzeResumeKeywordDensity,
  KeywordHeatmapItem,
  KeywordStatus,
} from '../utils/keywordHeatmapEngine';

interface KeywordHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  atsReview?: AtsReviewData | null;
  targetJobDescription?: string;
  onApplySynonym?: (targetExpIndex: number, targetBulletIndex: number, oldWord: string, newWord: string) => void;
  onAddSkill?: (skillName: string, category: 'technical' | 'tools' | 'soft') => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export const KeywordHeatmapModal: React.FC<KeywordHeatmapModalProps> = ({
  isOpen,
  onClose,
  resume,
  atsReview,
  targetJobDescription,
  onApplySynonym,
  onAddSkill,
  onNavigateToSection,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | KeywordStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<KeywordHeatmapItem | null>(null);
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'density-bars' | 'insights'>('grid');

  // Compute heatmap data
  const heatmapData = useMemo(() => {
    return analyzeResumeKeywordDensity(resume, atsReview, targetJobDescription);
  }, [resume, atsReview, targetJobDescription]);

  // Filter items
  const filteredItems = useMemo(() => {
    return heatmapData.items.filter((item) => {
      if (selectedCategory !== 'all' && item.status !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() && !item.term.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false;
      }
      return true;
    });
  }, [heatmapData.items, selectedCategory, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTerm(text);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  if (!isOpen) return null;

  // Visual Heatmap Intensity Helpers
  const getTileStyles = (item: KeywordHeatmapItem) => {
    switch (item.status) {
      case 'overused':
        return {
          bg: 'bg-rose-50 hover:bg-rose-100/90 text-rose-950 border-rose-300 shadow-2xs ring-1 ring-rose-400/30',
          badge: 'bg-rose-600 text-white',
          dot: 'bg-rose-500',
          bar: 'bg-rose-500',
          label: 'حشو زائد',
        };
      case 'optimal':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 border-emerald-300 shadow-2xs',
          badge: 'bg-emerald-600 text-white',
          dot: 'bg-emerald-500',
          bar: 'bg-emerald-500',
          label: 'تكرار مثالي',
        };
      case 'low':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100/90 text-amber-950 border-amber-300 shadow-2xs',
          badge: 'bg-amber-600 text-white',
          dot: 'bg-amber-500',
          bar: 'bg-amber-400',
          label: 'ذكر خفيف',
        };
      case 'missing':
        return {
          bg: 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 border-dashed border-slate-300',
          badge: 'bg-slate-500 text-white',
          dot: 'bg-slate-400',
          bar: 'bg-slate-300',
          label: 'مفقود بالكامل',
        };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  الخريطة الحرارية لكثافة الكلمات المفتاحية
                </h2>
                <span className="text-[11px] font-bold bg-rose-500/20 border border-rose-400/40 text-rose-200 px-2 py-0.5 rounded-full">
                  مكافحة حشو الكلمات وتوزيع المفردات
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                فحص إحصائي لتكرار كل مصطلح داخل سيرتك لتجنب الحشو الآلي (Keyword Stuffing) واقتراح بدائل غنية ومتنوعة.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            ✕
          </button>
        </div>

        {/* Diagnostic Stat Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          {/* Metric 1: Stuffing Risk */}
          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">مؤشر خطر الحشو (Stuffing)</span>
            <div className="flex items-center gap-1.5 mt-1">
              {heatmapData.stuffingRisk === 'high' ? (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              ) : heatmapData.stuffingRisk === 'moderate' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span
                className={`text-xs sm:text-sm font-bold ${
                  heatmapData.stuffingRisk === 'high'
                    ? 'text-rose-700'
                    : heatmapData.stuffingRisk === 'moderate'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {heatmapData.stuffingRiskLabel}
              </span>
            </div>
          </div>

          {/* Metric 2: Density Score */}
          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">صحة التوزيع اللغوي</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-slate-900">{heatmapData.densityScore}%</span>
              <span className="text-[11px] text-slate-400 font-medium">
                {heatmapData.densityScore >= 80 ? 'توزيع متوازن ومقنع' : 'يحتاج لتنويع المرادفات'}
              </span>
            </div>
          </div>

          {/* Metric 3: Total Words & Vocabulary */}
          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">إجمالي كلمات السيرة</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-slate-900">{heatmapData.totalWords}</span>
              <span className="text-[11px] text-slate-500 font-medium">
                ({heatmapData.uniqueTermsAnalyzed} مصطلحاً مختلفاً)
              </span>
            </div>
          </div>

          {/* Metric 4: Overused vs Optimal vs Missing */}
          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">حالة المصطلحات</span>
              <div className="flex items-center gap-2 mt-1 text-xs font-bold">
                <span className="text-rose-600">{heatmapData.overusedCount} حشو</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600">{heatmapData.optimalCount} مثالي</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{heatmapData.missingCount} مفقود</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-3 sm:px-5 sm:py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              الكل ({heatmapData.items.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('overused')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                selectedCategory === 'overused'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>مكررة بإفراط ({heatmapData.overusedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('optimal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                selectedCategory === 'optimal'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تكرار مثالي ({heatmapData.optimalCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('missing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                selectedCategory === 'missing'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <span>مفقودة من الوظيفة ({heatmapData.missingCount})</span>
            </button>
          </div>

          {/* Search box & View Switch */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن كلمة معينة..."
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('grid')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeTab === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                خريطة حرارية
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('density-bars')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeTab === 'density-bars' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مخطط الكثافة
              </button>
            </div>
          </div>
        </div>

        {/* Content Area: Main Heatmap Body + Details Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-50/50">
          {/* Main Visualizer (Cols 7 or 8) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Guide strip */}
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">معيار أنظمة ATS لتكرار المصطلحات:</span> التكرار الموصى به للمصطلح هو بين 2 إلى 4 مرات فقط. التكرار 5 مرات فأكثر يُصنف غالباً كـ "حشو آلي ركيك"، بينما يؤدي تنويع المصطلحات إلى زيادة شمولية الفرز وخلق انطباع احترافي لدى لجان المقابلة.
              </div>
            </div>

            {/* TAB 1: Heatmap Cloud / Grid */}
            {activeTab === 'grid' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>سحابة الكثافة والتكرار (اضغط على أي كلمة لعرض مرادفاتها ومواقعها)</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    عرض {filteredItems.length} كلمة
                  </span>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    لم يتم العثور على كلمات مفتاحية تطابق خيارات الفلترة الحالية.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {filteredItems.map((item) => {
                      const style = getTileStyles(item);
                      const isSelected = selectedItem?.id === item.id;

                      // Size calculation based on repetition count
                      const fontSize =
                        item.count >= 6
                          ? 'text-sm font-black'
                          : item.count >= 4
                          ? 'text-xs font-bold'
                          : 'text-xs font-semibold';

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-right ${
                            style.bg
                          } ${
                            isSelected
                              ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-md scale-102'
                              : ''
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          <span className={fontSize}>{item.term}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${style.badge}`}
                          >
                            {item.count > 0 ? `×${item.count}` : '0'}
                          </span>
                          {item.densityPercent > 0 && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              {item.densityPercent}%
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Density Bars */}
            {activeTab === 'density-bars' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-700">
                    قائمة الكلمات مرتبة بحسب الكثافة ونسبة التكرار
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    الحد الموصى به: أقل من 2.5% للمصطلح
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {filteredItems.map((item) => {
                    const style = getTileStyles(item);
                    const isSelected = selectedItem?.id === item.id;
                    const barWidth = Math.min(100, Math.max(8, item.densityPercent * 25));

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-400 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.term}</span>
                            <span className="text-[10px] text-slate-500">({item.categoryLabel})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-600">
                              {item.count} مرات
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${style.badge}`}
                            >
                              {item.densityPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Visual Bar */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full rounded-full transition-all ${style.bar}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details & Action Panel (Cols 5 or 4) */}
          <div className="lg:col-span-5 xl:col-span-4">
            {selectedItem ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 sticky top-0 animate-in fade-in">
                {/* Header */}
                <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900">
                        {selectedItem.term}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          getTileStyles(selectedItem).badge
                        }`}
                      >
                        {selectedItem.statusLabel}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      {selectedItem.categoryLabel} • {selectedItem.count} تكرارات (كثافة {selectedItem.densityPercent}%)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(selectedItem.term)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="نسخ المصطلح"
                  >
                    {copiedTerm === selectedItem.term ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Analysis Recommendation */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-700">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>توصية التنوع اللغوي:</span>
                  </div>
                  {selectedItem.recommendation}
                </div>

                {/* Synonym / Diversity Alternatives */}
                {selectedItem.synonymsOrAlternatives && selectedItem.synonymsOrAlternatives.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      بدائل ومرادفات غنية لتنويع الصياغة:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.synonymsOrAlternatives.map((alt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCopy(alt)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-all cursor-pointer font-medium"
                          title="اضغط لنسخ البديل"
                        >
                          <span>{alt}</span>
                          <Copy className="w-2.5 h-2.5 text-indigo-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Occurrences in Resume */}
                {selectedItem.occurrences && selectedItem.occurrences.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block">
                      مواقع ظهور الكلمة داخل السيرة ({selectedItem.occurrences.length}):
                    </span>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {selectedItem.occurrences.map((occ, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>{occ.sectionLabel}</span>
                            {onNavigateToSection && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToSection(
                                    occ.section === 'summary'
                                      ? 'resume-summary'
                                      : occ.section === 'skills'
                                      ? 'resume-skills'
                                      : 'resume-experiences'
                                  );
                                  onClose();
                                }}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>انتقال</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                            {occ.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Add to Skills if Missing */}
                {selectedItem.status === 'missing' && onAddSkill && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        const cat =
                          selectedItem.category === 'tool'
                            ? 'tools'
                            : selectedItem.category === 'soft'
                            ? 'soft'
                            : 'technical';
                        onAddSkill(selectedItem.term, cat);
                        setSelectedItem({
                          ...selectedItem,
                          status: 'optimal',
                          statusLabel: 'تمت الإضافة بنجاح',
                          count: 1,
                        });
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>إضافة الكلمة إلى قسم المهارات فوراً</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs space-y-2 sticky top-0">
                <Flame className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">حدد أي مصطلح من الخريطة لعرض تفاصيله</p>
                <p className="text-[11px] leading-relaxed">
                  ستظهر لك هنا اقتراحات المرادفات البديلة لتقليل الحشو، بالإضافة إلى الجمل والفقرات التي تكررت فيها الكلمة مع إمكانية الانتقال المباشر.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> مكررة (5+)
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> مثالية (2-4)
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> ذكر خفيف (1)
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> مفقودة
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            إغلاق الخريطة
          </button>
        </div>
      </div>
    </div>
  );
};
