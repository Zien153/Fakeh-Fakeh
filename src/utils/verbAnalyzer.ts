import { ExperienceItem } from '../types';

export interface ActionVerbAlternative {
  verb: string;
  category: string;
  contextHint: string;
}

export interface WeakVerbDefinition {
  pattern: RegExp;
  rootWord: string;
  category: string;
  reason: string;
  alternatives: ActionVerbAlternative[];
}

export interface VerbMatch {
  matchedText: string;
  startIndex: number;
  endIndex: number;
  isWeak: boolean;
  category: string;
  categoryLabel: string;
  reason?: string;
  alternatives: ActionVerbAlternative[];
}

export type BulletToken =
  | { type: 'text'; text: string }
  | { type: 'verb'; text: string; match: VerbMatch };

export interface ExperienceVerbAnalysis {
  totalBullets: number;
  strongVerbsCount: number;
  weakVerbsCount: number;
  powerScore: number; // 0 to 100
  grade: 'ممتاز' | 'جيد جداً' | 'يحتاج تحسين';
  weakOccurrences: {
    expIndex: number;
    bulletIndex: number;
    expCompany: string;
    expTitle: string;
    bulletText: string;
    match: VerbMatch;
  }[];
  strongVerbsList: { verb: string; count: number }[];
}

// Comprehensive Arabic Weak Verbs according to recruitment & ATS standards
const ARABIC_WEAK_VERBS: WeakVerbDefinition[] = [
  {
    pattern: /^(ساعدتُ?\s+في|ساعد\s+في|مساعدة\s+في|المساعدة\s+في|ساعدت|ساعد)\b/i,
    rootWord: 'ساعد في',
    category: 'مساندة روتينية',
    reason: 'فعل مبني للمساندة السلبية يقلل من ظهور مسؤوليتك الفردية ودورك المباشر في صنع القرار.',
    alternatives: [
      { verb: 'قاد', category: 'قيادة وتوجيه', contextHint: 'إذا كنت تقود المبادرة أو تضع الرؤية' },
      { verb: 'نسّق', category: 'إدارة وتنسيق', contextHint: 'إذا قمت بتوحيد جهود الفريق والمهام' },
      { verb: 'يسّر', category: 'تسهيل وإنجاز', contextHint: 'إذا ساهمت في إزالة العقبات وتسريع الحلول' },
      { verb: 'مكّن', category: 'تمكين ودعم', contextHint: 'إذا منحت الفريق الأدوات والمعرفة للنجاح' },
      { verb: 'تعاون في', category: 'شراكة فاعلة', contextHint: 'لإبراز العمل المشترك كشريك متكافئ' },
    ],
  },
  {
    pattern: /^(ساهمتُ?\s+في|ساهم\s+في|مساهمة\s+في|المساهمة\s+في)\b/i,
    rootWord: 'ساهم في',
    category: 'مساهمة غير محددة',
    reason: 'فعل عام ومبهم لا يوضح حجم مساهمتك الدقيقة أو القيمة المضافة الصادرة عنك.',
    alternatives: [
      { verb: 'حقق', category: 'نتائج وأثر', contextHint: 'لإبراز النتيجة الرقمية الملموسة' },
      { verb: 'أنجز', category: 'تنفيذ كامل', contextHint: 'لإثبات إتمام العمل من البداية للنهاية' },
      { verb: 'عزز', category: 'نمو وتطوير', contextHint: 'إذا أدت مساهمتك إلى رفع الأداء أو الأرباح' },
      { verb: 'أحدث تحولاً في', category: 'أثر استراتيجي', contextHint: 'عند إحداث تغيير نوعي في بيئة العمل' },
    ],
  },
  {
    pattern: /^(عملتُ?\s+على|عمل\s+على|العمل\s+على|أعمل\s+على)\b/i,
    rootWord: 'عمل على',
    category: 'جهد روتيني',
    reason: 'يصف الجهد المبذول وليس الإنجاز أو النتيجة المحققة؛ مسؤولو التوظيف يبحثون عن أفعال الإنجاز.',
    alternatives: [
      { verb: 'طوّر', category: 'ابتكار وهندسة', contextHint: 'لبناء وتطوير أنظمة أو منتجات جديدة' },
      { verb: 'صمم', category: 'تصميم وهيكلة', contextHint: 'لوضع الخطط الهندسية أو المعمارية أو البصرية' },
      { verb: 'هندس', category: 'بناء تقني', contextHint: 'للحلول التقنية والبرمجية المتقدمة' },
      { verb: 'نفّذ', category: 'تنفيذ احترافي', contextHint: 'لتطبيق الاستراتيجيات والمشاريع على أرض الواقع' },
      { verb: 'بنى', category: 'تأسيس', contextHint: 'لإنشاء قواعد بيانات، نماذج، أو بنيات تحتية' },
    ],
  },
  {
    pattern: /^(كنتُ?\s+مسؤولاً?\s+عن|كان\s+مسؤولاً?\s+عن|المسؤولية\s+عن|مسؤول\s+عن|مسؤولة\s+عن|توليتُ?\s+مسؤولية)\b/i,
    rootWord: 'مسؤول عن',
    category: 'وصف وظيفي سلبي',
    reason: 'ينقل القارئ إلى واجبات الوظيفة الروتينية (Job Description) بدلاً من الإنجازات المحققة (Accomplishments).',
    alternatives: [
      { verb: 'أدار', category: 'إدارة شاملة', contextHint: 'لإدارة ميزانيات، فرق، أو عمليات تشغيلية' },
      { verb: 'أشرف على', category: 'إشراف ومراقبة', contextHint: 'لمتابعة وضمان الجودة والمعايير' },
      { verb: 'ترأس', category: 'قيادة عليا', contextHint: 'لقيادة اللجان أو الفرق الاستراتيجية' },
      { verb: 'وجّه', category: 'إرشاد', contextHint: 'لتوجيه السياسات أو تدريب الكفاءات' },
    ],
  },
  {
    pattern: /^(قمتُ?\s+بـ?|قام\s+بـ?|قامت\s+بـ?|القيام\s+بـ?|قمتُ?\s+بعمل|قام\s+بعمل)\b/i,
    rootWord: 'قام بـ',
    category: 'حشو لغوي باهت',
    reason: 'تركيب لغوي ضعيف ومطول يمكن حذفه واستبداله بالفعل المباشر القوي لزيادة التأثير.',
    alternatives: [
      { verb: 'أطلق', category: 'إطلاق وتدشين', contextHint: 'لطرح ميزات جديدة، حملات، أو مشاريع' },
      { verb: 'فعّل', category: 'تفعيل وتشغيل', contextHint: 'لبدء تشغيل خدمات أو بروتوكولات جديدة' },
      { verb: 'أتمّ', category: 'إكمال وإنجاز', contextHint: 'لإنهاء المهام الحساسة بنجاح' },
      { verb: 'أنشأ', category: 'تأسيس وابتكار', contextHint: 'لخلق محتوى، وثائق، أو أنظمة غير مسبوقة' },
    ],
  },
  {
    pattern: /^(تعاملتُ?\s+مع|تعامل\s+مع|التعامل\s+مع)\b/i,
    rootWord: 'تعامل مع',
    category: 'رد فعل غير مؤثر',
    reason: 'يوحي بردود أفعال روتينية بدلاً من امتلاك زمام المبادرة والحلول الجذرية.',
    alternatives: [
      { verb: 'حلّ', category: 'معالجة مشكلات', contextHint: 'لإصلاح الأعطال والنزاعات والتحديات' },
      { verb: 'عالج', category: 'إصلاح وضبط', contextHint: 'لإيجاد حلول منهجية للمشكلات المعقدة' },
      { verb: 'تفاوض بشأن', category: 'تواصل وتفاوض', contextHint: 'لإبرام الصفقات أو العقود' },
      { verb: 'استجاب لـ', category: 'كفاءة الاستجابة', contextHint: 'لإظهار السرعة والاحترافية مع العملاء' },
    ],
  },
  {
    pattern: /^(شاركتُ?\s+في|شارك\s+في|المشاركة\s+في)\b/i,
    rootWord: 'شارك في',
    category: 'حضور سلبي',
    reason: 'يجعل دورك يبدو كحاضر إضافي وليس مساهماً رئيساً في صناعة النتيجة.',
    alternatives: [
      { verb: 'قاد', category: 'قيادة', contextHint: 'لإظهار دورك القيادي الحاسم' },
      { verb: 'بادر بـ', category: 'مبادرة وابتكار', contextHint: 'إذا كنت صاحب الفكرة الأولى' },
      { verb: 'دفع نحو', category: 'تحفيز وإنجاز', contextHint: 'لتسريع اتخاذ القرارات وإنجاز الأهداف' },
    ],
  },
  {
    pattern: /^(توليتُ?\s+مهام|تولى\s+مهام|تولي\s+مهام)\b/i,
    rootWord: 'تولى مهام',
    category: 'واجب روتيني',
    reason: 'تركيب مكرر يعبر عن تلقي الأوامر والمهام بدلاً من تنفيذها بامتياز.',
    alternatives: [
      { verb: 'أدار', category: 'إدارة', contextHint: 'للتحكم الفعال بالموارد والنتائج' },
      { verb: 'نفّذ', category: 'تنفيذ', contextHint: 'للتركيز على جودة التسليم' },
      { verb: 'قاد بنجاح', category: 'تميز', contextHint: 'للتأكيد على التميز في الأداء' },
    ],
  },
  {
    pattern: /^(حاولتُ?|حاول|المحاولة)\b/i,
    rootWord: 'حاول',
    category: 'عدم يقين',
    reason: 'يوحي بعدم اكتمال الإنجاز أو الفشل في تحقيق الهدف المطلوب.',
    alternatives: [
      { verb: 'استكشف', category: 'بحث وتطوير', contextHint: 'لدراسة وتجربة إمكانيات جديدة' },
      { verb: 'اختبر', category: 'فحص وتدقيق', contextHint: 'لإجراء تجارب منهجية لقياس الأداء' },
      { verb: 'أطلق تجربة', category: 'مشاريع تجريبية', contextHint: 'لإطلاق نماذج أولية ومشاريع ريادية' },
    ],
  },
];

// English Weak Verbs according to recruitment & ATS standards
const ENGLISH_WEAK_VERBS: WeakVerbDefinition[] = [
  {
    pattern: /^(helped\s+with|helped|assisted\s+with|assisted)\b/i,
    rootWord: 'helped with',
    category: 'Passive Support',
    reason: 'Diminishes your direct contribution and makes your role appear secondary.',
    alternatives: [
      { verb: 'Spearheaded', category: 'Leadership', contextHint: 'If you led the initiative' },
      { verb: 'Coordinated', category: 'Management', contextHint: 'If you organized cross-functional efforts' },
      { verb: 'Facilitated', category: 'Enablement', contextHint: 'If you unblocked workflows' },
      { verb: 'Partnered with', category: 'Collaboration', contextHint: 'To emphasize peer-level contribution' },
    ],
  },
  {
    pattern: /^(worked\s+on|was\s+working\s+on)\b/i,
    rootWord: 'worked on',
    category: 'Routine Effort',
    reason: 'Focuses on effort and activity rather than outcomes and measurable value.',
    alternatives: [
      { verb: 'Engineered', category: 'Technical Build', contextHint: 'For robust software/systems' },
      { verb: 'Developed', category: 'Creation', contextHint: 'For applications or architectures' },
      { verb: 'Designed', category: 'Architecture', contextHint: 'For system architecture or UI/UX' },
      { verb: 'Executed', category: 'Delivery', contextHint: 'For delivering defined projects' },
    ],
  },
  {
    pattern: /^(responsible\s+for|was\s+responsible\s+for|in\s+charge\s+of)\b/i,
    rootWord: 'responsible for',
    category: 'Passive Duty',
    reason: 'Quotes job responsibilities instead of personal career achievements.',
    alternatives: [
      { verb: 'Directed', category: 'Leadership', contextHint: 'For overseeing departments or large teams' },
      { verb: 'Managed', category: 'Operations', contextHint: 'For budgets, personnel, or delivery' },
      { verb: 'Supervised', category: 'Oversight', contextHint: 'For maintaining quality and compliance' },
      { verb: 'Orchestrated', category: 'Strategy', contextHint: 'For complex multi-stage programs' },
    ],
  },
  {
    pattern: /^(handled|dealt\s+with)\b/i,
    rootWord: 'handled',
    category: 'Reactive Task',
    reason: 'Implies routine reaction rather than strategic proactive solutions.',
    alternatives: [
      { verb: 'Resolved', category: 'Problem Solving', contextHint: 'For fixing critical bugs or client escalations' },
      { verb: 'Negotiated', category: 'Deal Making', contextHint: 'For vendor contracts or client terms' },
      { verb: 'Streamlined', category: 'Efficiency', contextHint: 'For optimizing workflows' },
    ],
  },
  {
    pattern: /^(participated\s+in)\b/i,
    rootWord: 'participated in',
    category: 'Observer Role',
    reason: 'Suggests passive attendance rather than driving tangible business results.',
    alternatives: [
      { verb: 'Contributed to', category: 'Core Delivery', contextHint: 'With clear ownership of deliverables' },
      { verb: 'Championed', category: 'Advocacy', contextHint: 'If you promoted and drove the adoption' },
      { verb: 'Pioneered', category: 'Innovation', contextHint: 'If you introduced first-of-kind initiatives' },
    ],
  },
];

// Arabic Strong Action Verbs Catalog
const ARABIC_STRONG_VERBS: { verb: string; category: string; label: string }[] = [
  // Leadership & Direction
  { verb: 'قاد', category: 'leadership', label: 'قيادة وتوجيه' },
  { verb: 'أدار', category: 'leadership', label: 'إدارة وتوجيه' },
  { verb: 'أسس', category: 'leadership', label: 'تأسيس وبناء' },
  { verb: 'وجّه', category: 'leadership', label: 'توجيه وإشراف' },
  { verb: 'ترأس', category: 'leadership', label: 'رئاسة وقيادة' },
  { verb: 'أشرف على', category: 'leadership', label: 'إشراف ومراقبة' },
  { verb: 'نظّم', category: 'leadership', label: 'تنظيم وتنسيق' },
  { verb: 'نسّق', category: 'leadership', label: 'تنسيق عمليات' },
  { verb: 'درّب', category: 'leadership', label: 'تدريب وتطوير' },
  { verb: 'استقطب', category: 'leadership', label: 'استقطاب كفاءات' },
  { verb: 'بادر', category: 'leadership', label: 'مبادرة وريادة' },

  // Development & Innovation
  { verb: 'طوّر', category: 'development', label: 'تطوير وابتكار' },
  { verb: 'ابتكر', category: 'development', label: 'ابتكار وتميز' },
  { verb: 'صمم', category: 'development', label: 'تصميم وهندسة' },
  { verb: 'أنشأ', category: 'development', label: 'إنشاء وبناء' },
  { verb: 'بنى', category: 'development', label: 'بناء وهيكلة' },
  { verb: 'هندس', category: 'development', label: 'هندسة تقنية' },
  { verb: 'برمج', category: 'development', label: 'برمجة وتطوير' },
  { verb: 'أعاد هيكلة', category: 'development', label: 'إعادة هيكلة' },
  { verb: 'أحدث', category: 'development', label: 'إحداث تطوير' },
  { verb: 'صاغ', category: 'development', label: 'صياغة استراتيجية' },

  // Results & Growth
  { verb: 'حقق', category: 'achievement', label: 'إنجاز ونتائج' },
  { verb: 'رفع', category: 'achievement', label: 'زيادة ونمو' },
  { verb: 'ضاعف', category: 'achievement', label: 'مضاعفة أداء' },
  { verb: 'زاد', category: 'achievement', label: 'نمو كمي' },
  { verb: 'حسّن', category: 'achievement', label: 'تحسين جودة' },
  { verb: 'عزز', category: 'achievement', label: 'تعزيز مكانة' },
  { verb: 'سرّع', category: 'achievement', label: 'تسريع إنجاز' },
  { verb: 'وسّع', category: 'achievement', label: 'توسيع نطاق' },
  { verb: 'تجاوز', category: 'achievement', label: 'تجاوز مستهدفات' },

  // Savings & Efficiency
  { verb: 'خفّض', category: 'efficiency', label: 'تخفيض تكاليف' },
  { verb: 'وفّر', category: 'efficiency', label: 'توفير موارد' },
  { verb: 'قلّص', category: 'efficiency', label: 'تقليص هدر' },
  { verb: 'اختزل', category: 'efficiency', label: 'اختزال خطوات' },
  { verb: 'بسّط', category: 'efficiency', label: 'تبسيط إجراءات' },
  { verb: 'أتمت', category: 'efficiency', label: 'أتمتة وحوسبة' },
  { verb: 'رشّد', category: 'efficiency', label: 'ترشيد إنفاق' },

  // Execution & Delivery
  { verb: 'أطلق', category: 'execution', label: 'إطلاق وتدشين' },
  { verb: 'نفّذ', category: 'execution', label: 'تنفيذ احترافي' },
  { verb: 'أنجز', category: 'execution', label: 'إنجاز تسليم' },
  { verb: 'نشر', category: 'execution', label: 'نشر وتعميم' },
  { verb: 'فعّل', category: 'execution', label: 'تفعيل أنظمة' },
  { verb: 'اعتمد', category: 'execution', label: 'اعتماد رسمي' },
  { verb: 'أتمّ', category: 'execution', label: 'إتمام كامل' },
  { verb: 'سلّم', category: 'execution', label: 'تسليم في الموعد' },

  // Analysis & Evaluation
  { verb: 'حلل', category: 'analysis', label: 'تحليل دقيق' },
  { verb: 'قيّم', category: 'analysis', label: 'تقييم أداء' },
  { verb: 'فحص', category: 'analysis', label: 'فحص ومراجعة' },
  { verb: 'شخّص', category: 'analysis', label: 'تشخيص حلول' },
  { verb: 'دقق', category: 'analysis', label: 'تدقيق وضبط' },

  // Problem Solving
  { verb: 'حلّ', category: 'solutions', label: 'معالجة وحلول' },
  { verb: 'تغلب على', category: 'solutions', label: 'تجاوز تحديات' },
  { verb: 'عالج', category: 'solutions', label: 'معالجة جذرية' },
  { verb: 'تفاوض', category: 'solutions', label: 'تفاوض صفقات' },
];

// English Strong Action Verbs Catalog
const ENGLISH_STRONG_VERBS: { verb: string; category: string; label: string }[] = [
  { verb: 'Spearheaded', category: 'leadership', label: 'Leadership' },
  { verb: 'Led', category: 'leadership', label: 'Leadership' },
  { verb: 'Directed', category: 'leadership', label: 'Direction' },
  { verb: 'Orchestrated', category: 'leadership', label: 'Program Management' },
  { verb: 'Managed', category: 'leadership', label: 'Management' },
  { verb: 'Supervised', category: 'leadership', label: 'Oversight' },
  { verb: 'Engineered', category: 'development', label: 'Engineering' },
  { verb: 'Developed', category: 'development', label: 'Development' },
  { verb: 'Architected', category: 'development', label: 'Architecture' },
  { verb: 'Designed', category: 'development', label: 'Design' },
  { verb: 'Built', category: 'development', label: 'Build' },
  { verb: 'Created', category: 'development', label: 'Creation' },
  { verb: 'Achieved', category: 'achievement', label: 'Achievement' },
  { verb: 'Increased', category: 'achievement', label: 'Growth' },
  { verb: 'Accelerated', category: 'achievement', label: 'Velocity' },
  { verb: 'Maximized', category: 'achievement', label: 'Optimization' },
  { verb: 'Boosted', category: 'achievement', label: 'Improvement' },
  { verb: 'Scaled', category: 'achievement', label: 'Scaling' },
  { verb: 'Reduced', category: 'efficiency', label: 'Cost Reduction' },
  { verb: 'Streamlined', category: 'efficiency', label: 'Efficiency' },
  { verb: 'Automated', category: 'efficiency', label: 'Automation' },
  { verb: 'Consolidated', category: 'efficiency', label: 'Consolidation' },
  { verb: 'Launched', category: 'execution', label: 'Product Launch' },
  { verb: 'Executed', category: 'execution', label: 'Execution' },
  { verb: 'Delivered', category: 'execution', label: 'Delivery' },
  { verb: 'Implemented', category: 'execution', label: 'Implementation' },
  { verb: 'Analyzed', category: 'analysis', label: 'Analysis' },
  { verb: 'Audited', category: 'analysis', label: 'Audit' },
  { verb: 'Resolved', category: 'solutions', label: 'Resolution' },
];

/**
 * Parses a single bullet text and extracts any weak verb (highest priority) or strong verb.
 */
export function analyzeBulletText(bulletText: string): {
  tokens: BulletToken[];
  hasWeak: boolean;
  hasStrong: boolean;
  primaryVerb?: VerbMatch;
} {
  const trimmed = bulletText.trim();
  if (!trimmed) {
    return {
      tokens: [{ type: 'text', text: bulletText }],
      hasWeak: false,
      hasStrong: false,
    };
  }

  // 1. Check for Weak Verbs at beginning or early in sentence
  for (const def of [...ARABIC_WEAK_VERBS, ...ENGLISH_WEAK_VERBS]) {
    const match = trimmed.match(def.pattern);
    if (match && match.index !== undefined) {
      const matchedString = match[0];
      const startIndex = bulletText.indexOf(matchedString);
      const endIndex = startIndex + matchedString.length;

      const verbMatch: VerbMatch = {
        matchedText: matchedString,
        startIndex,
        endIndex,
        isWeak: true,
        category: def.category,
        categoryLabel: def.category,
        reason: def.reason,
        alternatives: def.alternatives,
      };

      const tokens: BulletToken[] = [];
      if (startIndex > 0) {
        tokens.push({ type: 'text', text: bulletText.slice(0, startIndex) });
      }
      tokens.push({ type: 'verb', text: matchedString, match: verbMatch });
      if (endIndex < bulletText.length) {
        tokens.push({ type: 'text', text: bulletText.slice(endIndex) });
      }

      return {
        tokens,
        hasWeak: true,
        hasStrong: false,
        primaryVerb: verbMatch,
      };
    }
  }

  // 2. Check for Strong Verbs at beginning
  // Arabic strong verbs check
  for (const strong of ARABIC_STRONG_VERBS) {
    const regex = new RegExp(`^(${strong.verb})\\b`, 'i');
    const match = trimmed.match(regex);
    if (match && match.index !== undefined) {
      const matchedString = match[0];
      const startIndex = bulletText.indexOf(matchedString);
      const endIndex = startIndex + matchedString.length;

      const verbMatch: VerbMatch = {
        matchedText: matchedString,
        startIndex,
        endIndex,
        isWeak: false,
        category: strong.category,
        categoryLabel: strong.label,
        alternatives: [],
      };

      const tokens: BulletToken[] = [];
      if (startIndex > 0) {
        tokens.push({ type: 'text', text: bulletText.slice(0, startIndex) });
      }
      tokens.push({ type: 'verb', text: matchedString, match: verbMatch });
      if (endIndex < bulletText.length) {
        tokens.push({ type: 'text', text: bulletText.slice(endIndex) });
      }

      return {
        tokens,
        hasWeak: false,
        hasStrong: true,
        primaryVerb: verbMatch,
      };
    }
  }

  // English strong verbs check
  for (const strong of ENGLISH_STRONG_VERBS) {
    const regex = new RegExp(`^(${strong.verb})\\b`, 'i');
    const match = trimmed.match(regex);
    if (match && match.index !== undefined) {
      const matchedString = match[0];
      const startIndex = bulletText.indexOf(matchedString);
      const endIndex = startIndex + matchedString.length;

      const verbMatch: VerbMatch = {
        matchedText: matchedString,
        startIndex,
        endIndex,
        isWeak: false,
        category: strong.category,
        categoryLabel: strong.label,
        alternatives: [],
      };

      const tokens: BulletToken[] = [];
      if (startIndex > 0) {
        tokens.push({ type: 'text', text: bulletText.slice(0, startIndex) });
      }
      tokens.push({ type: 'verb', text: matchedString, match: verbMatch });
      if (endIndex < bulletText.length) {
        tokens.push({ type: 'text', text: bulletText.slice(endIndex) });
      }

      return {
        tokens,
        hasWeak: false,
        hasStrong: true,
        primaryVerb: verbMatch,
      };
    }
  }

  // No recognized verb
  return {
    tokens: [{ type: 'text', text: bulletText }],
    hasWeak: false,
    hasStrong: false,
  };
}

/**
 * Analyzes the complete list of experiences in the resume to produce overall verb strength metrics.
 */
export function analyzeExperienceVerbs(experiences: ExperienceItem[]): ExperienceVerbAnalysis {
  let totalBullets = 0;
  let strongVerbsCount = 0;
  let weakVerbsCount = 0;
  const weakOccurrences: ExperienceVerbAnalysis['weakOccurrences'] = [];
  const strongMap = new Map<string, number>();

  experiences.forEach((exp, expIndex) => {
    exp.bullets.forEach((bullet, bulletIndex) => {
      totalBullets++;
      const analysis = analyzeBulletText(bullet);

      if (analysis.hasWeak && analysis.primaryVerb) {
        weakVerbsCount++;
        weakOccurrences.push({
          expIndex,
          bulletIndex,
          expCompany: exp.company,
          expTitle: exp.title,
          bulletText: bullet,
          match: analysis.primaryVerb,
        });
      } else if (analysis.hasStrong && analysis.primaryVerb) {
        strongVerbsCount++;
        const currentCount = strongMap.get(analysis.primaryVerb.matchedText) || 0;
        strongMap.set(analysis.primaryVerb.matchedText, currentCount + 1);
      }
    });
  });

  const totalAnalyzed = Math.max(1, totalBullets);
  // Score formula: (strongVerbs / totalBullets) * 100 with penalty for weak verbs
  const rawScore = Math.max(
    0,
    Math.round(((strongVerbsCount) / totalAnalyzed) * 100 - (weakVerbsCount * 12))
  );
  const powerScore = Math.min(100, Math.max(20, rawScore));

  let grade: ExperienceVerbAnalysis['grade'] = 'ممتاز';
  if (weakVerbsCount > 0 || powerScore < 80) {
    grade = weakVerbsCount > 2 || powerScore < 60 ? 'يحتاج تحسين' : 'جيد جداً';
  }

  const strongVerbsList = Array.from(strongMap.entries())
    .map(([verb, count]) => ({ verb, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalBullets,
    strongVerbsCount,
    weakVerbsCount,
    powerScore,
    grade,
    weakOccurrences,
    strongVerbsList,
  };
}

/**
 * Intelligently replaces a weak verb in a bullet point with a chosen strong action verb.
 * Handles Arabic prepositions smoothly (e.g., removing 'في' when changing 'ساعد في' to 'طوّر' if appropriate).
 */
export function replaceWeakVerbInBullet(
  bulletText: string,
  weakMatch: VerbMatch,
  newVerb: string
): string {
  const original = bulletText;
  const start = weakMatch.startIndex;
  const end = weakMatch.endIndex;

  const prefix = original.slice(0, start);
  let suffix = original.slice(end).trimStart();

  // If new verb doesn't require prepositions like 'في' or 'على' and the suffix begins with it:
  const directVerbsNoPrep = [
    'قاد', 'طوّر', 'صمم', 'ابتكر', 'أنشأ', 'بنى', 'هندس', 'أدار', 'حقق',
    'أطلق', 'نفّذ', 'أنجز', 'خفّض', 'وفّر', 'حلّ', 'عالج', 'أتمّ', 'فعّل',
    'Spearheaded', 'Directed', 'Managed', 'Orchestrated', 'Engineered',
    'Developed', 'Designed', 'Built', 'Created', 'Achieved', 'Launched'
  ];

  if (directVerbsNoPrep.includes(newVerb)) {
    // Check if suffix begins with 'في' or 'على' and remove it if following a direct verb
    if (suffix.startsWith('في ')) {
      suffix = suffix.slice(3).trimStart();
    } else if (suffix.startsWith('على ')) {
      suffix = suffix.slice(4).trimStart();
    } else if (suffix.startsWith('بـ')) {
      suffix = suffix.slice(2).trimStart();
    } else if (suffix.startsWith('ب')) {
      suffix = suffix.slice(1).trimStart();
    }
  }

  return `${prefix}${newVerb} ${suffix}`.trim();
}
