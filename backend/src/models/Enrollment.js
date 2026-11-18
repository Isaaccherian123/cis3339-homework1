const { Schema, model } = require('mongoose');
const { toJSONOptions } = require('./shared');

const enrollmentSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student is required'],
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course is required'],
        },
    },
    { collection: 'enrollments', timestamps: true, versionKey: false }
);

// A student can be enrolled in a given course only once.
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
// Fast lookups for course rosters and cascading deletes by course.
enrollmentSchema.index({ course: 1 });

enrollmentSchema.set('toJSON', toJSONOptions);

module.exports = model('Enrollment', enrollmentSchema);
