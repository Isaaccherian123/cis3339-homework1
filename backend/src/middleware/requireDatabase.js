const { isDatabaseReady } = require('../config/db');

/** Responds with 503 instead of hanging when MongoDB is not connected. */
function requireDatabase(req, res, next) {
    if (isDatabaseReady()) return next();
    return res.status(503).json({
        error: 'The database is not connected. Make sure MongoDB is running, then try again.',
    });
}

module.exports = requireDatabase;
