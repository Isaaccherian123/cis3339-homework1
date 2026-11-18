class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.details = details;
    }
}

const badRequest = (message, details) => new HttpError(400, message, details);
const notFound = (message) => new HttpError(404, message);
const conflict = (message) => new HttpError(409, message);

module.exports = { HttpError, badRequest, notFound, conflict };
