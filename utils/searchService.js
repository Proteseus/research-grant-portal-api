import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchProposals = async (filters = {}) => {
  const {
    status,
    researcherId,
    callId,
    searchTerm,
    page = 1,
    limit = 10
  } = filters;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (researcherId) {
    where.researcherId = researcherId;
  }

  if (callId) {
    where.callId = callId;
  }

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { abstract: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  const total = await prisma.proposal.count({ where });
  const proposals = await prisma.proposal.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
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
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    results: proposals
  };
};
