const express = require('express');
const { z } = require('zod');

const { requireAuth, requireRole } = require('../middleware/auth');
const { Parent } = require('../models/Parent');
const { Clinician } = require('../models/Clinician');
const { StrategyAssignment } = require('../models/StrategyAssignment');
const { PracticeSubmission } = require('../models/PracticeSubmission');
const { Message } = require('../models/Message');
const { validate } = require('../utils/validate');
const { createUploader, toPublicUploadUrl } = require('../utils/upload');

const parentRouter = express.Router();

parentRouter.get('/me', requireAuth, requireRole('parent'), async (req, res, next) => {
  try {
    const parent = await Parent.findById(req.user.parentId);
    if (!parent) {
      const err = new Error('Parent not found');
      err.statusCode = 404;
      throw err;
    }

    const clinician = await Clinician.findById(parent.clinicianId).select('_id name specialization clinicName');

    res.json({
      parent: {
        id: parent._id,
        childId: parent.childId,
        childName: parent.childName,
        childAge: parent.childAge,
        parentName: parent.parentName,
        email: parent.email,
        phone: parent.phone,
        status: parent.status,
        clinician: clinician
          ? {
              id: clinician._id,
              name: clinician.name,
              specialization: clinician.specialization,
              clinicName: clinician.clinicName,
            }
          : null,
      },
    });
  } catch (e) {
    next(e);
  }
});

parentRouter.get('/assignments', requireAuth, requireRole('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.parentId;
    const parent = await Parent.findById(parentId);
    if (!parent) {
      const err = new Error('Parent not found');
      err.statusCode = 404;
      throw err;
    }

    const assignments = await StrategyAssignment.find({
      parentId,
      clinicianId: parent.clinicianId,
      active: true,
      completedAt: null,
    })
      .sort({ assignedAt: -1 })
      .populate('strategyId');

    res.json({
      assignments: assignments.map((a) => ({
        id: a._id,
        assignedAt: a.assignedAt,
        strategy: a.strategyId
          ? { id: a.strategyId._id, title: a.strategyId.title, demoVideoUrl: a.strategyId.demoVideoUrl || '' }
          : null,
      })),
    });
  } catch (e) {
    next(e);
  }
});

parentRouter.get('/assignments/completed', requireAuth, requireRole('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.parentId;
    const parent = await Parent.findById(parentId);
    if (!parent) {
      const err = new Error('Parent not found');
      err.statusCode = 404;
      throw err;
    }

    const assignments = await StrategyAssignment.find({
      parentId,
      clinicianId: parent.clinicianId,
      completedAt: { $ne: null },
    })
      .sort({ completedAt: -1 })
      .populate('strategyId');

    res.json({
      assignments: assignments.map((a) => ({
        id: a._id,
        assignedAt: a.assignedAt,
        completedAt: a.completedAt,
        strategy: a.strategyId
          ? { id: a.strategyId._id, title: a.strategyId.title, demoVideoUrl: a.strategyId.demoVideoUrl || '' }
          : null,
      })),
    });
  } catch (e) {
    next(e);
  }
});

const assignmentIdParamSchema = z.object({
  assignmentId: z.string().min(1),
});

parentRouter.get('/assignments/:assignmentId', requireAuth, requireRole('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.parentId;
    const { assignmentId } = validate(assignmentIdParamSchema, req.params);
    const assignment = await StrategyAssignment.findOne({ _id: assignmentId, parentId }).populate('strategyId');
    if (!assignment) {
      const err = new Error('Assignment not found');
      err.statusCode = 404;
      throw err;
    }
    res.json({
      assignment: {
        id: assignment._id,
        assignedAt: assignment.assignedAt,
        strategy: assignment.strategyId
          ? { id: assignment.strategyId._id, title: assignment.strategyId.title, demoVideoUrl: assignment.strategyId.demoVideoUrl || '' }
          : null,
      },
    });
  } catch (e) {
    next(e);
  }
});

const progressUploader = createUploader({ subdir: 'practice-videos' });

parentRouter.post(
  '/assignments/:assignmentId/progress',
  requireAuth,
  requireRole('parent'),
  progressUploader.single('practiceVideo'),
  async (req, res, next) => {
    try {
      const parentId = req.user.parentId;
      const { assignmentId } = validate(assignmentIdParamSchema, req.params);

      const bodySchema = z.object({
        rating: z.coerce.number().int().min(1).max(5),
        durationSeconds: z.coerce.number().int().min(0).max(24 * 60 * 60),
      });
      const data = validate(bodySchema, req.body);

      const parent = await Parent.findById(parentId);
      if (!parent) {
        const err = new Error('Parent not found');
        err.statusCode = 404;
        throw err;
      }

      const assignment = await StrategyAssignment.findOne({ _id: assignmentId, parentId, completedAt: null });
      if (!assignment) {
        const err = new Error('Assignment not found');
        err.statusCode = 404;
        throw err;
      }

      const practiceVideoUrl = req.file ? toPublicUploadUrl(req, req.file.path) : '';

      const submission = await PracticeSubmission.create({
        clinicianId: parent.clinicianId,
        parentId,
        assignmentId: assignment._id,
        strategyId: assignment.strategyId,
        rating: data.rating,
        durationSeconds: data.durationSeconds,
        practiceVideoUrl,
        submittedAt: new Date(),
      });

      assignment.completedAt = new Date();
      assignment.active = false;
      await assignment.save();

      res.status(201).json({ ok: true, submissionId: submission._id });
    } catch (e) {
      next(e);
    }
  }
);

const messageSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

parentRouter.get('/messages', requireAuth, requireRole('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.parentId;
    const parent = await Parent.findById(parentId);
    if (!parent) {
      const err = new Error('Parent not found');
      err.statusCode = 404;
      throw err;
    }

    const messages = await Message.find({ clinicianId: parent.clinicianId, parentId }).sort({ createdAt: -1 }).limit(200);
    res.json({
      messages: messages
        .map((m) => ({ id: m._id, senderRole: m.senderRole, text: m.text, createdAt: m.createdAt }))
        .reverse(),
    });
  } catch (e) {
    next(e);
  }
});

parentRouter.post('/messages', requireAuth, requireRole('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.parentId;
    const { text } = validate(messageSchema, req.body);
    const parent = await Parent.findById(parentId);
    if (!parent) {
      const err = new Error('Parent not found');
      err.statusCode = 404;
      throw err;
    }

    const msg = await Message.create({
      clinicianId: parent.clinicianId,
      parentId,
      childId: parent.childId,
      senderRole: 'parent',
      text,
      createdAt: new Date(),
    });

    res.status(201).json({ message: { id: msg._id, senderRole: msg.senderRole, text: msg.text, createdAt: msg.createdAt } });
  } catch (e) {
    next(e);
  }
});

module.exports = { parentRouter };

