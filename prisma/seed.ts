import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed the database with initial data
 */
async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create sample orders
    const order1 = await prisma.order.create({
      data: {
        merchantId: 'merchant_demo_001',
        customerId: 'customer_001',
        customerEmail: 'demo@example.com',
        amount: 29.99,
        currency: 'USD',
        status: 'completed',
        shamcashId: 'shamcash_txn_001',
        transactionId: 'txn_001_success',
        metadata: {
          package: 'premium_resume',
          features: ['ats_optimization', 'cover_letter', 'heatmap'],
        },
        completedAt: new Date(),
      },
    });
    console.log('✅ Created sample order 1:', order1.id);

    const order2 = await prisma.order.create({
      data: {
        merchantId: 'merchant_demo_001',
        customerId: 'customer_002',
        customerEmail: 'user@example.com',
        amount: 49.99,
        currency: 'USD',
        status: 'pending',
        metadata: {
          package: 'pro_resume',
          features: ['ats_optimization', 'cover_letter', 'heatmap', 'linkedin_review'],
        },
      },
    });
    console.log('✅ Created sample order 2:', order2.id);

    // Create sample resume generation log
    const resumeLog = await prisma.resumeGenerationLog.create({
      data: {
        targetJobTitle: 'Senior Full Stack Developer',
        targetCompany: 'Tech Corp',
        targetJobDescription: `We are looking for a Senior Full Stack Developer with 5+ years of experience.
        
        Required Skills:
        - React, TypeScript, Node.js
        - PostgreSQL, Redis
        - Docker, Kubernetes
        - AWS or GCP experience
        
        Responsibilities:
        - Design and implement scalable web applications
        - Lead a small team of developers
        - Mentor junior developers
        - Code review and quality assurance`,
        userEmail: 'developer@example.com',
        language: 'en',
        usedModel: 'gemini-2.0-flash',
        generationTime: 2345,
        generatedResume: {
          summary: 'Experienced Full Stack Developer with proven track record...',
          experience: ['Led development of microservices architecture...'],
          skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        },
        generatedCoverLetter: {
          opening: 'Dear Hiring Manager...',
          body: 'With over 5 years of full stack development experience...',
        },
        atsReview: {
          score: 92,
          keywords_found: ['React', 'TypeScript', 'Node.js'],
          missing_keywords: ['Kubernetes'],
          recommendations: ['Add Kubernetes experience if you have it'],
        },
      },
    });
    console.log('✅ Created sample resume log:', resumeLog.id);

    // Create sample API usage logs
    const apiLogs = await Promise.all([
      prisma.apiUsageLog.create({
        data: {
          identifier: '192.168.1.1',
          endpoint: '/api/resume/generate',
          method: 'POST',
          statusCode: 200,
          responseTime: 2345,
        },
      }),
      prisma.apiUsageLog.create({
        data: {
          identifier: '192.168.1.2',
          endpoint: '/api/resume/improve-bullet',
          method: 'POST',
          statusCode: 200,
          responseTime: 834,
        },
      }),
      prisma.apiUsageLog.create({
        data: {
          identifier: '192.168.1.1',
          endpoint: '/api/resume/extract-keywords',
          method: 'POST',
          statusCode: 200,
          responseTime: 456,
        },
      }),
    ]);
    console.log(`✅ Created ${apiLogs.length} sample API usage logs`);

    console.log('✨ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
