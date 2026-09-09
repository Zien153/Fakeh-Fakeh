export interface SampleProfile {
  id: string;
  label: string;
  iconName: string;
  targetJobTitle: string;
  targetCompany: string;
  targetJobDescription: string;
  rawUserInfo: {
    fullName: string;
    phone: string;
    email: string;
    location: string;
    linkedin: string;
    portfolio?: string;
    rawNotes: string;
  };
}

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    id: 'software-engineer',
    label: 'مهندس برمجيات أول (Full Stack)',
    iconName: 'Code',
    targetJobTitle: 'Senior Full Stack Engineer',
    targetCompany: 'تطبيق سلاسة التقني (Salasa Tech)',
    targetJobDescription: `نبحث عن مهندس برمجيات أول (Senior Full Stack Engineer) للانضمام لفريق الهندسة الرقمية في الرياض.
المسؤوليات الرئيسية:
- قيادة تصميم وتطوير بنية التطبيقات السحابية باستخدام React, TypeScript, Node.js و PostgreSQL.
- تحسين أداء استجابة واجهات المستخدم وزمن تحميل الصفحات بنسبة لا تقل عن 40%.
- تطبيق أفضل ممارسات CI/CD، وهندسة الخدمات المصغرة (Microservices Architecture).
- قيادة ومراجعة كود المطورين الأصغر وتوجيه الفريق التقني.
- التكامل مع بوابات الدفع الإلكترونية السريعة وإدارة تدفق البيانات عبر Redis و Docker.
المؤهلات المطلوبة:
- خبرة 5+ سنوات في تطوير تطبيقات الويب عالية الحمل (High-traffic).
- إتقان تام لـ TypeScript, Next.js, Node.js, RESTful APIs, GraphQL, Docker, AWS.
- مهارات قوية في حل المشكلات، تحسين أداء قواعد البيانات، والتواصل الفعال.`,
    rawUserInfo: {
      fullName: 'أحمد بن خالد التميمي',
      phone: '+966 55 123 4567',
      email: 'ahmed.altamimi@example.com',
      location: 'الرياض، المملكة العربية السعودية',
      linkedin: 'linkedin.com/in/ahmed-altamimi',
      portfolio: 'github.com/ahmed-dev',
      rawNotes: `أنا مبرمج شاطر واشتغلت في كذا شركة.
الخبرة:
1. مطور برمجيات في شركة نماء الرقمية (2022 - حتى الآن):
- بنيت واجهات ولوحات تحكم بالرياكت
- ساعدت في تحسين سرعة التطبيق عشان المستخدمين كانوا يشتكون
- كنت اسوي مراجعة للكود مع الشباب وكتبت اختبارات
- ربطنا بوابات دفع مثل مدى وApple Pay واستخدمنا دوكر
- حسنا سرعة تحميل الصفحات وصارت سريعة جداً وحوالي 45% أسرع والعملاء زادوا 30%
2. مبرمج ويب في أفق الحلول (2019 - 2022):
- برمجة مواقع وتطبيقات بالـ Node.js و Express و PostgreSQL
- بنيت APIs وربطتها مع قواعد البيانات
- دربت 4 متدربين جدد على الجافاسكريبت
- خفضنا أخطاء السيرفر بنسبة كبيرة من خلال إعادة هيكلة الكود

التعليم:
بكالوريوس علوم حاسب - جامعة الملك سعود (2015 - 2019) بمعدل ممتاز

المهارات:
جافاسكريبت، تايب سكريبت، رياكت، نود جي اس، بوستجرس، دوكر، حل المشاكل، العمل الجماعي، AWS، Redis`,
    },
  },
  {
    id: 'digital-marketing',
    label: 'مدير تسويق رقمي ونمو (Growth Lead)',
    iconName: 'TrendingUp',
    targetJobTitle: 'Growth & Performance Marketing Lead',
    targetCompany: 'منصة جاهز / وصل الرقمية',
    targetJobDescription: `المطلوب: قائد تسويق رقمي ونمو (Growth & Digital Marketing Lead)
المهام:
- إدارة ميزانيات الحملات الإعلانية المدفوعة على Google Ads, Meta, TikTok بقيمة تفوق 500,000 ريال شهرياً.
- خفض تكلفة الاستحواذ على العميل (CAC) بنسبة لا تقل عن 25% مع رفع العائد على الإنفاق الإعلاني (ROAS).
- قيادة اختبارات A/B Testing وتحسين مسارات التحويل (Funnel Optimization) ومعدلات التحويل (CRO).
- بناء وتوجيه فريق التسويق الرقمي وتوليد التحليلات باستخدام GA4, Adjust, Mixpanel.
- قيادة استراتيجيات إعادة الاستهداف واستبقاء العملاء (Retention & LTV).
المتطلبات:
- خبرة لا تقل عن 4 سنوات في قطاع التجارة الإلكترونية أو تطبيقات التوصيل.
- إتقان أدوات التحليل المتقدم، وإدارة الميزانيات الكبيرة وتحقيق نمو سريع.`,
    rawUserInfo: {
      fullName: 'سارة عبد الله المنصور',
      phone: '+966 50 987 6543',
      email: 'sara.almansoor@example.com',
      location: 'جدة، المملكة العربية السعودية',
      linkedin: 'linkedin.com/in/sara-almansoor',
      portfolio: 'saramarketing.me',
      rawNotes: `اشتغلت مسؤولة تسويق ونمو.
الخبرة:
1. رئيسة قسم التسويق الرقمي في متجر رونق (2021 - الآن):
- أدرت حملات سناب شات وتيك توك وقوقل بميزانية شهرية تتجاوز 400 ألف ريال
- نزلنا تكلفة الاستحواذ CAC من 60 ريال إلى 38 ريال
- رفعنا ROAS إلى 4.2x ومبيعات المتجر زادت 65% خلال سنة
- سويت تجارب A/B على صفحات الهبوط ورفعنا نسبة التحويل بنسبة 35%
- أدرت فريق مكون من 5 مسوقين ومصممين
2. أخصائية تسويق إلكتروني في وكالة ميديا بلس (2018 - 2021):
- إدارة حسابات السوشيال ميديا وعمل إعلانات مدفوعة لـ 12 عميل
- تحسين مسارات البيع وتحليل البيانات باستخدام Google Analytics
- كتابة محتوى إعلاني ساهم في زيادة المبيعات بنسبة 40%

التعليم:
بكالوريوس إدارة أعمال - مسار تسويق، جامعة الملك عبد العزيز (2014 - 2018)

المهارات:
Google Ads, Meta Ads, TikTok Ads, Google Analytics 4, Mixpanel, A/B Testing, CAC Optimization, ROAS, إتقان العربية والإنجليزية`,
    },
  },
  {
    id: 'product-manager',
    label: 'مدير منتج رقمي (Product Manager)',
    iconName: 'Layers',
    targetJobTitle: 'Digital Product Manager',
    targetCompany: 'شركة التقنية المالية (FinTech Corp)',
    targetJobDescription: `نبحث عن مدير منتج رقمي (Digital Product Manager) لقيادة تطوير منتجات المحفظة الرقمية والمدفوعات.
المسؤوليات:
- قيادة دورة حياة المنتج الرقمي من الفكرة حتى الإطلاق باستخدام منهجية Agile / Scrum.
- تحليل بيانات المستخدمين ومؤشرات الأداء الرئيسية (NPS, MAU, Churn Rate) لاتخاذ قرارات قائمة على البيانات.
- مواءمة متطلبات أصحاب المصلحة (Stakeholders) مع فرق التصميم UI/UX والهندسة البرمجية.
- إعداد خارطة طريق المنتج (Product Roadmap) ووثائق مواصفات المنتج (PRDs).
- تحسين معدل تنشيط المستخدمين الجدد (User Activation) وتخفيض نسبة التراجع.
المتطلبات:
- خبرة 3-6 سنوات في إدارة المنتجات الرقمية ويفضل في قطاع FinTech أو SaaS.
- مهارات قيادية، إتقان أدوات Jira, Figma, Mixpanel, SQL.`,
    rawUserInfo: {
      fullName: 'عمر فهد السبيعي',
      phone: '+966 54 321 0987',
      email: 'omar.alsubaie@example.com',
      location: 'الدمام، المملكة العربية السعودية',
      linkedin: 'linkedin.com/in/omar-subaie',
      portfolio: '',
      rawNotes: `مدير منتج شغوف بالتطبيقات الرقمية.
الخبرة:
1. مدير منتج في حلول فنتك (2021 - الآن):
- أطلقت ميزة المدفوعات الفورية وخدمة الدفع بالتقسيط
- زاد عدد المستخدمين النشطين شهرياً MAU بنسبة 85% ليصل إلى 350,000 مستخدم
- خفضنا Churn Rate من 8% إلى 3.2% عن طريق تحسين تجربة التسجيل الأولى
- قمت بكتابة PRDs لـ 15 ميزة وقودت فريق سكروم مكون من 8 مهندسين ومصممين
2. مساعد مدير منتج في تك زون (2019 - 2021):
- شاركت في جمع متطلبات العملاء وأجريت أكثر من 50 مقابلة بحث مستخدم
- تعاونت مع فرق المبيعات والدعم الفني ورفعت رضا العملاء NPS بمقدار 22 نقطة

التعليم:
بكالوريوس نظم معلومات إدارية (MIS) - جامعة الملك فهد للبترول والمعادن (2015 - 2019)

المهارات:
Agile, Scrum, Jira, Figma, PRD Writing, Data Analysis, SQL, Stakeholder Management, قيادة الفرق`,
    },
  },
];
