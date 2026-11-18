const mongoose = require('mongoose');
const { Student, Course, Enrollment } = require('../models');

// Collections and indexes are created explicitly once a connection is made,
// so startup against an empty or nonexistent database needs no manual setup.
mongoose.set('autoIndex', false);
mongoose.set('autoCreate', false);
mongoose.set('strictQuery', true);

let initialized = false;

async function initializeDatabase() {
    for (const model of [Student, Course, Enrollment]) {
        await model.createCollection();
        await model.syncIndexes();
    }
    initialized = true;
}

function describeUri(uri) {
    // Hide credentials if a URI with a password is ever used.
    return uri.replace(/\/\/([^@/]+)@/, '//***@');
}

/**
 * Connects to MongoDB, retrying until it succeeds. The HTTP server keeps
 * running while it waits and API calls receive a 503 response instead of
 * crashing the process.
 */
function connectWithRetry(uri, retryDelayMs = 5000) {
    return new Promise((resolve) => {
        const attempt = async () => {
            try {
                await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
                await initializeDatabase();
                console.log(`Connected to MongoDB database "${mongoose.connection.name}"`);
                resolve();
            } catch (error) {
                console.error(`MongoDB connection failed: ${error.message}`);
                console.error(
                    `Is MongoDB running at ${describeUri(uri)}? Retrying in ${retryDelayMs / 1000}s...`
                );
                await mongoose.disconnect().catch(() => {});
                setTimeout(attempt, retryDelayMs);
            }
        };
        attempt();
    });
}

mongoose.connection.on('disconnected', () => {
    if (initialized) console.warn('MongoDB disconnected. Waiting for it to reconnect...');
});
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));

function isDatabaseReady() {
    return initialized && mongoose.connection.readyState === 1;
}

async function disconnect() {
    await mongoose.disconnect();
}

module.exports = { connectWithRetry, isDatabaseReady, disconnect };
