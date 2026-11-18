const path = require('path');
const dotenv = require('dotenv');

// The committed .env file lives at the repository root.
const ENV_PATH = path.resolve(__dirname, '..', '..', '..', '.env');
dotenv.config({ path: ENV_PATH });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error(`MONGODB_URI is not defined. Expected it in ${ENV_PATH}`);
    process.exit(1);
}

const port = Number.parseInt(process.env.PORT, 10) || 3000;

module.exports = { mongoUri, port };
