import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get dashboard statistics
export const getStats = async (req, res) => {
  try {
    const [proposalsCount, usersCount, callsCount] = await Promise.all([
      prisma.proposal.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.user.count({ where: { role: 'RESEARCHER' } }),
      prisma.callForProposal.count({ where: { deadline: { gt: new Date() } } })
    ]);

    const proposalStatusStats = await prisma.proposal.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    res.json({
      proposalsCount,
      usersCount,
      callsCount,
      proposalStatusStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

// List all proposals with filters
export const getProposals = async (req, res) => {
  try {
    const { status, callId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (callId) where.callId = callId;

    const proposals = await prisma.proposal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: parseInt(limit),
      include: {
        researcher: {
          select: {
            fullName: true,
            email: true
          }
        },
        call: {
          select: {
            title: true
          }
        }
      }
    });

    const totalCount = await prisma.proposal.count({ where });

    res.json({
      data: proposals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({ error: 'Failed to get proposals' });
  }
};

// List all users
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: parseInt(limit),
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    const totalCount = await prisma.user.count();

    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.json({
      id: user.id,
      role: user.role
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};
