"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'db4free.net',
    user: process.env.DB_USER || 'eventsphere1',
    password: process.env.DB_PASSWORD || 'eventsphere1',
    database: process.env.DB_NAME || 'eventsphere1',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
pool.getConnection()
    .then(connection => {
    console.log('Successfully connected to the database.');
    connection.release();
})
    .catch(err => {
    console.error('Error connecting to the database:', err);
});
exports.default = pool;
