const express = require('express');
const { Student, Enrollment } = require('../models');
const { cleanString } = require('../models/shared');
const { conflict, notFound } = require('../utils/httpError');

const router = express.Router();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/students?search=jo  -> all students, or those whose name contains
// the search text (case-insensitive) or whose student ID matches exactly.
router.get('/', async (req, res) => {
    const search = cleanString(req.query.search);
    const filter = search
        ? { $or: [{ name: { $regex: escapeRegex(search), $options: 'i' } }, { studentId: search }] }
        : {};
    const students = await Student.find(filter).collation({ locale: 'en' }).sort({ name: 1, studentId: 1 });
    res.json(students);
});

// GET /api/students/:studentId
router.get('/:studentId', async (req, res) => {
    const student = await Student.findOne({ studentId: cleanString(req.params.studentId) });
    if (!student) throw notFound('Student not found.');
    res.json(student);
});

// POST /api/students  { studentId, name, phone, zip }
router.post('/', async (req, res) => {
    const body = req.body ?? {};
    const data = {
        studentId: cleanString(body.studentId),
        name: cleanString(body.name),
        phone: cleanString(body.phone),
        zip: cleanString(body.zip),
    };

    if (data.studentId && (await Student.exists({ studentId: data.studentId }))) {
        throw conflict(`A student with ID ${data.studentId} already exists.`);
    }

    // Schema validation runs on create; the unique index also rejects races.
    const student = await Student.create(data);
    res.status(201).json(student);
});

// DELETE /api/students/:studentId  (also removes the student's enrollments)
router.delete('/:studentId', async (req, res) => {
    const student = await Student.findOneAndDelete({ studentId: cleanString(req.params.studentId) });
    if (!student) throw notFound('Student not found or already deleted.');

    const { deletedCount } = await Enrollment.deleteMany({ student: student._id });
    res.json({
        message: `Deleted ${student.name} and ${deletedCount} enrollment(s).`,
        student,
        removedEnrollments: deletedCount,
    });
});

module.exports = router;
