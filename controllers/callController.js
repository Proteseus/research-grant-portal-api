import { PrismaClient } from '@prisma/client';
import { sendNotification } from '../utils/notificationService.js';

const prisma = new PrismaClient();

// Create new call for proposals
export const createCall = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const createdBy = req.user.id;

    const call = await prisma.callForProposal.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        createdBy
      }
    });

    // Send notification to all researchers
    await sendNotification(
      null, // null sends to all users
      `New call for proposals: ${title}`
    );

    res.status(201).json({
      id: call.id,
      title: call.title,
      deadline: call.deadline
    });
  } catch (error) {
    console.error('Create call error:', error);
    res.status(500).json({ error: 'Failed to create call' });
  }
};

// List all calls
export const getCalls = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const calls = await prisma.callForProposal.findMany({
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: parseInt(limit)
    });

    const totalCount = await prisma.callForProposal.count();

    res.json({
      data: calls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get calls error:', error);
    res.status(500).json({ error: 'Failed to get calls' });
  }
};

// Get call details
export const getCall = async (req, res) => {
  try {
    const { id } = req.params;

    const call = await prisma.callForProposal.findUnique({
      where: { id },
      include: {
        proposals: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    res.json(call);
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({ error: 'Failed to get call' });
  }
};

// Update call
export const updateCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline } = req.body;

    const call = await prisma.callForProposal.update({
      where: { id },
      data: {
        title,
        description,
        deadline: new Date(deadline)
      }
    });

    res.json(call);
  } catch (error) {
    console.error('Update call error:', error);
    res.status(500).json({ error: 'Failed to update call' });
  }
};

// Delete call
export const deleteCall = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.callForProposal.delete({
      where: { id }
    });

    res.json({ message: 'Call deleted successfully' });
  } catch (error) {
    console.error('Delete call error:', error);
    res.status(500).json({ error: 'Failed to delete call' });
  }
};
