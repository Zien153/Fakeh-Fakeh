/**
 * Order Store Service
 * 
 * Handles persistent storage of payment orders using Redis for caching
 * and Prisma for permanent database storage.
 * 
 * This replaces the in-memory Map which was lost on server restart.
 * Now supports horizontal scaling with multiple server instances.
 */

import { PrismaClient } from '@prisma/client';
import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export interface ShamCashOrder {
  id: string;
  merchantId: string;
  customerId: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  shamcashId?: string;
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  completedAt?: Date;
}

class OrderStore {
  private prisma: PrismaClient;
  private redis: RedisClientType | null = null;
  private redisConnected = false;
  private readonly REDIS_EXPIRY = 24 * 60 * 60; // 24 hours
  private readonly CACHE_KEY_PREFIX = 'order:';

  constructor() {
    this.prisma = new PrismaClient();
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection (optional, for caching)
   * If Redis is unavailable, the system falls back to database-only mode
   */
  private async initializeRedis(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = createClient({ url: redisUrl });
      
      this.redis.on('error', (err) => {
        console.warn('[OrderStore] Redis connection error:', err.message);
        this.redisConnected = false;
      });

      await this.redis.connect();
      this.redisConnected = true;
      console.log('[OrderStore] Redis connected successfully');
    } catch (err: any) {
      console.warn('[OrderStore] Redis not available, using database-only mode:', err.message);
      this.redisConnected = false;
    }
  }

  /**
   * Create a new order
   */
  async create(order: Omit<ShamCashOrder, 'createdAt' | 'updatedAt' | 'id'>): Promise<ShamCashOrder> {
    const createdOrder = await this.prisma.order.create({
      data: {
        ...order,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Cache in Redis
    if (this.redisConnected && this.redis) {
      await this.redis
        .setEx(
          `${this.CACHE_KEY_PREFIX}${createdOrder.id}`,
          this.REDIS_EXPIRY,
          JSON.stringify(createdOrder)
        )
        .catch((err) => console.warn('[OrderStore] Redis cache write failed:', err.message));
    }

    return this.mapOrderFromPrisma(createdOrder);
  }

  /**
   * Get an order by ID
   * First checks Redis cache, then falls back to database
   */
  async getById(orderId: string): Promise<ShamCashOrder | null> {
    // Try Redis first
    if (this.redisConnected && this.redis) {
      try {
        const cached = await this.redis.get(`${this.CACHE_KEY_PREFIX}${orderId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn('[OrderStore] Redis cache read failed:', err);
      }
    }

    // Fall back to database
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (order) {
      // Cache in Redis for next time
      if (this.redisConnected && this.redis) {
        await this.redis
          .setEx(
            `${this.CACHE_KEY_PREFIX}${orderId}`,
            this.REDIS_EXPIRY,
            JSON.stringify(order)
          )
          .catch((err) => console.warn('[OrderStore] Redis cache write failed:', err.message));
      }
    }

    return order ? this.mapOrderFromPrisma(order) : null;
  }

  /**
   * Get all pending orders for a customer
   */
  async getPendingByCustomer(customerId: string): Promise<ShamCashOrder[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        customerId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.mapOrderFromPrisma(o));
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    status: ShamCashOrder['status'],
    shamcashId?: string,
    transactionId?: string
  ): Promise<ShamCashOrder | null> {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        shamcashId: shamcashId || undefined,
        transactionId: transactionId || undefined,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
    });

    // Invalidate Redis cache
    if (this.redisConnected && this.redis) {
      await this.redis
        .del(`${this.CACHE_KEY_PREFIX}${orderId}`)
        .catch((err) => console.warn('[OrderStore] Redis cache delete failed:', err.message));
    }

    return this.mapOrderFromPrisma(updatedOrder);
  }

  /**
   * Update order metadata
   */
  async updateMetadata(orderId: string, metadata: Record<string, any>): Promise<ShamCashOrder | null> {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        metadata: {
          ...((await this.prisma.order.findUnique({ where: { id: orderId } }))?.metadata as any),
          ...metadata,
        },
      },
    });

    // Invalidate Redis cache
    if (this.redisConnected && this.redis) {
      await this.redis
        .del(`${this.CACHE_KEY_PREFIX}${orderId}`)
        .catch((err) => console.warn('[OrderStore] Redis cache delete failed:', err.message));
    }

    return this.mapOrderFromPrisma(updatedOrder);
  }

  /**
   * Clean up expired orders (call periodically via cron job)
   */
  async deleteExpired(): Promise<number> {
    const result = await this.prisma.order.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    console.log(`[OrderStore] Cleaned up ${result.count} expired orders`);
    return result.count;
  }

  /**
   * Map Prisma Order to ShamCashOrder interface
   */
  private mapOrderFromPrisma(order: any): ShamCashOrder {
    return {
      id: order.id,
      merchantId: order.merchantId,
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      shamcashId: order.shamcashId,
      transactionId: order.transactionId,
      metadata: order.metadata,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      expiresAt: order.expiresAt,
      completedAt: order.completedAt,
    };
  }

  /**
   * Gracefully close connections
   */
  async disconnect(): Promise<void> {
    if (this.redis && this.redisConnected) {
      await this.redis.disconnect().catch((err) => console.warn('[OrderStore] Redis disconnect error:', err));
    }
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const orderStore = new OrderStore();
