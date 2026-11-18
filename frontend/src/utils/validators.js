// Client-side rules mirror the Mongoose schemas so users get instant feedback.
// The server validates again and is the source of truth.

const STUDENT_ID = /^\d{1,10}$/;
const PHONE = /^(?=(?:\D*\d){7,15}\D*$)[0-9+()\-.\s]+$/;
const ZIP = /^\d{5}(-\d{4})?$/;
const COURSE_ID = /^[A-Z0-9][A-Z0-9 -]{1,19}$/;

export const normalizeCourseId = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toUpperCase();

export function validateStudent({ name, studentId, phone, zip }) {
    const errors = {};
    const n = name.trim();
    if (!n) errors.name = 'Name is required.';
    else if (n.length > 100) errors.name = 'Name must be 100 characters or fewer.';

    const id = studentId.trim();
    if (!id) errors.studentId = 'Student ID is required.';
    else if (!STUDENT_ID.test(id)) errors.studentId = 'Student ID must be 1 to 10 digits.';

    const p = phone.trim();
    if (!p) errors.phone = 'Phone number is required.';
    else if (!PHONE.test(p)) errors.phone = 'Enter 7 to 15 digits (spaces, +, (), - and . are allowed).';

    const z = zip.trim();
    if (!z) errors.zip = 'ZIP code is required.';
    else if (!ZIP.test(z)) errors.zip = 'Enter a 5-digit ZIP or ZIP+4 (e.g. 77004 or 77004-1234).';

    return errors;
}

export function validateCourse({ courseId, name }) {
    const errors = {};
    const id = normalizeCourseId(courseId);
    if (!id) errors.courseId = 'Course ID is required.';
    else if (!COURSE_ID.test(id))
        errors.courseId = 'Use 2 to 20 letters, numbers, spaces, or hyphens (e.g. CIS 3339).';

    const n = name.trim();
    if (!n) errors.name = 'Course name is required.';
    else if (n.length > 150) errors.name = 'Course name must be 150 characters or fewer.';

    return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
