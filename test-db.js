const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.info('Testing database connection...');
    
    // Test basic connection
    const totalJobs = await prisma.job.count();
    console.info(`Total jobs in database: ${totalJobs}`);
    
    if (totalJobs > 0) {
      // Get a few sample jobs
      const sampleJobs = await prisma.job.findMany({
        take: 3,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          minAmount: true,
          maxAmount: true,
          currency: true,
        }
      });
      
      console.info('Sample jobs:');
      console.info(JSON.stringify(sampleJobs, null, 2));
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
