const { Schema, model } = require('mongoose');
const { toJSONOptions, cleanString } = require('./shared');

/** "cis   3339 " -> "CIS 3339" so the same course cannot be added twice with different spacing or case. */
function normalizeCourseId(value) {
    return cleanString(value).replace(/\s+/g, ' ').toUpperCase();
}

const courseSchema = new Schema(
    {
        courseId: {
            type: String,
            required: [true, 'Course ID is required'],
            unique: true,
            set: normalizeCourseId,
            match: [
                /^[A-Z0-9][A-Z0-9 -]{1,19}$/,
                'Course ID must be 2 to 20 characters: letters, numbers, spaces, or hyphens',
            ],
        },
        name: {
            type: String,
            required: [true, 'Course name is required'],
            trim: true,
            maxlength: [150, 'Course name must be 150 characters or fewer'],
        },
    },
    { collection: 'courses', timestamps: true, versionKey: false }
);

courseSchema.set('toJSON', toJSONOptions);
courseSchema.statics.normalizeCourseId = normalizeCourseId;

module.exports = model('Course', courseSchema);
