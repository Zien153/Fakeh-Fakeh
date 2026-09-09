import { ResumeData, AtsReviewData } from '../types';

export type KeywordStatus = 'optimal' | 'low' | 'overused' | 'missing';

export interface KeywordHeatmapItem {
  id: string;
  term: string;
  count: number;
  densityPercent: number; // percentage of total words
  status: KeywordStatus;
  statusLabel: string;
  category: 'hard' | 'soft' | 'tool' | 'general';
  categoryLabel: string;
  isFromJobDescription: boolean;
  occurrences: {
    section: 'summary' | 'experience' | 'skills' | 'education';
    sectionLabel: string;
    expIndex?: number;
    bulletIndex?: number;
    snippet: string;
  }[];
  synonymsOrAlternatives: string[];
  recommendation: string;
}

export interface KeywordHeatmapAnalysis {
  totalWords: number;
  uniqueTermsAnalyzed: number;
  items: KeywordHeatmapItem[];
  overusedCount: number;
  optimalCount: number;
  lowCount: number;
  missingCount: number;
  densityScore: number; // 0 - 100 representing health of keyword distribution
  vocabularyRichnessScore: number; // Type-Token Ratio percentage
  stuffingRisk: 'low' | 'moderate' | 'high';
  stuffingRiskLabel: string;
}

// Common Arabic stop words to exclude from keyword extraction
const ARABIC_STOPWORDS = new Set([
  'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'تم', 'تمت', 'كان', 'كانت', 'يكون',
  'التي', 'الذي', 'الذين', 'اللاتي', 'كل', 'ذلك', 'تلك', 'بين', 'خلال', 'حول', 'حيث',
  'أو', 'أم', 'ثم', 'حتى', 'لا', 'ما', 'لم', 'لن', 'إن', 'أن', 'أنها', 'أنه', 'هو', 'هي',
  'هم', 'هن', 'نحن', 'أنا', 'أنت', 'أنتما', 'أنتم', 'أنتن', 'ذات', 'نحو', 'ضد', 'فوق',
  'تحت', 'أمام', 'خلف', 'يمين', 'شمال', 'لدى', 'عند', 'منذ', 'غير', 'سوى', 'إلا', 'مثل',
  'كذلك', 'أيضا', 'أيضاً', 'جدا', 'جداً', 'قد', 'فقد', 'إذا', 'لو', 'لولا', 'بما', 'كما',
  'كأن', 'لكن', 'لكنه', 'لكنها', 'بل', 'و', 'ف', 'ب', 'ل', 'ك', 'بها', 'به', 'بهم', 'له',
  'لها', 'لهم', 'منها', 'منه', 'منهم', 'إليها', 'إليه', 'إليهم', 'عليها', 'عليه', 'عليهم',
  'عنها', 'عنه', 'عنهم', 'فيها', 'فيه', 'فيهم', 'معها', 'معه', 'معهم', 'عبر', 'أجل', 'أثناء',
  'عام', 'سنة', 'سنوات', 'يوم', 'أيام', 'شهر', 'أشهر', 'شهرين', 'سنتين',
]);

// English stop words
const ENGLISH_STOPWORDS = new Set([
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'about', 'into', 'over', 'after',
  'the', 'a', 'an', 'and', 'or', 'but', 'nor', 'so', 'yet', 'as', 'is', 'am', 'are', 'was',
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'this', 'that',
  'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'we', 'they', 'i',
  'you', 'he', 'she', 'it', 'me', 'him', 'them', 'us', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'than', 'too',
  'very', 'can', 'will', 'just', 'should', 'now', 'via',
]);

// Synonym and diversification dictionary for frequent resume terms (Arabic & English)
const VOCABULARY_ALTERNATIVES: Record<string, string[]> = {
  // إدارة / قيادة
  'إدارة': ['توجيه', 'قيادة استراتيجية', 'إشراف تنسيقي', 'حوكمة', 'تنظيم مسارات العمل'],
  'ادارة': ['توجيه', 'قيادة', 'إشراف', 'حوكمة', 'تنظيم العمل'],
  'إدارية': ['تنظيمية', 'إشرافية', 'قيادية', 'تنسيقية'],
  'قيادة': ['توجيه الفرق', 'إدارة مبادرات', 'ريادة', 'تحفيز الكوادر'],
  'تطوير': ['تنمية', 'ترقية', 'ابتكار', 'تحديث', 'إعادة هندسة', 'تحسين هيكلي'],
  'تحسين': ['رفع كفاءة', 'ترشيد', 'تحسين عوائد', 'تقليص هدر', 'أتمتة'],
  'تنفيذ': ['إنجاز', 'تطبيق عملي', 'إطلاق', 'مباشرة', 'ترجمة الخطط'],
  'تنسيق': ['مواءمة', 'ربط الأطراف', 'تكامل المهام', 'توحيد الجهود'],
  'تحليل': ['تقييم معمق', 'استقصاء بيانات', 'دراسة جدوى', 'فحص قياسي', 'تشخيص'],
  'تصميم': ['هندسة معمارية', 'بناء نماذج', 'تخطيط بنيوي', 'تأسيس'],
  'بناء': ['تأسيس', 'إنشاء', 'صياغة هياكل', 'ابتكار حلول'],
  'متابعة': ['رصد دوري', 'مراقبة جودة', 'تدقيق مستمر', 'تتبع مؤشرات KPI'],
  'إشراف': ['توجيه ميداني', 'مراقبة تنفيذية', 'رعاية تشغيلية'],
  'مشروع': ['مبادرة', 'برنامج عمل', 'منظومة مشاريع', 'محفظة تشغيلية'],
  'مشاريع': ['مبادرات استراتيجية', 'برامج تحول', 'محافظ مشاريع'],
  'بيانات': ['أصول معلوماتية', 'مؤشرات رقمية', 'تحليلات إحصائية', 'مدخلات قياسية'],
  'نظام': ['منظومة', 'بيئة عمل متكاملة', 'حل برمجي', 'بنية تحتية'],
  'أنظمة': ['منظومات رقمية', 'حلول متكاملة', 'منصات تشغيل'],
  'فريق': ['كوادر متخصصة', 'مجموعة عمل', 'أعضاء المشروع', 'طاقات بشرية'],
  'حلول': ['معالجات مبتكرة', 'بدائل تشغيلية', 'نماذج أعمال'],
  'مبيعات': ['إيرادات تجارية', 'عوائد صفقات', 'حصة سوقية', 'توسيع محفظة العملاء'],
  'تسويق': ['ترويج استراتيجي', 'استقطاب جمهور', 'نمو العلامة التجارية'],
  'جودة': ['معايير قياسية', 'ضمان المطابقة', 'امتثال مؤسسي', 'كفاءة تشغيلية'],
  'عمليات': ['إجراءات تشغيل', 'سلاسل إمداد', 'سير عمل أوتوماتيكي', 'تدفقات مهام'],
  'أداء': ['إنتاجية', 'مخرجات وظيفية', 'مؤشرات إنجاز', 'عائد استثماري'],

  // English common terms
  'management': ['leadership', 'orchestration', 'governance', 'strategic oversight'],
  'development': ['engineering', 'advancement', 'innovation', 'architecting'],
  'analysis': ['evaluation', 'investigation', 'data modeling', 'forecasting'],
  'implementation': ['execution', 'deployment', 'operationalization', 'rollout'],
  'optimization': ['enhancement', 'streamlining', 'efficiency boost', 'refactoring'],
  'design': ['architecting', 'blueprinting', 'modeling', 'conceptualization'],
  'coordination': ['alignment', 'cross-functional collaboration', 'facilitation'],
  'monitoring': ['surveillance', 'telemetry tracking', 'benchmarking', 'auditing'],
  'project': ['initiative', 'strategic program', 'deliverable'],
  'team': ['cross-functional squad', 'collaborators', 'talent cohort'],
};

/**
 * Normalizes an Arabic or English word for fair comparison
 */
function normalizeWord(word: string): string {
  let w = word.trim().toLowerCase();
  // Arabic normalization (alef variations, teh marbuta, etc.)
  w = w.replace(/[إأآا]/g, 'ا');
  w = w.replace(/ة/g, 'ه');
  w = w.replace(/ى/g, 'ي');
  w = w.replace(/[\u064B-\u065F]/g, ''); // diacritics / tashkeel
  return w;
}

/**
 * Strips punctuation and returns clean tokens
 */
function tokenizeText(text: string): string[] {
  if (!text) return [];
  // Match word sequences in Arabic ([\u0600-\u06FF]) and Latin ([a-zA-Z0-9_#+]+)
  const matches = text.match(/[\u0600-\u06FF]+|[a-zA-Z0-9+#.]+/g);
  if (!matches) return [];
  return matches
    .map((m) => m.trim())
    .filter((m) => m.length >= 2);
}

/**
 * Categorize term if known, or fallback to general
 */
function inferCategory(term: string, atsKeywords?: AtsReviewData['keywords']): 'hard' | 'soft' | 'tool' | 'general' {
  if (atsKeywords) {
    const norm = normalizeWord(term);
    const found = atsKeywords.find((k) => normalizeWord(k.keyword) === norm || k.keyword.toLowerCase().includes(term.toLowerCase()));
    if (found) return found.category;
  }
  const t = term.toLowerCase();
  if (['react', 'python', 'sql', 'typescript', 'docker', 'git', 'excel', 'power bi', 'aws', 'jira', 'sap', 'figma'].some((tool) => t.includes(tool))) {
    return 'tool';
  }
  if (['قيادة', 'تواصل', 'تفاوض', 'مرونة', 'حل مشكلات', 'teamwork', 'leadership', 'communication'].some((s) => t.includes(s))) {
    return 'soft';
  }
  return 'general';
}

/**
 * Analyzes the Resume text content to calculate word repetitions, keyword density,
 * overused terms (Keyword Stuffing risk), optimal terms, and missing target terms.
 */
export function analyzeResumeKeywordDensity(
  resume: ResumeData,
  atsReview?: AtsReviewData | null,
  targetJobDescription?: string
): KeywordHeatmapAnalysis {
  // 1. Gather all texts by sections with their contextual locations
  const sectionTexts: {
    section: 'summary' | 'experience' | 'skills' | 'education';
    sectionLabel: string;
    expIndex?: number;
    bulletIndex?: number;
    text: string;
  }[] = [];

  // Summary
  if (resume.summary) {
    sectionTexts.push({
      section: 'summary',
      sectionLabel: 'الملخص المهني',
      text: resume.summary,
    });
  }

  // Experiences
  resume.experiences.forEach((exp, expIdx) => {
    // Title & company
    sectionTexts.push({
      section: 'experience',
      sectionLabel: `خبرة: ${exp.title} (${exp.company})`,
      expIndex: expIdx,
      text: `${exp.title} ${exp.company}`,
    });
    // Bullets
    exp.bullets.forEach((bullet, bIdx) => {
      sectionTexts.push({
        section: 'experience',
        sectionLabel: `نقطة إنجاز في: ${exp.company}`,
        expIndex: expIdx,
        bulletIndex: bIdx,
        text: bullet,
      });
    });
  });

  // Skills
  const skillsList = [
    ...(resume.skills.technical || []),
    ...(resume.skills.tools || []),
    ...(resume.skills.soft || []),
  ];
  if (skillsList.length > 0) {
    sectionTexts.push({
      section: 'skills',
      sectionLabel: 'قسم المهارات والكفاءات',
      text: skillsList.join(' '),
    });
  }

  // Education
  resume.education.forEach((edu) => {
    sectionTexts.push({
      section: 'education',
      sectionLabel: `التعليم: ${edu.degree}`,
      text: `${edu.degree} ${edu.institution} ${edu.details || ''}`,
    });
  });

  // Calculate total resume word count
  let totalWords = 0;
  const wordFrequencyMap: Map<string, {
    originalDisplay: string;
    count: number;
    occurrences: KeywordHeatmapItem['occurrences'];
  }> = new Map();

  for (const block of sectionTexts) {
    const tokens = tokenizeText(block.text);
    totalWords += tokens.length;

    for (const token of tokens) {
      const lowerToken = token.toLowerCase();
      const norm = normalizeWord(token);

      // Check if stopword
      if (ARABIC_STOPWORDS.has(norm) || ENGLISH_STOPWORDS.has(lowerToken)) {
        continue;
      }
      // Check length minimum
      if (token.length < 3) {
        continue;
      }
      // Skip pure digits (years, percentages are metrics, not keyword terms)
      if (/^\d+%?$/.test(token)) {
        continue;
      }

      // Check if this token belongs to an existing normalized entry
      const existing = wordFrequencyMap.get(norm);
      const snippet = block.text.length > 90 ? block.text.substring(0, 90) + '...' : block.text;

      if (existing) {
        existing.count += 1;
        // Keep unique occurrences or add
        if (existing.occurrences.length < 6) {
          existing.occurrences.push({
            section: block.section,
            sectionLabel: block.sectionLabel,
            expIndex: block.expIndex,
            bulletIndex: block.bulletIndex,
            snippet,
          });
        }
      } else {
        wordFrequencyMap.set(norm, {
          originalDisplay: token,
          count: 1,
          occurrences: [
            {
              section: block.section,
              sectionLabel: block.sectionLabel,
              expIndex: block.expIndex,
              bulletIndex: block.bulletIndex,
              snippet,
            },
          ],
        });
      }
    }
  }

  // Also include multi-word keywords from atsReview if present (e.g. "إدارة المشاريع", "machine learning")
  const multiWordKeywords = (atsReview?.keywords || []).filter((k) => k.keyword.trim().includes(' '));
  for (const mw of multiWordKeywords) {
    const term = mw.keyword.trim();
    const norm = normalizeWord(term);
    let occurrencesCount = 0;
    const occurrencesList: KeywordHeatmapItem['occurrences'] = [];

    for (const block of sectionTexts) {
      if (block.text.toLowerCase().includes(term.toLowerCase())) {
        occurrencesCount += 1;
        occurrencesList.push({
          section: block.section,
          sectionLabel: block.sectionLabel,
          expIndex: block.expIndex,
          bulletIndex: block.bulletIndex,
          snippet: block.text.length > 90 ? block.text.substring(0, 90) + '...' : block.text,
        });
      }
    }

    if (occurrencesCount > 0 && !wordFrequencyMap.has(norm)) {
      wordFrequencyMap.set(norm, {
        originalDisplay: term,
        count: occurrencesCount,
        occurrences: occurrencesList,
      });
    }
  }

  // Also include missing keywords from atsReview to give a complete picture
  const missingKeywords = atsReview?.keywords?.filter((k) => !k.foundInResume) || [];

  // Build the items list
  const items: KeywordHeatmapItem[] = [];
  const safeTotalWords = Math.max(totalWords, 1);

  // Process counted words
  for (const [normKey, data] of wordFrequencyMap.entries()) {
    const densityPercent = Number(((data.count / safeTotalWords) * 100).toFixed(1));
    const isFromJob = Boolean(
      atsReview?.keywords?.some((k) => normalizeWord(k.keyword) === normKey) ||
      (targetJobDescription && targetJobDescription.toLowerCase().includes(data.originalDisplay.toLowerCase()))
    );

    // Classification according to ATS keyword density benchmarks:
    // Optimal frequency for an A4 resume: 2 - 4 times (0.6% - 2.5% density)
    // Overused (Stuffing risk): >= 5 times OR density > 3.0%
    // Low: 1 time (found, but could be reinforced if core)
    let status: KeywordStatus = 'optimal';
    let statusLabel = 'تكرار مثالي ومرن';
    let recommendation = 'النسبة الحالية ممتازة وتمنح خوارزمية الفرز سياقاً طبيعياً دون تكرار مزعج.';

    if (data.count >= 5 || densityPercent >= 3.0) {
      status = 'overused';
      statusLabel = 'تكرار مفرط (خطر حشو ATS)';
      recommendation = `تكررت الكلمة (${data.count} مرات بنسبة ${densityPercent}%)، يُفضل استبدال بعضها بمرادفات غنية لتفادي تصنيف السيرة كحشو آلي (Keyword Stuffing).`;
    } else if (data.count === 1) {
      status = 'low';
      statusLabel = 'تكرار خفيف (مرة واحدة)';
      recommendation = isFromJob
        ? 'تم ذكر هذا المصطلح مرة واحدة فقط؛ إذا كان متطلباً أساسياً في الوصف الوظيفي يمكنك تعزيزه في الخبرات.'
        : 'ذكر عابر ومناسب للسياق.';
    } else {
      status = 'optimal';
      statusLabel = 'تكرار مثالي (2-4 مرات)';
      recommendation = 'تكرار متوازن يثبت التخصص بدون مبالغة أو تكرار رتيب.';
    }

    // Lookup synonym suggestions
    const matchedSynonymKey = Object.keys(VOCABULARY_ALTERNATIVES).find(
      (k) => normalizeWord(k) === normKey || data.originalDisplay.toLowerCase().includes(k.toLowerCase())
    );
    const synonyms = matchedSynonymKey ? VOCABULARY_ALTERNATIVES[matchedSynonymKey] : [];

    // Only include words that appear at least 2 times OR are designated job keywords
    if (data.count >= 2 || isFromJob || (data.originalDisplay.length >= 4 && data.count >= 1 && synonyms.length > 0)) {
      items.push({
        id: `term-${normKey}`,
        term: data.originalDisplay,
        count: data.count,
        densityPercent,
        status,
        statusLabel,
        category: inferCategory(data.originalDisplay, atsReview?.keywords),
        categoryLabel:
          inferCategory(data.originalDisplay, atsReview?.keywords) === 'tool'
            ? 'أدوات وأنظمة'
            : inferCategory(data.originalDisplay, atsReview?.keywords) === 'hard'
            ? 'مهارة صلبة وتخصصية'
            : inferCategory(data.originalDisplay, atsReview?.keywords) === 'soft'
            ? 'مهارة قيادية وسلوكية'
            : 'مصطلح عام / سياقي',
        isFromJobDescription: isFromJob,
        occurrences: data.occurrences,
        synonymsOrAlternatives: synonyms,
        recommendation,
      });
    }
  }

  // Include missing critical keywords
  missingKeywords.forEach((mk) => {
    const norm = normalizeWord(mk.keyword);
    // Don't duplicate if already somehow caught
    if (!items.some((it) => normalizeWord(it.term) === norm)) {
      items.push({
        id: `missing-${norm}`,
        term: mk.keyword,
        count: 0,
        densityPercent: 0,
        status: 'missing',
        statusLabel: 'مفقودة تماماً (0 مرات)',
        category: mk.category,
        categoryLabel:
          mk.category === 'tool'
            ? 'أدوات وأنظمة'
            : mk.category === 'hard'
            ? 'مهارة صلبة وتخصصية'
            : mk.category === 'soft'
            ? 'مهارة قيادية وسلوكية'
            : 'مصطلح وظيفي رئيسي',
        isFromJobDescription: true,
        occurrences: [],
        synonymsOrAlternatives: VOCABULARY_ALTERNATIVES[mk.keyword] || [],
        recommendation: 'موجودة في الإعلان الوظيفي لكنها غائبة عن سيرتك الذاتية، ويُوصى بإضافتها لرفع توافق ATS.',
      });
    }
  });

  // Sort items: overused first (descending count), then missing, then optimal (descending count), then low
  items.sort((a, b) => {
    const priority = { overused: 1, missing: 2, optimal: 3, low: 4 };
    if (priority[a.status] !== priority[b.status]) {
      return priority[a.status] - priority[b.status];
    }
    return b.count - a.count;
  });

  const overusedCount = items.filter((i) => i.status === 'overused').length;
  const optimalCount = items.filter((i) => i.status === 'optimal').length;
  const lowCount = items.filter((i) => i.status === 'low').length;
  const missingCount = items.filter((i) => i.status === 'missing').length;

  // Stuffing Risk calculation
  let stuffingRisk: 'low' | 'moderate' | 'high' = 'low';
  let stuffingRiskLabel = 'منخفض جداً (توزيع طبيعي ومرن)';

  if (overusedCount >= 3 || items.some((i) => i.count >= 7)) {
    stuffingRisk = 'high';
    stuffingRiskLabel = 'مرتفع (اشتباه بحشو الكلمات المفتاحية)';
  } else if (overusedCount >= 1 || items.some((i) => i.count >= 5)) {
    stuffingRisk = 'moderate';
    stuffingRiskLabel = 'متوسط (يوجد مصطلحات مكررة بكثرة)';
  }

  // Density Score (100 is ideal, deducted for overused stuffing and missing terms)
  let densityScore = 100;
  densityScore -= overusedCount * 12;
  densityScore -= missingCount * 5;
  if (stuffingRisk === 'high') densityScore -= 15;
  densityScore = Math.max(35, Math.min(100, densityScore));

  // Type-Token Ratio (Vocabulary Richness score)
  const uniqueTermsAnalyzed = wordFrequencyMap.size;
  const vocabularyRichnessScore = Math.min(
    100,
    Math.round((uniqueTermsAnalyzed / Math.max(totalWords, 1)) * 140)
  );

  return {
    totalWords,
    uniqueTermsAnalyzed,
    items,
    overusedCount,
    optimalCount,
    lowCount,
    missingCount,
    densityScore,
    vocabularyRichnessScore,
    stuffingRisk,
    stuffingRiskLabel,
  };
}
