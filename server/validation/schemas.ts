import { z } from 'zod';

/**
 * Server-side validation schemas using Zod
 * Prevents invalid data from reaching business logic
 */

// Resume generation request validation
export const ResumeGenerationRequestSchema = z.object({
  targetJobTitle: z.string().min(1, 'Job title is required').max(200),
  targetCompany: z.string().min(1, 'Company name is required').max(200),
  targetJobDescription: z.string().min(15, 'Job description must be at least 15 characters'),
  language: z.enum(['ar', 'en']).default('ar'),
  rawUserInfo: z.object({
    fullName: z.string().min(1).max(200),
    email: z.string().email().or(z.string().length(0)),
    phone: z.string().max(20).or(z.string().length(0)),
    location: z.string().max(200).or(z.string().length(0)),
    linkedin: z.string().url().or(z.string().length(0)),
    portfolio: z.string().url().or(z.string().length(0)),
    rawNotes: z.string().max(5000),
  }),
});

export type ResumeGenerationRequest = z.infer<typeof ResumeGenerationRequestSchema>;

// Bullet point improvement request
export const ImproveBulletRequestSchema = z.object({
  bulletText: z.string().min(5, 'Bullet text is required').max(500),
  targetJobTitle: z.string().max(200),
  targetJobDescription: z.string().max(5000),
});

export type ImproveBulletRequest = z.infer<typeof ImproveBulletRequestSchema>;

// Keyword extraction request
export const ExtractKeywordsRequestSchema = z.object({
  targetJobDescription: z.string().min(15, 'Job description must be at least 15 characters').max(5000),
});

export type ExtractKeywordsRequest = z.infer<typeof ExtractKeywordsRequestSchema>;

// Payment webhook validation
export const PaymentWebhookSchema = z.object({
  orderId: z.string().min(1),
  shamCashTxnId: z.string().optional(),
  status: z.enum(['paid', 'failed']).default('paid'),
  signature: z.string().min(1, 'Signature is required'),
});

export type PaymentWebhook = z.infer<typeof PaymentWebhookSchema>;

// Manual payment confirmation
export const ManualPaymentConfirmSchema = z.object({
  orderId: z.string().min(1),
  transactionId: z.string().min(1),
  signature: z.string().min(1, 'Signature is required'),
});

export type ManualPaymentConfirm = z.infer<typeof ManualPaymentConfirmSchema>;

// Validation error handler
export function handleValidationError(error: z.ZodError): { field: string; message: string }[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}
