const express = require('express');
const { Course, Student, Enrollment } = require('../models');
const { cleanString } = require('../models/shared');
const { conflict, notFound } = require('../utils/httpError');

const router = express.Router();

async function findCourseOr404(rawCourseId) {
    const course = await Course.findOne({ courseId: Course.normalizeCourseId(rawCourseId) });
    if (!course) throw notFound('Course not found.');
    return course;
}

// GET /api/courses -> all courses with the number of enrolled students
router.get('/', async (req, res) => {
    const courses = await Course.aggregate([
        { $sort: { courseId: 1 } },
        {
            $lookup: {
                from: Enrollment.collection.name,
                localField: '_id',
                foreignField: 'course',
                as: 'enrollments',
            },
        },
        {
            $project: {
                _id: 0,
                id: { $toString: '$_id' },
                courseId: 1,
                name: 1,
                createdAt: 1,
                enrollmentCount: { $size: '$enrollments' },
            },
        },
    ]);
    res.json(courses);
});

// POST /api/courses  { courseId, name }
router.post('/', async (req, res) => {
    const body = req.body ?? {};
    const data = {
        courseId: Course.normalizeCourseId(body.courseId),
        name: cleanString(body.name),
    };

    if (data.courseId && (await Course.exists({ courseId: data.courseId }))) {
        throw conflict(`A course with ID ${data.courseId} already exists.`);
    }

    const course = await Course.create(data);
    res.status(201).json({ ...course.toJSON(), enrollmentCount: 0 });
});

// DELETE /api/courses/:courseId  (also removes the course's enrollments)
router.delete('/:courseId', async (req, res) => {
    const course = await Course.findOneAndDelete({
        courseId: Course.normalizeCourseId(req.params.courseId),
    });
    if (!course) throw notFound('Course not found or already deleted.');

    const { deletedCount } = await Enrollment.deleteMany({ course: course._id });
    res.json({
        message: `Deleted ${course.courseId} and ${deletedCount} enrollment(s).`,
        course,
        removedEnrollments: deletedCount,
    });
});

// GET /api/courses/:courseId/students -> roster of students enrolled in the course
router.get('/:courseId/students', async (req, res) => {
    const course = await findCourseOr404(req.params.courseId);
    const enrollments = await Enrollment.find({ course: course._id }).populate('student');

    const students = enrollments
        .filter((enrollment) => enrollment.student) // skip any orphaned references
        .map((enrollment) => ({ ...enrollment.student.toJSON(), enrolledAt: enrollment.createdAt }))
        .sort((a, b) => a.name.localeCompare(b.name) || a.studentId.localeCompare(b.studentId));

    res.json({ course, students });
});

// DELETE /api/courses/:courseId/students/:studentId -> unenroll one student
router.delete('/:courseId/students/:studentId', async (req, res) => {
    const course = await findCourseOr404(req.params.courseId);
    const student = await Student.findOne({ studentId: cleanString(req.params.studentId) });
    if (!student) throw notFound('Student not found.');

    const enrollment = await Enrollment.findOneAndDelete({ course: course._id, student: student._id });
    if (!enrollment) throw notFound('This student is not enrolled in this course.');

    res.json({ message: `Removed ${student.name} from ${course.courseId}.` });
});

module.exports = router;
