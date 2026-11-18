const { Schema, model } = require('mongoose');
const { toJSONOptions } = require('./shared');

const studentSchema = new Schema(
    {
        studentId: {
            type: String,
            required: [true, 'Student ID is required'],
            trim: true,
            unique: true,
            match: [/^\d{1,10}$/, 'Student ID must be 1 to 10 digits'],
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name must be 100 characters or fewer'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            match: [
                /^(?=(?:\D*\d){7,15}\D*$)[0-9+()\-.\s]+$/,
                'Phone must contain 7 to 15 digits (spaces, +, (), - and . are allowed)',
            ],
        },
        zip: {
            type: String,
            required: [true, 'ZIP code is required'],
            trim: true,
            match: [/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits or ZIP+4 (12345-6789)'],
        },
    },
    { collection: 'students', timestamps: true, versionKey: false }
);

studentSchema.index({ name: 1 });
studentSchema.set('toJSON', toJSONOptions);

module.exports = model('Student', studentSchema);
