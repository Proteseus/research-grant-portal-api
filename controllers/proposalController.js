import { PrismaClient } from '@prisma/client';
import { proposalUpload, getFileUrl } from '../utils/fileUpload.js';
import { sendNotification } from '../utils/notificationService.js';

const prisma = new PrismaClient();

// Submit new proposal
export const createProposal = async (req, res) => {
  try {
    const { callId, title, abstract } = req.body;
    const researcherId = req.user.id;

    // Handle file upload
    proposalUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      const documentUrl = getFileUrl(req.file.filename);
    });

    const proposal = await prisma.proposal.create({
      data: {
        researcherId,
        callId,
        title,
        abstract,
        documentUrl,
        status: 'SUBMITTED'
      }
    });

    // Send notification to admin
    await sendNotification(
      req.user.id,
      `New proposal submitted: ${title}`
    );

    res.status(201).json({
      id: proposal.id,
      status: proposal.status,
      createdAt: proposal.createdAt
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
};

// List proposals
export const getProposals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = req.user.role === 'ADMIN' 
      ? {} 
      : { researcherId: req.user.id };

    const proposals = await prisma.proposal.findMany({
      where: whereClause,
      include: {
        researcher: {
          select: {
            id: true,
            fullName: true
          }
        },
        call: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: parseInt(limit)
    });

    const totalCount = await prisma.proposal.count({
      where: whereClause
    });

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

// Get proposal details
export const getProposal = async (req, res) => {
  try {
    const { id } = req.params;

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        researcher: {
          select: {
            id: true,
            fullName: true
          }
        },
        call: {
          select: {
            id: true,
            title: true
          }
        },
        revisions: {
          orderBy: { submittedAt: 'desc' }
        }
      }
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Restrict access to owner or admin
    if (proposal.researcherId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json(proposal);
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({ error: 'Failed to get proposal' });
  }
};

// Update proposal
export const updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, abstract } = req.body;

    // Verify proposal exists and belongs to user
    const existingProposal = await prisma.proposal.findUnique({
      where: { id }
    });

    if (!existingProposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (existingProposal.researcherId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: {
        title,
        abstract
      }
    });

    res.json(updatedProposal);
  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({ error: 'Failed to update proposal' });
  }
};

// Delete proposal
export const deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify proposal exists and belongs to user
    const existingProposal = await prisma.proposal.findUnique({
      where: { id }
    });

    if (!existingProposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (existingProposal.researcherId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    await prisma.proposal.delete({
      where: { id }
    });

    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Delete proposal error:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
};

// Submit proposal revision
export const createProposalRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    // Verify proposal exists and belongs to user
    const existingProposal = await prisma.proposal.findUnique({
      where: { id }
    });

    if (!existingProposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (existingProposal.researcherId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Handle file upload for revision
    proposalUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      const revisedDocumentUrl = getFileUrl(req.file.filename);
    });

    const revision = await prisma.proposalRevision.create({
      data: {
        proposalId: id,
        revisedDocumentUrl,
        comments
      }
    });

    // Update proposal status
    await prisma.proposal.update({
      where: { id },
      data: { status: 'REVISION_REQUESTED' }
    });

    res.status(201).json(revision);
  } catch (error) {
    console.error('Create revision error:', error);
    res.status(500).json({ error: 'Failed to create revision' });
  }
};

// List proposal revisions
export const getProposalRevisions = async (req, res) => {
  try {
    const { id } = req.params;

    const revisions = await prisma.proposalRevision.findMany({
      where: { proposalId: id },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(revisions);
  } catch (error) {
    console.error('Get revisions error:', error);
    res.status(500).json({ error: 'Failed to get revisions' });
  }
};

// Update proposal status (Admin only)
export const updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const proposal = await prisma.proposal.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? comments : null
      }
    });

    // Send notification to researcher
    await sendNotification(
      proposal.researcherId,
      `Your proposal status has been updated to: ${status}`
    );

    res.json(proposal);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update proposal status' });
  }
};
