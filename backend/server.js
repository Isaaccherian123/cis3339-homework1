const { mongoUri, port } = require('./src/config/env');
const { connectWithRetry, disconnect } = require('./src/config/db');
const createApp = require('./src/app');

const app = createApp();

const server = app.listen(port, (error) => {
    if (error) {
        console.error(
            error.code === 'EADDRINUSE'
                ? `Port ${port} is already in use. Stop the other process or change PORT in .env.`
                : `Could not start the server: ${error.message}`
        );
        process.exit(1);
    }
    console.log(`Server is running at http://localhost:${port}`);
});

connectWithRetry(mongoUri);

function shutdown(signal) {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
        await disconnect().catch(() => {});
        process.exit(0);
    });
    // Force exit if connections do not close quickly.
    setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
