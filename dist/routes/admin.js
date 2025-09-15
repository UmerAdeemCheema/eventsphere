"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
// All routes in this file are protected and require admin privileges
router.use(authMiddleware_1.protect);
router.use(authMiddleware_1.admin);
// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [usersByRole] = await db_1.default.query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
        const [eventsByStatus] = await db_1.default.query("SELECT status, COUNT(*) as count FROM events GROUP BY status");
        const stats = {
            usersByRole: usersByRole.reduce((acc, row) => ({ ...acc, [row.role]: row.count }), {}),
            eventsByStatus: eventsByStatus.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {})
        };
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const [users] = await db_1.default.query('SELECT id, name, email, role, department, enrollment_no, phone FROM users');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
    const { role } = req.body;
    try {
        await db_1.default.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        await db_1.default.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// POST /api/admin/organizers
router.post('/organizers', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        const password_hash = await bcryptjs_1.default.hash(password, salt);
        const [result] = await db_1.default.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, password_hash, 'organizer']);
        res.status(201).json({ id: result.insertId, name, email, role: 'organizer' });
    }
    catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// PUT /api/admin/events/:id/status
router.put('/events/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db_1.default.query('UPDATE events SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Event status updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// POST /api/admin/announcements
router.post('/announcements', async (req, res) => {
    const { title, message, targetRole } = req.body;
    try {
        await db_1.default.query('INSERT INTO announcements (title, message, target_role) VALUES (?, ?, ?)', [title, message, targetRole]);
        res.status(201).json({ message: 'Announcement created' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.default = router;
