"use strict";

const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

let pool;

if (!global._dbPool) {
  global._dbPool = mysql.createPool({
    host: process.env.DB_HOST || "db4free.net",
    user: process.env.DB_USER || "eventsphere1",
    password: process.env.DB_PASSWORD || "eventsphere1",
    database: process.env.DB_NAME || "eventsphere1",
    port: parseInt(process.env.DB_PORT || "3306"),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

pool = global._dbPool;

module.exports = pool;
