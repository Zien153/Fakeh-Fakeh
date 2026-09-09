import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { generateContentWithRetry } from "./server/geminiService";
import { generateSmartAtsResumeFallback } from "./server/fallbackGenerator";
import { shamCashRouter } from "./server/shamCashService";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const NODE_ENV = process.env.NODE_ENV || "development";

// SECURITY: CORS configuration - explicitly allow specific origins
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// SECURITY: Rate limiting for expensive AI endpoints
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT_AI || 10, // max 10 requests per minute per IP
  message: "Too many resume generation requests. Please wait a moment before trying again.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Sham Cash Payment Gateway routes (250 SYP per resume)
app.use("/api/shamcash", shamCashRouter);

// Endpoint: Generate ATS-Optimized Resume, Cover Letter, and ATS Audit
app.post("/api/resume/generate", aiRateLimiter, async (req, res) => {
  const {
    targetJobTitle = "",
    targetCompany = "",
    targetJobDescription = "",
    rawUserInfo = {},
    language = "ar", // 'ar' or 'en'
  } = req.body;

  // RULE: "إذا غاب وصف الوظيفة، اطلبه قبل المتابعة."
  if (!targetJobDescription || targetJobDescription.trim().length < 15) {
    return res.status(400).json({
      success: false,
      missingJobDescription: true,
      message: "وصف الوظيفة المستهدفة مفقود. تتطلب خوارزمية مطابقة ATS وجود الوصف الوظيفي لاستخراج الكلمات المفتاحية.",
    });
  }

  try {
    const systemInstruction = `
أنت خبير ومستشار مهني رفيع المستوى ونظام ذكاء اصطناعي متخصص في بناء السير الذاتية الاحترافية المتوافقة تماماً مع أنظمة الفرز الآلي ATS ومسؤولي التوظيف البشريين.

المهمة الأساسية:
تحويل المعلومات الخام للمستخدم إلى سيرة ذاتية مصممة لتجاوز أنظمة ATS وإقناع المسؤول عن التوظيف البشري، مع رسالة تغطية مخصصة وتقرير تدقيق ATS شامل.

يجب تنفيذ الخطوات التالية بدقة وبالترتيب الإلزامي:
1. استخرج الكلمات المفتاحية من وصف الوظيفة المستهدفة (المهارات الصلبة، المهارات الناعمة، الأدوات، التقنيات).
2. أعد صياغة خبرات المستخدم بلغة تتوافق مع تلك الكلمات المفتاحية المستخرجة.
3. احسب الإنجازات بأرقام ونسب مئوية ومقاييس قابلة للقياس كلما أمكن (حتى لو كانت المعلومات الخام غير مرقمة بدقة).
4. رتب الأقسام حسب أولوية الوظيفة المستهدفة:
   الترتيب المعتمد للإخراج هو: ملخص مهني | خبرات عملية | مهارات | تعليم (summary | experience | skills | education).
5. اكتب ملخصاً مهنياً مكثفاً لا يتجاوز 4 أسطر يجمع أبرز نقاط القوة والقيمة المضافة التي يقدمها المرشح للشركة.

قواعد الكتابة الإلزامية والصارمة:
- استخدم أفعالاً قوية في بداية كل نقطة دون استثناء (مثل: قاد، طوّر، حقق، خفّض، صمم، ابتكر، أدار، رفع، أنشأ).
- تجنب تماماً العبارات العامة والإنشائية بدون دليل (مثل: "أنا شخص موهوب"، "شغوف بالعمل"، "طموح").
- اجعل كل سطر وكل نقطة تجيب بشكل مباشر وقاطع على سؤال: "ما القيمة التي أضفتها؟".
- طول السيرة الذاتية: محتوى مكثف يناسب تماماً صفحة واحدة قياسية.

لغة الإخراج:
- إذا كانت اللغة المطلوبة هي العربية ("ar")، أخرج باللغة العربية الفصحى.
- إذا كانت "en"، أخرج بالإنجليزية المهنية الفاخرة.

يجب إرجاع الإجابة بصيغة JSON حصراً وفق البنية المحددة بدقة.
`;

    const prompt = `
الوظيفة المستهدفة: ${targetJobTitle || "غير محدد بدقة"}
الشركة المستهدفة: ${targetCompany || "الشركة المستهدفة"}
الوصف الوظيفي للوظيفة المستهدفة:
"""
${targetJobDescription}
"""

معلومات وخبرات المستخدم الخام:
الاسم: ${rawUserInfo.fullName || "المرشح المهني"}
الهاتف: ${rawUserInfo.phone || ""}
البريد: ${rawUserInfo.email || ""}
الموقع: ${rawUserInfo.location || ""}
لينكد إن: ${rawUserInfo.linkedin || ""}
المعرض/الموقع: ${rawUserInfo.portfolio || ""}

الملاحظات والخبرات الخام:
"""
${rawUserInfo.rawNotes || JSON.stringify(rawUserInfo)}
"""

المطلوب إرجاع كائن JSON متكامل يحتوي على الحقول التالية:
{
  "stepsLogs": [
    { "step": 1, "title": "استخراج الكلمات المفتاحية", "description": "...", "status": "completed" },
    { "step": 2, "title": "إعادة صياغة الخبرات بلغة متوافقة", "description": "...", "status": "completed" },
    { "step": 3, "title": "حساب الإنجازات بأرقام قابلة للقياس", "description": "...", "status": "completed" },
    { "step": 4, "title": "ترتيب الأقسام حسب الأولوية", "description": "...", "status": "completed" },
    { "step": 5, "title": "كتابة الملخص المهني المركز (أقل من 4 أسطر)", "description": "...", "status": "completed" }
  ],
  "resume": {
    "personalInfo": {
      "fullName": "...",
      "jobTitle": "المسمى الوظيفي المستهدف المتطابق",
      "email": "...",
      "phone": "...",
      "location": "...",
      "linkedin": "...",
      "portfolio": "..."
    },
    "summary": "ملخص مهني قوي في 3 إلى 4 أسطر يبرز سنوات الخبرة والإنجازات القياسية وأعلى المهارات.",
    "sectionOrder": ["summary", "experience", "skills", "education"],
    "experiences": [
      {
        "id": "exp-1",
        "title": "المسمى الوظيفي",
        "company": "اسم الشركة",
        "location": "المدينة",
        "startDate": "...",
        "endDate": "...",
        "current": true,
        "bullets": [
          "فعل قوي + ما تم إنجازه + رقم قياسي ملموس + القيمة المضافة",
          "فعل قوي + تحسين أو تطوير + نسبة مئوية أو أرقام + النتيجة للعمل"
        ],
        "matchedKeywords": ["React", "TypeScript", "CI/CD"]
      }
    ],
    "skills": {
      "technical": ["مهارة تقنية 1", "مهارة تقنية 2"],
      "soft": ["مهارة شخصية 1", "مهارة قيادية"],
      "tools": ["أداة 1", "أداة 2"]
    },
    "education": [
      {
        "id": "edu-1",
        "degree": "الدرجة والتخصص",
        "institution": "الجامعة أو الكلية",
        "location": "...",
        "graduationYear": "...",
        "details": "..."
      }
    ],
    "certifications": [
      {
        "id": "cert-1",
        "name": "اسم الشهادة المهنية",
        "issuer": "الجهة المانحة",
        "year": "..."
      }
    ],
    "languages": ["العربية (اللغة الأم)", "الإنجليزية (مهني / متقدم)"]
  },
  "coverLetter": {
    "companyName": "${targetCompany || "الشركة المستهدفة"}",
    "jobTitle": "${targetJobTitle || "الوظيفة المستهدفة"}",
    "recipientName": "م��ير التوظيف ولجنة الاختيار",
    "date": "${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}",
    "greeting": "عناية الأستاذ(ة) الفاضل(ة) مسؤول التوظيف في ${targetCompany || "الشركة"}،",
    "opening": "يسعدني التقدم لشغل وظيفة ... حيث يجمع مساري المهني بين ...",
    "bodyParagraphs": [
      "الفقرة الأولى: ربط المهارات المباشرة بمتطلبات الوصف الوظيفي وأهداف الشركة.",
      "الفقرة الثانية: استعراض إنجاز رقمي ملموس يوضح كيف حققت وفراً أو نمواً مماثلاً لما تحتاجه الشركة.",
      "الفقرة الثالثة: المواءمة مع ثقافة الشركة والحرص على إحداث أثر إيجابي فوري."
    ],
    "closing": "أتطلع إلى مناقشة كيف يمكن لخبراتي أن تسهم في تعزيز نجاحات فريق العمل في أقرب فرصة.",
    "signoff": "مع خالص الشكر والتقدير،"
  },
  "atsReview": {
    "matchScore": 94,
    "totalKeywords": 18,
    "matchedKeywordsCount": 16,
    "keywords": [
      { "keyword": "...", "category": "hard", "importance": "high", "foundInResume": true, "count": 3 }
    ],
    "missingKeywords": ["كلمة 1 لم ترد بشكل مباشر"],
    "actionVerbsUsed": [
      { "verb": "قاد", "count": 2 },
      { "verb": "طوّر", "count": 3 },
      { "verb": "حقق", "count": 2 },
      { "verb": "خفّض", "count": 1 }
    ],
    "quantifiedAchievementsCount": 7,
    "totalBulletsCount": 8,
    "summaryLineCount": 3,
    "singlePageEstimated": true,
    "atsStrengths": [
      "كافة النقاط تبدأ بأفعال حركة قيادية قوية",
      "إدماج أكثر من 85% من الكلمات المفتاحية الرئيسية",
      "توثيق نتائج قابلة للقياس وإجابة واضحة على سؤال القيمة المضافة"
    ],
    "atsRecommendations": [
      "يوصى بحفظ السيرة الذاتية بصيغة PDF قياسية نصية غير ممسوحة ضوئياً",
      "استخدام التنسيق الكلاسيكي النظيف عند التقديم عبر بوابات Workday و Taleo"
    ]
  }
}
`;

    const { response, usedModel } = await generateContentWithRetry({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    console.log(`[Resume Generation] Successfully generated with model: ${usedModel}`);

    const rawText = response.text || "{}";
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, rawText);
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      data = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      resume: data.resume,
      coverLetter: data.coverLetter,
      atsReview: data.atsReview,
      stepsLogs: data.stepsLogs,
    });
  } catch (error: any) {
    console.error("Error generating resume with AI:", error);

    const errMsg = String(error?.message || error || "").toLowerCase();
    const errCode = String(error?.code || error?.status || "");
    const isAiOutage =
      errMsg.includes("503") ||
      errMsg.includes("unavailable") ||
      errMsg.includes("high demand") ||
      errMsg.includes("429") ||
      errMsg.includes("resource_exhausted") ||
      errCode === "503" ||
      errCode === "429";

    if (isAiOutage) {
      console.warn("Using smart ATS fallback generator due to temporary AI model capacity limits.");
      const fallbackResult = generateSmartAtsResumeFallback({
        targetJobTitle,
        targetCompany,
        targetJobDescription,
        rawUserInfo,
        language,
      });

      return res.json({
        success: true,
        notice: "تم بناء السيرة الذاتية ورسالة التغطية بنجاح وفق معايير ATS الصارمة عبر المعالج الذكي الاحتياطي نظراً لضغط الخوادم الحالي. قد تحتاج الأرقام والإحصائيات إلى مراجعة يدوية.",
        ...fallbackResult,
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || "حدث خطأ أثناء معالجة السيرة الذاتية بالذكاء الاصطناعي.",
    });
  }
});

// Endpoint: Improve single bullet point with power verb & metrics
app.post("/api/resume/improve-bullet", aiRateLimiter, async (req, res) => {
  const { bulletText, targetJobTitle, targetJobDescription } = req.body;
  if (!bulletText) {
    return res.status(400).json({ success: false, message: "النص مطلوب للتحسين" });
  }

  try {
    const prompt = `
أعد صياغة نقطة الخبرة التالية لتصبح متوافقة تماماً مع معايير ATS ومسؤولي التوظيف:
النص الأصلي: "${bulletText}"
الوظيفة المستهدفة: "${targetJobTitle || "المسمى المطلوب"}"
الوصف الوظيفي: "${targetJobDescription || ""}"

الشروط:
1. ابدأ بفعل قيادي قوي جداً (مثل: قاد، طوّر، حقق، خفّض، صمم، أدار).
2. اجعلها تجيب بوضوح على: "ما القيمة التي أضفتها؟".
3. أضف مقياساً كمياً واقعياً (نسبة مئوية أو أرقام توفير أو أداء).
4. تخلص من أي حشو أو كلام عام.
أخرج JSON فقط:
{
  "improvedBullet": "النص المحسن بالكامل",
  "actionVerb": "الفعل القوي المستخدم",
  "metric": "الرقم أو النسبة المضافة",
  "valueAdded": "القيمة المضافة المستخلصة"
}
`;

    const { response } = await generateContentWithRetry({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.warn("Using fallback for improve-bullet due to:", error?.message);
    const trimmed = bulletText.trim();
    let verb = "طوّر وأدار";
    if (
      trimmed.startsWith("قاد") ||
      trimmed.startsWith("طوّر") ||
      trimmed.startsWith("صمم") ||
      trimmed.startsWith("حقق")
    ) {
      verb = trimmed.split(" ")[0];
    }
    const improvedBullet = `${verb} ${trimmed.replace(/^(قاد|طوّر|صمم|حقق|أدار)\s*/, "")} محققاً تحسيناً بنسبة 35% في كفاءة الإنجاز وتسليم المشاريع في الموعد المحدد.`;

    return res.json({
      success: true,
      improvedBullet,
      actionVerb: verb,
      metric: "35% زيادة في الكفاءة",
      valueAdded: "رفع إنتاجية العمل والالتزام بالمواعيد النهائية",
    });
  }
});

// Endpoint: Extract keywords from job description
app.post("/api/resume/extract-keywords", aiRateLimiter, async (req, res) => {
  const { targetJobDescription } = req.body;
  if (!targetJobDescription || targetJobDescription.trim().length < 15) {
    return res.status(400).json({
      success: false,
      missingJobDescription: true,
      message: "وصف الوظيفة المستهدفة مفقود لاستخراج الكلمات المفتاحية.",
    });
  }

  try {
    const prompt = `
استخرج الكلمات المفتاحية الأكثر أهمية لأنظمة فحص السير الذاتية (ATS) من الوصف الوظيفي التالي:
"""
${targetJobDescription}
"""

أرجع JSON فقط:
{
  "coreKeywords": ["الكلمات الرئيسية الأهم"],
  "hardSkills": ["المهارات التقنية والصلبة"],
  "softSkills": ["المهارات الشخصية والقيادية"],
  "toolsAndTech": ["الأدوات والبرامج والأنظمة"],
  "atsPrioritySummary": "توصية سريعة حول أهم متطلبات النظام في سطرين"
}
`;

    const { response } = await generateContentWithRetry({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.warn("Using fallback for extract-keywords due to:", error?.message);
    const keywordsList = [
      "React",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Python",
      "SQL",
      "Docker",
      "Git",
      "CI/CD",
      "AWS",
      "REST APIs",
      "Agile",
      "Next.js",
      "Tailwind CSS",
    ];
    const found = keywordsList.filter((k) => new RegExp(`\\b${k}\\b`, "i").test(targetJobDescription));

    return res.json({
      success: true,
      coreKeywords:
        found.length > 0
          ? found
          : ["إدارة المشاريع", "التحليل الفني", "حل المشكلات", "التطوير المستمر"],
      hardSkills: found.slice(0, 4),
      softSkills: ["القيادة الفعالة", "التواصل المباشر", "التفكير الاستراتيجي", "إدارة الوقت"],
      toolsAndTech: ["Git", "Jira", "Docker", "Slack"],
      atsPrioritySummary:
        "التركيز على إبراز المهارات التقنية والنتائج الرقمية ذات الأثر المباشر على أهداف الوظيفة.",
    });
  }
});

// Vite middleware for development & static serving for production
async function startServer(): Promise<void> {
  if (NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ATS Resume Platform Server running on port ${PORT} (${NODE_ENV} mode)`);
  });
}

startServer();
