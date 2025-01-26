"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = __importDefault(require("pg"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../config/logger"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = isProduction
    ? process.env.DATABASE_URL
    : `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;
const db = new pg_1.default.Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});
db.connect()
    .then(() => {
    logger_1.default.info('Connected to database');
})
    .catch((error) => {
    logger_1.default.error('An error occurred while connecting:', error);
});
exports.default = db;
