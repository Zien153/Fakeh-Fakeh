import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { z } from "zod";
import { generateContentWithRetry } from "./server/geminiService";
import { generateSmartAtsResumeFallback } from "./server/fallbackGenerator";
import { shamCashRouter } from "./server/shamCashService";
import {
  ResumeGenerationRequestSchema,
  ImproveBulletRequestSchema,
  ExtractKeywordsRequestSchema,
  handleValidationError,
} from "./server/validation/schemas";
import { validateRequest } from "./server/validation/middleware";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const NODE_ENV = process.env.NODE_ENV || "development";

// SECURITY: CORS configuration
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
  max: process.env.RATE_LIMIT_AI ? parseInt(process.env.RATE_LIMIT_AI, 10) : 10,
  message: "Too many resume generation requests. Please wait a moment before trying again.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Sham Cash Payment Gateway routes
app.use("/api/shamcash", shamCashRouter);

// Endpoint: Generate ATS-Optimized Resume
app.post(
  "/api/resume/generate",
  aiRateLimiter,
  validateRequest(ResumeGenerationRequestSchema),
  async (req: Request, res: Response) => {
    const validated = (req as any).validated;
    const { targetJobTitle, targetCompany, targetJobDescription, rawUserInfo, language } = validated;

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
   الترتيب المعتمد للإخراج هو: ملخص مهني | خبرات عملية | مهارات | تعليم.
5. اكتب ملخصاً مهنياً مكثفاً لا يتجاوز 4 أسطر يجمع أبرز نقاط القوة والقيمة المضافة.

قواعد الكتابة الإلزامية:
- استخدم أفعالاً قوية في بداية كل نقطة (قاد، طوّر، حقق، خفّض، صمم، ابتكر، أدار، رفع، أنشأ).
- تجنب تماماً العبارات العامة والإنشائية بدون دليل.
- اجعل كل سطر يجيب على: "ما القيمة التي أضفتها؟".

لغة الإخراج:
- إذا كانت اللغة المطلوبة هي العربية ("ar")، أخرج باللغة العربية الفصحى.
- إذا كانت "en"، أخرج بالإنجليزية المهنية الفاخرة.

يجب إرجاع الإجابة بصيغة JSON حصراً.
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
  }
);

// Endpoint: Improve single bullet point
app.post(
  "/api/resume/improve-bullet",
  aiRateLimiter,
  validateRequest(ImproveBulletRequestSchema),
  async (req: Request, res: Response) => {
    const validated = (req as any).validated;
    const { bulletText, targetJobTitle, targetJobDescription } = validated;

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
أخرج JSON فقط.
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
  }
);

// Endpoint: Extract keywords from job description
app.post(
  "/api/resume/extract-keywords",
  aiRateLimiter,
  validateRequest(ExtractKeywordsRequestSchema),
  async (req: Request, res: Response) => {
    const validated = (req as any).validated;
    const { targetJobDescription } = validated;

    try {
      const prompt = `
استخرج الكلمات المفتاحية الأكثر أهمية لأنظمة فحص السير الذاتية (ATS) من الوصف الوظيفي التالي:
"""
${targetJobDescription}
"""

أرجع JSON فقط.
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
  }
);

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
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ATS Resume Platform Server running on port ${PORT} (${NODE_ENV} mode)`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
