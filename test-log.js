import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLog() {
  try {
    console.log('Testing SystemLog creation...');
    
    // Test creating a log entry
    const log = await prisma.systemLog.create({
      data: {
        action: 'TEST_LOGIN',
        description: 'Test login entry',
        userId: 2, // instructor1 ID
        ipAddress: '127.0.0.1'
      }
    });
    
    console.log('Log created successfully:', log);
    
    // Test fetching logs
    const logs = await prisma.systemLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log('Found logs:', logs.length);
    logs.forEach(log => {
      console.log(`- ${log.action} by ${log.user?.fullName || 'System'} at ${log.createdAt}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLog();
