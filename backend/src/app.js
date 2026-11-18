const fs = require('fs');
const path = require('path');
const express = require('express');

const { isDatabaseReady } = require('./config/db');
const requireDatabase = require('./middleware/requireDatabase');
const errorHandler = require('./middleware/errorHandler');
const studentsRouter = require('./routes/students');
const coursesRouter = require('./routes/courses');
const enrollmentsRouter = require('./routes/enrollments');

// Output of `npm run build` in the frontend workspace.
const DIST_DIR = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

function createApp() {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({ limit: '100kb' }));

    // ---- REST API ----
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', database: isDatabaseReady() ? 'connected' : 'disconnected' });
    });

    app.use('/api', requireDatabase);
    app.use('/api/students', studentsRouter);
    app.use('/api/courses', coursesRouter);
    app.use('/api/enrollments', enrollmentsRouter);

    app.use('/api', (req, res) => {
        res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
    });

    // ---- Built Vue application ----
    app.use(express.static(DIST_DIR, { index: false }));

    // History-mode fallback: any non-file GET (e.g. /courses) returns index.html
    // so refreshing a routed page never produces a 404.
    app.get('/{*path}', (req, res, next) => {
        if (path.extname(req.path)) return next(); // missing asset -> real 404
        if (!fs.existsSync(INDEX_HTML)) {
            return res
                .status(503)
                .type('text/plain')
                .send('Frontend build not found. Run "npm run build" and restart the server.');
        }
        return res.sendFile(INDEX_HTML);
    });

    app.use((req, res) => res.status(404).type('text/plain').send('Not found'));
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
