const express = require('express');
const { Student, Course, Enrollment } = require('../models');
const { cleanString } = require('../models/shared');
const { badRequest, conflict, notFound } = require('../utils/httpError');

const router = express.Router();

// POST /api/enrollments  { studentId, courseId }
router.post('/', async (req, res) => {
    const body = req.body ?? {};
    const studentId = cleanString(body.studentId);
    const courseId = Course.normalizeCourseId(body.courseId);

    const details = {};
    if (!studentId) details.studentId = 'Select a student.';
    if (!courseId) details.courseId = 'Select a course.';
    if (Object.keys(details).length) throw badRequest('Select both a student and a course.', details);

    const [student, course] = await Promise.all([
        Student.findOne({ studentId }),
        Course.findOne({ courseId }),
    ]);
    if (!student) throw notFound(`Student ${studentId} does not exist.`);
    if (!course) throw notFound(`Course ${courseId} does not exist.`);

    if (await Enrollment.exists({ student: student._id, course: course._id })) {
        throw conflict(`${student.name} is already enrolled in ${course.courseId}.`);
    }

    // The unique {student, course} index also rejects simultaneous duplicates.
    const enrollment = await Enrollment.create({ student: student._id, course: course._id });

    res.status(201).json({
        message: `Enrolled ${student.name} in ${course.courseId}.`,
        enrollment: { id: String(enrollment._id), enrolledAt: enrollment.createdAt },
        student,
        course,
    });
});

module.exports = router;
