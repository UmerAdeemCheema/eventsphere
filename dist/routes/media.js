"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// GET /api/media
router.get('/', async (req, res) => {
    try {
        const [media] = await db_1.default.query('SELECT * FROM media ORDER BY created_at DESC');
        res.json(media);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// POST /api/media (Add media)
router.post('/', authMiddleware_1.protect, authMiddleware_1.organizer, async (req, res) => {
    const authReq = req;
    const { eventId, caption, fileData } = authReq.body;
    const uploadedBy = authReq.user.id;
    // The 'fileData' is expected to be a Base64 data URL.
    // The column type in the DB should be TEXT or LONGTEXT.
    const url = fileData;
    const type = 'image';
    try {
        const [result] = await db_1.default.query('INSERT INTO media (event_id, type, url, caption, uploaded_by) VALUES (?, ?, ?, ?, ?)', [eventId, type, url, caption, uploadedBy]);
        res.status(201).json({ id: result.insertId, eventId, type, url, caption, uploadedBy });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
module.exports = router;
