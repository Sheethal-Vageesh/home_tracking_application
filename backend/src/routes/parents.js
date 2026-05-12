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
const { SessionSubmission } = require('../models/SessionSubmission')

const parentRouter = express.Router();




parentRouter.get('/me', requireAuth, requireRole('parent'), async (req, res, next) => {
  try {
    const parent = await Parent.findById(req.user.parentId);
    if (!parent) {
      const err = new Error('Parent not found / ಪೋಷಕರ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ');
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
          ? {
              id: a.strategyId._id,
              title: a.strategyId.title,
              kannadaText: a.strategyId.kannadaText || '',
              demoVideoUrl: a.strategyId.demoVideoUrl || '',
            }
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
      const err = new Error('Parent not found / ಪೋಷಕರ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ');
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
          ? {
              id: a.strategyId._id,
              title: a.strategyId.title,
              kannadaText: a.strategyId.kannadaText || '',
              demoVideoUrl: a.strategyId.demoVideoUrl || '',
            }
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
        ? {
            id: assignment.strategyId._id,
            title: assignment.strategyId.title,
            kannadaText: assignment.strategyId.kannadaText || '',
            demoVideoUrl: assignment.strategyId.demoVideoUrl || '',
          }
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
        StutteringSeverityRating: z.coerce
          .number()
          .int()
          .min(0, 'Minimum is 0 / ಕನಿಷ್ಠ ಮೌಲ್ಯ 0')
          .max(9, 'Maximum is 9 / ಗರಿಷ್ಠ ಮೌಲ್ಯ 9'),

        SpeechNaturalnessRating: z.coerce
          .number()
          .int()
          .min(1, 'Minimum is 1 / ಕನಿಷ್ಠ ಮೌಲ್ಯ 1')
          .max(9, 'Maximum is 9 / ಗರಿಷ್ಠ ಮೌಲ್ಯ 9'),

        durationSeconds: z.coerce
          .number()
          .int()
          .min(0, 'Invalid duration / ಅಮಾನ್ಯ ಸಮಯ'),

        sessionNumber: z.coerce
          .number()
          .int()
          .min(1, 'Session starts from 1 / ಸೆಷನ್ 1 ರಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ')
          .max(10, 'Maximum 10 sessions / ಗರಿಷ್ಠ 10 ಸೆಷನ್'),
      });

      const data = validate(bodySchema, req.body);

      const parent = await Parent.findById(parentId);
      if (!parent) {
        const err = new Error('Parent not found / ಪೋಷಕರ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ');
        err.statusCode = 404;
        throw err;
      }

      const assignment = await StrategyAssignment.findOne({
        _id: assignmentId,
        parentId,
      });

      if (!assignment) {
        const err = new Error('Assignment not found / ಕಾರ್ಯ ಲಭ್ಯವಿಲ್ಲ');
        err.statusCode = 404;
        throw err;
      }

      // ✅ Prevent duplicate submission per session
      const existing = await PracticeSubmission.findOne({
        assignmentId: assignment._id,
        sessionNumber: data.sessionNumber,
      });

      if (existing) {
        const err = new Error('Already submitted for this session / ಈ ಸೆಷನ್‌ಗೆ ಈಗಾಗಲೇ ಸಲ್ಲಿಸಲಾಗಿದೆ');
        err.statusCode = 400;
        throw err;
      }

      const practiceVideoUrl = req.file
        ? toPublicUploadUrl(req, req.file.path)
        : '';

      const submission = await PracticeSubmission.create({
        clinicianId: parent.clinicianId,
        parentId,
        assignmentId: assignment._id,
        strategyId: assignment.strategyId,

        // ✅ NEW FIELDS
        StutteringSeverityRating: data.StutteringSeverityRating,
        SpeechNaturalnessRating: data.SpeechNaturalnessRating,

        stuttering: data.StutteringSeverityRating,
        naturalness: data.SpeechNaturalnessRating,

        durationSeconds: data.durationSeconds,
        sessionNumber: data.sessionNumber,

        practiceVideoUrl,
        submittedAt: new Date(),
      });

      res.status(201).json({
        ok: true,
        submissionId: submission._id,
        message: 'Progress submitted successfully',
        kannadaMessage: 'ಪ್ರಗತಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ',
      });
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
      const err = new Error('Parent not found / ಪೋಷಕರ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ');
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

parentRouter.get(
  '/sessions',
  requireAuth,
  requireRole('parent'),
  async (req, res, next) => {
    try {
      const parentId = req.user.parentId

      // all submitted sessions
      const sessionSubmissions = await SessionSubmission.find({
        parentId,
      })

      const submittedMap = {}

      sessionSubmissions.forEach((s) => {
        submittedMap[s.sessionNumber] = true
      })

      const sessions = Array.from({ length: 10 }, (_, i) => {
        const num = i + 1

        return {
          sessionNumber: num,

          // completed session
          completed: !!submittedMap[num],

          // lock next session until previous completed
          locked: num !== 1 && !submittedMap[num - 1],
        }
      })

      res.json({ sessions })
    } catch (e) {
      next(e)
    }
  }
)

parentRouter.get(
  '/session/:sessionNumber',
  requireAuth,
  requireRole('parent'),
  async (req, res, next) => {
    try {
      const parentId = req.user.parentId
      const sessionNumber = Number(req.params.sessionNumber)

      // check session submitted
      const sessionSubmission = await SessionSubmission.findOne({
        parentId,
        sessionNumber,
      })

      const assignments = await StrategyAssignment.find({
        parentId,
        active: true,
      }).populate('strategyId')

      const submissions = await PracticeSubmission.find({
        parentId,
        sessionNumber,
      })

      res.json({
        assignments: assignments.map((a) => ({
          id: a._id,
          strategy: a.strategyId
            ? {
                id: a.strategyId._id,
                title: a.strategyId.title,
                kannadaText: a.strategyId.kannadaText || '',
                demoVideoUrl: a.strategyId.demoVideoUrl || '',
              }
            : null,
        })),

        submissions,

        // IMPORTANT
        sessionSubmitted: !!sessionSubmission,
      })
    } catch (e) {
      next(e)
    }
  }
)

parentRouter.post(
  '/session/:sessionNumber/submit',
  requireAuth,
  requireRole('parent'),
  async (req, res, next) => {
    try {
      const parentId = req.user.parentId
      const sessionNumber = Number(req.params.sessionNumber)

      // check already submitted
      const existing = await SessionSubmission.findOne({
        parentId,
        sessionNumber,
      })

      if (existing) {
        const err = new Error(
          'Session already submitted / ಸೆಷನ್ ಈಗಾಗಲೇ ಸಲ್ಲಿಸಲಾಗಿದೆ'
        )
        err.statusCode = 400
        throw err
      }

      
      const parent = await Parent.findById(parentId)

      await SessionSubmission.create({
        parentId,
        clinicianId: parent.clinicianId,
        sessionNumber,
      })

      res.json({
        ok: true,
        message:
          'Session submitted successfully / ಸೆಷನ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ',
      })
    } catch (e) {
      next(e)
    }
  }
)
parentRouter.post('/messages', requireAuth, requireRole('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.parentId;
    const { text } = validate(messageSchema, req.body);
    const parent = await Parent.findById(parentId);
    if (!parent) {
      const err = new Error('Parent not found / ಪೋಷಕರ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ');
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

    res.status(201).json({
      message: {
        id: msg._id,
        senderRole: msg.senderRole,
        text: msg.text,
        createdAt: msg.createdAt,
      },

      info: 'Message sent successfully',
      kannadaInfo: 'ಸಂದೇಶ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ',
    });
  } catch (e) {
    next(e);
  }
});





module.exports = { parentRouter };

