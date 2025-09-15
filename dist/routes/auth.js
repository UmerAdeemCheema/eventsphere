"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const config_1 = require("../config");
const router = express_1.default.Router();
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, config_1.JWT_SECRET, {
        expiresIn: '30d',
    });
};
// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, enrollmentNo, phone, department } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }
    try {
        const [userExists] = await db_1.default.query('SELECT email FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const password_hash = await bcryptjs_1.default.hash(password, salt);
        const role = 'participant'; // Default role
        const [result] = await db_1.default.query('INSERT INTO users (name, email, password_hash, role, enrollment_no, phone, department) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, email, password_hash, role, enrollmentNo, phone, department]);
        const newUser = { id: result.insertId, name, email, role, enrollmentNo, phone, department };
        res.status(201).json({
            user: newUser,
            token: generateToken(newUser.id, newUser.role),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const user = users[0];
        if (await bcryptjs_1.default.compare(password, user.password_hash)) {
            const userForClient = { ...user };
            delete userForClient.password_hash;
            // Fetch favorite IDs
            const [favEvents] = await db_1.default.query('SELECT event_id FROM favorite_events WHERE user_id = ?', [user.id]);
            const [favMedia] = await db_1.default.query('SELECT media_id FROM favorite_media WHERE user_id = ?', [user.id]);
            userForClient.favoriteEventIds = favEvents.map((row) => row.event_id);
            userForClient.favoriteMediaIds = favMedia.map((row) => row.media_id);
            res.json({
                user: userForClient,
                token: generateToken(user.id, user.role),
            });
        }
        else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// GET /api/auth/me
router.get('/me', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    try {
        const userId = authReq.user?.id;
        const [rows] = await db_1.default.query('SELECT id, name, email, role, department, enrollment_no, phone FROM users WHERE id = ?', [userId]);
        if (rows.length > 0) {
            const user = rows[0];
            // Fetch favorite IDs
            const [favEvents] = await db_1.default.query('SELECT event_id FROM favorite_events WHERE user_id = ?', [userId]);
            const [favMedia] = await db_1.default.query('SELECT media_id FROM favorite_media WHERE user_id = ?', [userId]);
            user.favoriteEventIds = favEvents.map((row) => row.event_id);
            user.favoriteMediaIds = favMedia.map((row) => row.media_id);
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.default = router;
