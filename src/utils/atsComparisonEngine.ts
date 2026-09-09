import { ResumeData, AtsReviewData } from '../types';

export type DiscrepancySeverity = 'critical' | 'warning' | 'tip';

export type DiscrepancyCategory =
  | 'missing_keyword'
  | 'weak_verb'
  | 'missing_metrics'
  | 'summary_structure'
  | 'education_skills'
  | 'ats_format';

export interface AtsDiscrepancyItem {
  id: string;
  category: DiscrepancyCategory;
  categoryLabel: string;
  title: string;
  currentValue: string;
  recommendedValue: string;
  explanation: string;
  severity: DiscrepancySeverity;
  targetSection: 'summary' | 'experience' | 'skills' | 'education' | 'general';
  quickActionType?:
    | 'add_skill'
    | 'replace_weak_verb'
    | 'add_metric_example'
    | 'improve_summary'
    | 'copy_snippet';
  suggestedText?: string;
  targetExpIndex?: number;
  targetBulletIndex?: number;
}

export interface AtsComparisonResult {
  discrepancies: AtsDiscrepancyItem[];
  totalDiscrepancies: number;
  criticalCount: number;
  warningCount: number;
  tipsCount: number;
  atsHealthScore: number;
  alignmentSummary: {
    keywordAlignmentPercent: number;
    quantificationAlignmentPercent: number;
    actionVerbStrengthPercent: number;
    structuralReadabilityPercent: number;
  };
}

/**
 * Compares the current ResumeData against the target ATS recommendations and requirements,
 * generating precise points of discrepancy (نقاط التباين) to guide manual optimization.
 */
export function computeAtsDiscrepancies(
  resume: ResumeData,
  atsReview?: AtsReviewData | null
): AtsComparisonResult {
  const discrepancies: AtsDiscrepancyItem[] = [];

  // 1. Missing High-Priority Keywords (الكلمات المفتاحية المفقودة)
  if (atsReview?.keywords) {
    const missingHigh = atsReview.keywords.filter((kw) => !kw.foundInResume && kw.importance === 'high');
    const missingMedium = atsReview.keywords.filter((kw) => !kw.foundInResume && kw.importance !== 'high');

    missingHigh.forEach((kw, idx) => {
      const catName =
        kw.category === 'hard'
          ? 'مهارة فنية صلبة'
          : kw.category === 'soft'
          ? 'مهارة قيادية / ناعمة'
          : kw.category === 'tool'
          ? 'أداة / تقنية برمجية'
          : 'مطلب وظيفي رئيسي';

      discrepancies.push({
        id: `kw-high-${idx}`,
        category: 'missing_keyword',
        categoryLabel: 'كلمة مفتاحية مفقودة (أولوية قصوى)',
        title: `غياب الكلمة الأساسية: «${kw.keyword}»`,
        currentValue: 'غير موجودة في نصوص السيرة أو المهارات الحالية.',
        recommendedValue: `إدراج «${kw.keyword}» كـ ${catName} إما ضمن قائمة المهارات أو داخل سياق إنجازات الخبرة.`,
        explanation: 'أنظمة ATS تبحث بدقة عن هذا المصطلح الحرفي المطابق للوصف الوظيفي. غيابه يخفض درجة التطابق الأولية.',
        severity: 'critical',
        targetSection: kw.category === 'tool' || kw.category === 'hard' ? 'skills' : 'experience',
        quickActionType: 'add_skill',
        suggestedText: kw.keyword,
      });
    });

    missingMedium.slice(0, 4).forEach((kw, idx) => {
      discrepancies.push({
        id: `kw-med-${idx}`,
        category: 'missing_keyword',
        categoryLabel: 'كلمة مفتاحية موصى بها',
        title: `الكلمة المفتاحية: «${kw.keyword}» غير مدمجة`,
        currentValue: 'غير مذكورة صراحة في محتوى السيرة.',
        recommendedValue: `دمج كلمة «${kw.keyword}» لتعزيز قوة المطابقة في الفرز الثانوي.`,
        explanation: 'تساعد هذه الكلمات الإضافية في تمييز ملفك عن بقية المرشحين عند فلترة مسؤولي الموارد البشرية.',
        severity: 'warning',
        targetSection: 'skills',
        quickActionType: 'add_skill',
        suggestedText: kw.keyword,
      });
    });
  }

  // 2. Weak Verbs in Experience Bullets (الأفعال الضعيفة أو المبنية للمجهول)
  const weakVerbRegex = /^(ساعدتُ?\s+في|ساعد\s+في|عملتُ?\s+على|عمل\s+على|كنت\s+مسؤولاً?\s+عن|شاركتُ?\s+في|شارك\s+في|حاولتُ?|قمتُ?\s+بـ?|helped\s+with|worked\s+on|responsible\s+for|assisted\s+in|participated\s+in)\b/i;

  let weakVerbFoundCount = 0;
  resume.experiences.forEach((exp, expIdx) => {
    exp.bullets.forEach((bullet, bIdx) => {
      const match = bullet.match(weakVerbRegex);
      if (match && weakVerbFoundCount < 4) {
        weakVerbFoundCount++;
        const matchedVerb = match[0];
        discrepancies.push({
          id: `verb-${expIdx}-${bIdx}`,
          category: 'weak_verb',
          categoryLabel: 'فعل مبني للمجهول / روتيني ضعيف',
          title: `استخدام الفعل الضعيف «${matchedVerb}» في خبرة (${exp.company})`,
          currentValue: `«${bullet.length > 75 ? bullet.slice(0, 72) + '...' : bullet}»`,
          recommendedValue: 'ابدأ بنقطة قيادية مباشرة وقوية، مثل: «قاد»، «طوّر»، «هندس»، «حقّق»، «أدار»، «قلّص».',
          explanation: 'توصيات ATS تؤكد أن مسؤولي التوظيف وخوارزميات الفرز تعطي وزناً أعلى لنقاط الخبرة التي تبدأ بأفعال عمل قيادية (Action Verbs) توضح الأثر الفردي بدلاً من المساندة السلبية.',
          severity: 'warning',
          targetSection: 'experience',
          quickActionType: 'replace_weak_verb',
          suggestedText: bullet.replace(weakVerbRegex, 'طوّر '),
          targetExpIndex: expIdx,
          targetBulletIndex: bIdx,
        });
      }
    });
  });

  // 3. Quantified Achievements & Metrics (البيانات الرقمية ومؤشرات الأداء القياسية)
  const metricRegex = /(\d+[%٪]|\d+\s*(ريال|دولار|ألف|مليون|ساعة|مستخدم|عميل|مشروع|فريق|ضعف)|\b\d+\b)/;
  let bulletsWithoutNumbers = 0;
  let sampleBulletWithoutMetric: { expIdx: number; bIdx: number; text: string; company: string } | null = null;

  resume.experiences.forEach((exp, expIdx) => {
    exp.bullets.forEach((bullet, bIdx) => {
      if (!metricRegex.test(bullet)) {
        bulletsWithoutNumbers++;
        if (!sampleBulletWithoutMetric) {
          sampleBulletWithoutMetric = { expIdx, bIdx, text: bullet, company: exp.company };
        }
      }
    });
  });

  if (bulletsWithoutNumbers > 2 && sampleBulletWithoutMetric) {
    discrepancies.push({
      id: 'metric-missing',
      category: 'missing_metrics',
      categoryLabel: 'غياب الأرقام والنسب المئوية (Quantifiable Impact)',
      title: `${bulletsWithoutNumbers} نقاط خبرة تفتقر إلى أرقام ونتائج قياسية محددة`,
      currentValue: `مثال في (${sampleBulletWithoutMetric.company}): «${sampleBulletWithoutMetric.text.slice(0, 65)}...»`,
      recommendedValue: 'إضافة نسبة مئوية (مثل: بنسبة 25%) أو توفير مالي أو حجم الفريق أو عدد المستخدمين.',
      explanation: 'وفق معايير التوظيف الحديثة (XYZ Formula من Google)، فإن كل إنجاز يجب أن يتضمن: ما فعلته + كيف قسته + النتيجة الرقمية.',
      severity: 'warning',
      targetSection: 'experience',
      quickActionType: 'add_metric_example',
      suggestedText: 'مما رفع كفاءة العمليات بنسبة 35% وخفض التكاليف التشغيلية.',
      targetExpIndex: sampleBulletWithoutMetric.expIdx,
      targetBulletIndex: sampleBulletWithoutMetric.bIdx,
    });
  }

  // 4. Professional Summary Density (الملخص المهني ومطابقة المسمى الوظيفي)
  const summary = resume.summary || '';
  const wordCount = summary.trim().split(/\s+/).length;

  if (wordCount < 18) {
    discrepancies.push({
      id: 'summary-too-short',
      category: 'summary_structure',
      categoryLabel: 'الملخص المهني (Professional Summary)',
      title: 'الملخص المهني قصير جداً أو يفتقر إلى كلمات الوصف المفتاحية',
      currentValue: summary ? `يتكون من ${wordCount} كلمة فقط.` : 'الملخص فارغ حالياً.',
      recommendedValue: 'صياغة ملخص مركز من 3 إلى 5 أسطر (35 - 60 كلمة) يبرز سنوات الخبرة والمسمى المستهدف وأقوى 3 مهارات.',
      explanation: 'الملخص المهني هو أول ما تقرأه خوارزميات ATS لاستخلاص التخصص والسنوات وسياق الخبرة القيادية.',
      severity: 'critical',
      targetSection: 'summary',
      quickActionType: 'improve_summary',
      suggestedText: `${resume.personalInfo.jobTitle || 'مهندس محترف'} ذو خبرة مثبتة في تحقيق نتائج نوعية، متخصص في إدارة المشاريع وتطبيق أفضل الممارسات المعتمدة لتحقيق عوائد أداء قياسية.`,
    });
  } else if (wordCount > 90) {
    discrepancies.push({
      id: 'summary-too-long',
      category: 'summary_structure',
      categoryLabel: 'الملخص المهني (Professional Summary)',
      title: 'الملخص المهني طويل وقد يتجاوز معيار الفرز السريع',
      currentValue: `يتكون من ${wordCount} كلمة، مما قد يستهلك مساحة الصفحة الأولى.`,
      recommendedValue: 'اختصار الملخص إلى 40-60 كلمة مركزة لتجنب إطالة الصفحة والتركيز على الكلمات المفتاحية المؤثرة.',
      explanation: 'يقضي مسؤولو التوظيف 6 ثوانٍ في المسح الأولي؛ الإيجاز والتركيز هما المعيار الذهبي.',
      severity: 'tip',
      targetSection: 'summary',
    });
  }

  // 5. Skills Distribution & Categorization (توزيع المهارات)
  const totalSkillsCount =
    (resume.skills.technical?.length || 0) +
    (resume.skills.tools?.length || 0) +
    (resume.skills.soft?.length || 0);

  if (totalSkillsCount < 8) {
    discrepancies.push({
      id: 'skills-count-low',
      category: 'education_skills',
      categoryLabel: 'تنوع وتصنيف المهارات (Skills Section)',
      title: 'عدد المهارات المصنفة في السيرة أقل من المعدل الموصى به (10-15 مهارة)',
      currentValue: `إجمالي المهارات الحالية: ${totalSkillsCount} مهارات فقط.`,
      recommendedValue: 'إضافة المزيد من الأدوات التقنية والأنظمة والمهارات التحليلية لتغطية أسئلة الفلترة في أنظمة ATS.',
      explanation: 'تقوم أنظمة ATS بمطابقة خانة المهارات بشكل آلي مع استمارة التقديم ومعايير الوظيفة.',
      severity: 'warning',
      targetSection: 'skills',
    });
  }

  // 6. ATS Recommendations from LLM (توصيات ATS الصادرة من الفحص إن وجدت)
  if (atsReview?.atsRecommendations && atsReview.atsRecommendations.length > 0) {
    atsReview.atsRecommendations.slice(0, 2).forEach((rec, idx) => {
      discrepancies.push({
        id: `ats-rec-${idx}`,
        category: 'ats_format',
        categoryLabel: 'توصية نظام الفرز الآلي',
        title: `توصية ATS خاصة: ${rec.split(':')[0] || 'تحسين التوافق'}`,
        currentValue: 'ملاحظة تم رصدها أثناء فحص التوافق الوظيفي.',
        recommendedValue: rec,
        explanation: 'معالجة هذه التوصية يرفع من فرص قبول الملف لدى أنظمة التوظيف العالمية مثل Workday و Taleo و Greenhouse.',
        severity: 'tip',
        targetSection: 'general',
      });
    });
  }

  // Calculate Health Score based on discrepancies
  const criticalCount = discrepancies.filter((d) => d.severity === 'critical').length;
  const warningCount = discrepancies.filter((d) => d.severity === 'warning').length;
  const tipsCount = discrepancies.filter((d) => d.severity === 'tip').length;

  let baseScore = 100;
  baseScore -= criticalCount * 14;
  baseScore -= warningCount * 6;
  baseScore -= tipsCount * 2;
  const atsHealthScore = Math.max(35, Math.min(100, baseScore));

  // Alignment percentages
  const totalKeywords = atsReview?.totalKeywords || 10;
  const matchedKeywords = atsReview?.matchedKeywordsCount || Math.max(6, totalKeywords - discrepancies.filter((d) => d.category === 'missing_keyword').length);
  const keywordAlignmentPercent = Math.min(100, Math.round((matchedKeywords / Math.max(1, totalKeywords)) * 100));

  const totalBullets = resume.experiences.reduce((acc, e) => acc + e.bullets.length, 0);
  const quantifiedBullets = totalBullets - bulletsWithoutNumbers;
  const quantificationAlignmentPercent = totalBullets > 0 ? Math.min(100, Math.round((quantifiedBullets / totalBullets) * 100)) : 70;

  const actionVerbStrengthPercent = totalBullets > 0 ? Math.max(40, Math.round(((totalBullets - weakVerbFoundCount) / totalBullets) * 100)) : 85;

  return {
    discrepancies,
    totalDiscrepancies: discrepancies.length,
    criticalCount,
    warningCount,
    tipsCount,
    atsHealthScore,
    alignmentSummary: {
      keywordAlignmentPercent,
      quantificationAlignmentPercent,
      actionVerbStrengthPercent,
      structuralReadabilityPercent: wordCount >= 20 && wordCount <= 80 ? 95 : 75,
    },
  };
}
