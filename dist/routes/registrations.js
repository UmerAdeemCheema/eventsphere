"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// GET /api/registrations/my-registrations
router.get('/my-registrations', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    try {
        const [registrations] = await db_1.default.query(`SELECT 
                r.id as registrationId, 
                r.event_id as eventId, 
                r.student_id as studentId,
                r.registered_on as registeredOn,
                r.status,
                r.attended,
                r.feedback_rating,
                r.feedback_comment,
                r.certificate_fee_paid as certificateFeePaid
             FROM registrations r WHERE r.student_id = ?`, [authReq.user.id]);
        const formattedRegs = registrations.map((reg) => ({
            ...reg,
            feedback: {
                rating: reg.feedback_rating,
                comment: reg.feedback_comment
            },
            attended: !!reg.attended,
            certificateFeePaid: !!reg.certificateFeePaid
        }));
        res.json(formattedRegs);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// POST /api/registrations (Register for an event)
router.post('/', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    const { eventId } = authReq.body;
    const studentId = authReq.user.id;
    const connection = await db_1.default.getConnection();
    try {
        await connection.beginTransaction();
        const [events] = await connection.query('SELECT booked_seats, max_seats FROM events WHERE id = ? FOR UPDATE', [eventId]);
        if (events.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Event not found' });
        }
        const event = events[0];
        if (event.booked_seats >= event.max_seats) {
            await connection.rollback();
            return res.status(400).json({ message: 'Event is full' });
        }
        const [result] = await connection.query('INSERT INTO registrations (event_id, student_id, status) VALUES (?, ?, ?)', [eventId, studentId, 'confirmed']);
        await connection.query('UPDATE events SET booked_seats = booked_seats + 1 WHERE id = ?', [eventId]);
        await connection.commit();
        res.status(201).json({ registrationId: result.insertId, eventId, studentId, status: 'confirmed' });
    }
    catch (error) {
        await connection.rollback();
        // Handle unique constraint violation for re-registering
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'You are already registered for this event.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
    finally {
        connection.release();
    }
});
// DELETE /api/registrations/:id (Cancel registration)
router.delete('/:id', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    const registrationId = req.params.id;
    const studentId = authReq.user.id;
    const connection = await db_1.default.getConnection();
    try {
        await connection.beginTransaction();
        const [regs] = await connection.query('SELECT * FROM registrations WHERE id = ? AND student_id = ?', [registrationId, studentId]);
        if (regs.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Registration not found' });
        }
        const reg = regs[0];
        const eventId = reg.event_id;
        await connection.query('UPDATE registrations SET status = ? WHERE id = ?', ['cancelled', registrationId]);
        await connection.query('UPDATE events SET booked_seats = GREATEST(0, booked_seats - 1) WHERE id = ?', [eventId]);
        await connection.commit();
        res.json({ message: 'Registration cancelled successfully' });
    }
    catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server error', error: error.message });
    }
    finally {
        connection.release();
    }
});
// POST /api/registrations/:id/feedback
router.post('/:id/feedback', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    try {
        const { rating, comment } = req.body;
        await db_1.default.query('UPDATE registrations SET feedback_rating = ?, feedback_comment = ? WHERE id = ? AND student_id = ?', [rating, comment, req.params.id, authReq.user.id]);
        res.json({ message: 'Feedback submitted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// POST /api/registrations/:id/pay-certificate
router.post('/:id/pay-certificate', authMiddleware_1.protect, async (req, res) => {
    const authReq = req;
    try {
        await db_1.default.query('UPDATE registrations SET certificate_fee_paid = TRUE WHERE id = ? AND student_id = ?', [req.params.id, authReq.user.id]);
        res.json({ message: 'Payment successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// PUT /api/registrations/:id/attendance
router.put('/:id/attendance', authMiddleware_1.protect, async (req, res) => {
    try {
        const { attended } = req.body;
        await db_1.default.query('UPDATE registrations SET attended = ? WHERE id = ?', [attended, req.params.id]);
        res.json({ message: 'Attendance updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.default = router;
