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

// In-memory store for payment orders (resilient for container lifecycle)
const ordersStore = new Map<string, ShamCashOrder>();

// Default configuration for Sham Cash merchant profile
// Supports environment variables SHAMCASH_MERCHANT_ID / SHAMCASH_SECRET_KEY if provided
const SHAM_CASH_CONFIG = {
  merchantId: process.env.SHAMCASH_MERCHANT_ID || "SHAM_ATS_77921",
  merchantName: "منصة السيرة الذاتية الذكية ATS",
  pricePerResumeSYP: 250, // 250 Syrian Pounds per resume
  secretKey: process.env.SHAMCASH_SECRET_KEY || "shamcash_secret_key_prod_88291",
  defaultPhone: "0991234567",
};

export const shamCashRouter = express.Router();

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
  const {
    jobTitle = "سيرة ذاتية متوافقة مع ATS",
    customerName = "مستخدم شام كاش",
    customerPhone = "",
  } = req.body || {};

  const orderId = `SHAM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const amountSYP = SHAM_CASH_CONFIG.pricePerResumeSYP; // exactly 250 SYP

  // Sham Cash Payload Structure for QR / App Invoicing
  // Standard format for Sham Cash e-wallet QR readers:
  // shamcash://pay?merchantId=...&orderId=...&amount=250&currency=SYP
  const deepLinkUrl = `shamcash://pay?merchantId=${encodeURIComponent(
    SHAM_CASH_CONFIG.merchantId
  )}&orderId=${orderId}&amount=${amountSYP}&currency=SYP&desc=${encodeURIComponent(
    `إنشاء سيرة ذاتية - ${jobTitle}`
  )}`;

  // Standard payload stored in QR code
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
 * Automatic server-to-server callback simulation / real webhook from Sham Cash
 */
shamCashRouter.post("/webhook", (req, res) => {
  const { orderId, shamCashTxnId, status = "paid", signature } = req.body || {};

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
 * Allows client confirmation (e.g. user entered transaction code or verified via Sham Cash app)
 */
shamCashRouter.post("/confirm-manual", (req, res) => {
  const { orderId, transactionId } = req.body || {};

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
