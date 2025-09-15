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
// PUT /api/users/:id/profile
router.put('/:id/profile', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    const userId = parseInt(req.params.id);
    if (authReq.user.id !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    const { name, department, enrollmentNo, currentPassword, newPassword } = req.body;
    try {
        let query = 'UPDATE users SET name = ?, department = ?, enrollment_no = ?';
        const params = [name, department, enrollmentNo];
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new one.' });
            }
            const [users] = await db_1.default.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
            const user = users[0];
            if (!user || !(await bcryptjs_1.default.compare(currentPassword, user.password_hash))) {
                return res.status(400).json({ message: 'Invalid current password' });
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const new_password_hash = await bcryptjs_1.default.hash(newPassword, salt);
            query += ', password_hash = ?';
            params.push(new_password_hash);
        }
        query += ' WHERE id = ?';
        params.push(userId);
        await db_1.default.query(query, params);
        const [updatedUsers] = await db_1.default.query('SELECT id, name, email, role, department, enrollment_no, phone FROM users WHERE id = ?', [userId]);
        res.json(updatedUsers[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// --- FAVORITES ---
// GET /api/users/favorites/media
router.get('/favorites/media', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    try {
        const [media] = await db_1.default.query('SELECT m.* FROM media m JOIN favorite_media fm ON m.id = fm.media_id WHERE fm.user_id = ?', [authReq.user.id]);
        res.json(media);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// POST /api/users/favorites/media (Toggle)
router.post('/favorites/media', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    const { mediaId } = authReq.body;
    const userId = authReq.user.id;
    try {
        const [exists] = await db_1.default.query('SELECT * FROM favorite_media WHERE user_id = ? AND media_id = ?', [userId, mediaId]);
        if (exists.length > 0) {
            await db_1.default.query('DELETE FROM favorite_media WHERE user_id = ? AND media_id = ?', [userId, mediaId]);
        }
        else {
            await db_1.default.query('INSERT INTO favorite_media (user_id, media_id) VALUES (?, ?)', [userId, mediaId]);
        }
        const [users] = await db_1.default.query('SELECT id, name, email, role, department, enrollment_no, phone FROM users WHERE id = ?', [userId]);
        const user = users[0];
        const [favEvents] = await db_1.default.query('SELECT event_id FROM favorite_events WHERE user_id = ?', [userId]);
        const [favMedia] = await db_1.default.query('SELECT media_id FROM favorite_media WHERE user_id = ?', [userId]);
        user.favoriteEventIds = favEvents.map((row) => row.event_id);
        user.favoriteMediaIds = favMedia.map((row) => row.media_id);
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// GET /api/users/favorites/events
router.get('/favorites/events', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    try {
        const [events] = await db_1.default.query(`SELECT e.*, u.name as organizerName FROM events e 
            JOIN favorite_events fe ON e.id = fe.event_id 
            JOIN users u ON e.organizer_id = u.id
            WHERE fe.user_id = ?`, [authReq.user.id]);
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// POST /api/users/favorites/events (Toggle)
router.post('/favorites/events', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    const { eventId } = authReq.body;
    const userId = authReq.user.id;
    try {
        const [exists] = await db_1.default.query('SELECT * FROM favorite_events WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        if (exists.length > 0) {
            await db_1.default.query('DELETE FROM favorite_events WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        }
        else {
            await db_1.default.query('INSERT INTO favorite_events (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
        }
        const [users] = await db_1.default.query('SELECT id, name, email, role, department, enrollment_no, phone FROM users WHERE id = ?', [userId]);
        const user = users[0];
        const [favEvents] = await db_1.default.query('SELECT event_id FROM favorite_events WHERE user_id = ?', [userId]);
        const [favMedia] = await db_1.default.query('SELECT media_id FROM favorite_media WHERE user_id = ?', [userId]);
        user.favoriteEventIds = favEvents.map((row) => row.event_id);
        user.favoriteMediaIds = favMedia.map((row) => row.media_id);
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.default = router;
