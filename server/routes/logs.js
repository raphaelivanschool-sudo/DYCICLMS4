import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to calculate date ranges
const getDateRange = (range) => {
  const now = new Date();
  const start = new Date();
  
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    default:
      return null; // No date filter
  }
  
  return { start, end: now };
};

// GET /api/logs - Fetch system logs with filtering (Admin and Instructor access)
router.get('/', authenticateToken, requireRole(['ADMIN', 'INSTRUCTOR']), async (req, res) => {
  console.log('=== LOGS API CALLED ===');
  console.log('User:', req.user);
  console.log('Query params:', req.query);
  try {
    const {
      page = 1,
      limit = 50,
      dateRange = 'week',
      actionFilter = 'all',
      searchTerm = '',
      customStartDate,
      customEndDate
    } = req.query;

    // Build where clause
    const where = {};

    // Date filtering
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      where.createdAt = {
        gte: new Date(customStartDate),
        lte: new Date(customEndDate)
      };
    } else {
      const dateFilter = getDateRange(dateRange);
      if (dateFilter) {
        where.createdAt = {
          gte: dateFilter.start,
          lte: dateFilter.end
        };
      }
    }

    // Action filtering
    if (actionFilter !== 'all') {
      where.action = actionFilter;
    }

    // User search filtering
    if (searchTerm) {
      where.OR = [
        {
          user: {
            OR: [
              { fullName: { contains: searchTerm } },
              { username: { contains: searchTerm } }
            ]
          }
        },
        {
          description: { contains: searchTerm }
        },
        {
          ipAddress: { contains: searchTerm }
        }
      ];
    }

    // Get total count for pagination
    const total = await prisma.systemLog.count({ where });

    // Fetch logs with user relationship
    const logs = await prisma.systemLog.findMany({
      where,
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
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    // Get unique actions for filter dropdown
    const uniqueActions = await prisma.systemLog.findMany({
      select: { action: true },
      distinct: ['action'],
      orderBy: { action: 'asc' }
    });

    // Calculate stats
    const stats = {
      totalActions: total,
      activeUsers: await prisma.systemLog.groupBy({
        by: ['userId'],
        where: {
          ...where,
          userId: { not: null }
        }
      }).then(groups => groups.length),
      criticalCommands: await prisma.systemLog.count({
        where: {
          ...where,
          action: { in: ['LOGIN', 'LOGOUT'] }
        }
      }),
      errors: await prisma.systemLog.count({
        where: {
          ...where,
          OR: [
            { action: { contains: 'ERROR' } },
            { description: { contains: 'error' } }
          ]
        }
      })
    };

    res.json({
      logs,
      stats,
      uniqueActions: uniqueActions.map(item => item.action),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
    console.log('=== LOGS RESPONSE ===');
    console.log('Logs count:', logs.length);
    console.log('Stats:', stats);
    console.log('Unique actions:', uniqueActions);

  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

export default router;
