import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// All routes are protected with JWT middleware
router.use(authenticateToken);

// GET /api/labs - Return all laboratories
router.get('/', async (req, res) => {
  try {
    const labs = await prisma.laboratory.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        assignedInstructor: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        },
        _count: {
          select: {
            computers: true
          }
        }
      }
    });

    // Transform the response to include computer count
    const formattedLabs = labs.map(lab => ({
      id: lab.id,
      name: lab.name,
      location: lab.location,
      roomNumber: lab.roomNumber,
      capacity: lab.capacity,
      status: lab.status,
      createdAt: lab.createdAt,
      assignedInstructor: lab.assignedInstructor,
      computerCount: lab._count.computers
    }));

    res.json(formattedLabs);
  } catch (error) {
    console.error('Error fetching labs:', error);
    res.status(500).json({ message: 'Failed to fetch laboratories' });
  }
});

// GET /api/labs/:id - Return single lab with computers
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const labId = parseInt(id);

    if (isNaN(labId)) {
      return res.status(400).json({ message: 'Invalid lab ID' });
    }

    const lab = await prisma.laboratory.findUnique({
      where: { id: labId },
      include: {
        assignedInstructor: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        },
        computers: {
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!lab) {
      return res.status(404).json({ message: 'Laboratory not found' });
    }

    res.json(lab);
  } catch (error) {
    console.error('Error fetching lab:', error);
    res.status(500).json({ message: 'Failed to fetch laboratory' });
  }
});

// POST /api/labs - Create new lab
router.post('/', async (req, res) => {
  try {
    const { name, location, roomNumber, capacity, status, assignedInstructorId } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Lab name is required' });
    }

    if (!capacity || isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
      return res.status(400).json({ message: 'Valid capacity is required' });
    }

    // Check if assignedInstructorId is valid if provided
    if (assignedInstructorId) {
      const instructor = await prisma.user.findUnique({
        where: { 
          id: parseInt(assignedInstructorId),
          role: 'INSTRUCTOR'
        }
      });

      if (!instructor) {
        return res.status(400).json({ message: 'Invalid instructor ID' });
      }
    }

    const lab = await prisma.laboratory.create({
      data: {
        name: name.trim(),
        location: location?.trim() || null,
        roomNumber: roomNumber?.trim() || name.trim(),
        capacity: parseInt(capacity),
        status: status || 'ACTIVE',
        assignedInstructorId: assignedInstructorId ? parseInt(assignedInstructorId) : null
      },
      include: {
        assignedInstructor: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        }
      }
    });

    res.status(201).json(lab);
  } catch (error) {
    console.error('Error creating lab:', error);
    res.status(500).json({ message: 'Failed to create laboratory' });
  }
});

// PUT /api/labs/:id - Update lab
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const labId = parseInt(id);

    if (isNaN(labId)) {
      return res.status(400).json({ message: 'Invalid lab ID' });
    }

    const { name, location, roomNumber, capacity, status, assignedInstructorId } = req.body;

    // Check if lab exists
    const existingLab = await prisma.laboratory.findUnique({
      where: { id: labId }
    });

    if (!existingLab) {
      return res.status(404).json({ message: 'Laboratory not found' });
    }

    // Validation
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ message: 'Lab name cannot be empty' });
    }

    if (capacity !== undefined && (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0)) {
      return res.status(400).json({ message: 'Valid capacity is required' });
    }

    // Check if assignedInstructorId is valid if provided
    if (assignedInstructorId) {
      const instructor = await prisma.user.findUnique({
        where: { 
          id: parseInt(assignedInstructorId),
          role: 'INSTRUCTOR'
        }
      });

      if (!instructor) {
        return res.status(400).json({ message: 'Invalid instructor ID' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (location !== undefined) updateData.location = location?.trim() || null;
    if (roomNumber !== undefined) updateData.roomNumber = roomNumber?.trim() || null;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (status !== undefined) updateData.status = status;
    if (assignedInstructorId !== undefined) {
      updateData.assignedInstructorId = assignedInstructorId ? parseInt(assignedInstructorId) : null;
    }

    const lab = await prisma.laboratory.update({
      where: { id: labId },
      data: updateData,
      include: {
        assignedInstructor: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        }
      }
    });

    res.json(lab);
  } catch (error) {
    console.error('Error updating lab:', error);
    res.status(500).json({ message: 'Failed to update laboratory' });
  }
});

// DELETE /api/labs/:id - Delete lab
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const labId = parseInt(id);

    if (isNaN(labId)) {
      return res.status(400).json({ message: 'Invalid lab ID' });
    }

    // Check if lab exists
    const lab = await prisma.laboratory.findUnique({
      where: { id: labId },
      include: {
        _count: {
          select: {
            computers: true
          }
        }
      }
    });

    if (!lab) {
      return res.status(404).json({ message: 'Laboratory not found' });
    }

    // Check if lab has computers
    if (lab._count.computers > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete lab with existing computers. Please remove computers first.' 
      });
    }

    await prisma.laboratory.delete({
      where: { id: labId }
    });

    res.json({ message: 'Laboratory deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab:', error);
    res.status(500).json({ message: 'Failed to delete laboratory' });
  }
});

export default router;
