import express from "express";
import crypto from "crypto";

export interface ShamCashOrder {
  orderId: string;
  amountSYP: number;
  serviceDescription: string;
  jobTitle?: string;
  customerName?: string;
  customerPhone?: string;
  status: "pending" | "paid" | "expired" | "failed";
  createdAt: string;
  paidAt?: string;
  shamCashTxnId?: string;
  qrDataString: string;
  deepLinkUrl: string;
}

// In-memory store for payment orders (should be migrated to Redis/SQLite)
const ordersStore = new Map<string, ShamCashOrder>();

// SECURITY: Configuration with mandatory env vars - no fallback defaults
const SHAM_CASH_CONFIG = {
  merchantId: process.env.SHAMCASH_MERCHANT_ID,
  merchantName: "منصة السيرة الذاتية الذكية ATS",
  pricePerResumeSYP: 250,
  secretKey: process.env.SHAMCASH_SECRET_KEY,
  defaultPhone: "0991234567",
};

// SECURITY: Validate environment variables on startup
if (!SHAM_CASH_CONFIG.secretKey || !SHAM_CASH_CONFIG.merchantId) {
  console.warn(
    "WARNING: SHAMCASH_SECRET_KEY or SHAMCASH_MERCHANT_ID not set. Payment features will not work securely."
  );
}

export const shamCashRouter = express.Router();

/**
 * SECURITY: Verify HMAC signature of webhook
 * @param body - Request body
 * @param signature - HMAC signature from request
 * @returns true if signature is valid
 */
function verifyWebhookSignature(body: any, signature: string): boolean {
  if (!SHAM_CASH_CONFIG.secretKey || !signature) {
    console.warn("Webhook verification failed: missing secret key or signature");
    return false;
  }

  // Create canonical payload string (order matters)
  const canonicalString = `${body.orderId}:${body.shamCashTxnId || ""}:${body.status || "paid"}:${SHAM_CASH_CONFIG.merchantId}`;

  // Compute HMAC-SHA256
  const expectedSignature = crypto
    .createHmac("sha256", SHAM_CASH_CONFIG.secretKey)
    .update(canonicalString)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * GET /api/shamcash/config
 * Returns current payment configuration and pricing
 */
shamCashRouter.get("/config", (req, res) => {
  res.json({
    success: true,
    pricePerResumeSYP: SHAM_CASH_CONFIG.pricePerResumeSYP,
    currency: "SYP",
    currencyAr: "ليرة سورية",
    merchantName: SHAM_CASH_CONFIG.merchantName,
    merchantId: SHAM_CASH_CONFIG.merchantId,
  });
});

/**
 * POST /api/shamcash/create-order
 * Creates a new invoice order of 250 SYP with dynamic QR code & Deep Link
 */
shamCashRouter.post("/create-order", (req, res) => {
  const { jobTitle = "سيرة ذاتية متوافقة مع ATS", customerName = "مستخدم شام كاش", customerPhone = "" } = req.body || {};

  const orderId = `SHAM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const amountSYP = SHAM_CASH_CONFIG.pricePerResumeSYP;

  const deepLinkUrl = `shamcash://pay?merchantId=${encodeURIComponent(
    SHAM_CASH_CONFIG.merchantId || ""
  )}&orderId=${orderId}&amount=${amountSYP}&currency=SYP&desc=${encodeURIComponent(`إنشاء سيرة ذاتية - ${jobTitle}`)}`;

  const qrDataString = JSON.stringify({
    provider: "ShamCash",
    merchant: SHAM_CASH_CONFIG.merchantName,
    merchantId: SHAM_CASH_CONFIG.merchantId,
    orderId,
    amount: amountSYP,
    currency: "SYP",
    desc: `سيرة ذاتية احترافية ATS (${jobTitle})`,
    timestamp: new Date().toISOString(),
  });

  const newOrder: ShamCashOrder = {
    orderId,
    amountSYP,
    serviceDescription: `سيرة ذاتية احترافية ورسالة تغطية مطابقة للـ ATS (${jobTitle})`,
    jobTitle,
    customerName,
    customerPhone,
    status: "pending",
    createdAt: new Date().toISOString(),
    qrDataString,
    deepLinkUrl,
  };

  ordersStore.set(orderId, newOrder);

  return res.json({
    success: true,
    order: newOrder,
  });
});

/**
 * GET /api/shamcash/status/:orderId
 * Check payment status of an order
 */
shamCashRouter.get("/status/:orderId", (req, res) => {
  const { orderId } = req.params;
  const order = ordersStore.get(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "طلب الدفع غير موجود.",
    });
  }

  return res.json({
    success: true,
    order,
  });
});

/**
 * POST /api/shamcash/webhook
 * SECURITY: Server-to-server webhook with HMAC signature verification
 * Rejects any webhook without valid signature
 */
shamCashRouter.post("/webhook", (req, res) => {
  const { orderId, shamCashTxnId, status = "paid", signature } = req.body || {};

  // SECURITY: Verify HMAC signature BEFORE processing
  if (!verifyWebhookSignature({ orderId, shamCashTxnId, status }, signature)) {
    console.error(`[SECURITY] Webhook signature verification failed for orderId: ${orderId}`);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid webhook signature",
    });
  }

  if (!orderId || !ordersStore.has(orderId)) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const order = ordersStore.get(orderId)!;
  order.status = status === "paid" ? "paid" : "failed";
  order.paidAt = new Date().toISOString();
  order.shamCashTxnId = shamCashTxnId || `TXN-SHAM-${Date.now()}`;

  ordersStore.set(orderId, order);

  return res.json({
    success: true,
    message: "تم تحديث حالة الدفع عبر شام كاش بنجاح.",
    order,
  });
});

/**
 * POST /api/shamcash/confirm-manual
 * SECURITY: HMAC verification required - cannot accept payment confirmation without signature
 * Client confirmation endpoint with signature verification
 */
shamCashRouter.post("/confirm-manual", (req, res) => {
  const { orderId, transactionId, signature } = req.body || {};

  // SECURITY: Verify signature for client-initiated confirmation
  if (!verifyWebhookSignature({ orderId, shamCashTxnId: transactionId, status: "paid" }, signature)) {
    console.error(`[SECURITY] Manual confirmation signature verification failed for orderId: ${orderId}`);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid confirmation signature",
    });
  }

  if (!orderId || !ordersStore.has(orderId)) {
    return res.status(404).json({
      success: false,
      message: "طلب الدفع غير موجود.",
    });
  }

  const order = ordersStore.get(orderId)!;
  order.status = "paid";
  order.paidAt = new Date().toISOString();
  order.shamCashTxnId = transactionId || `SHAM-APP-${Date.now()}`;

  ordersStore.set(orderId, order);

  return res.json({
    success: true,
    message: "تم تأكيد عملية الدفع عبر شام كاش بنجاح.",
    order,
  });
});
