// Exposes the MongoDB _id as a plain "id" string and hides internal fields.
const toJSONOptions = {
    virtuals: false,
    transform(_doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
    },
};

/**
 * Converts untrusted request values to trimmed strings. Objects and arrays
 * become empty strings so they cannot be used as MongoDB query operators.
 */
function cleanString(value) {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return '';
}

module.exports = { toJSONOptions, cleanString };
