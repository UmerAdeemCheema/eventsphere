"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.Router();
// GET /api/events
router.get('/', async (req, res) => {
    try {
        const [events] = await db_1.default.query(`
            SELECT 
                e.id, e.title, e.description, e.date, e.time, e.venue, e.category,
                e.organizer_id AS organizerId, 
                u.name AS organizerName, 
                e.banner_image AS bannerImage,
                e.status, 
                e.max_seats AS maxSeats, 
                e.booked_seats AS bookedSeats, 
                e.cancellation_cutoff_days AS cancellationCutoffDays
            FROM events e
            JOIN users u ON e.organizer_id = u.id
            ORDER BY e.date DESC
        `);
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// GET /api/events/:id
router.get('/:id', async (req, res) => {
    try {
        const [events] = await db_1.default.query(`
            SELECT 
                e.id, e.title, e.description, e.date, e.time, e.venue, e.category,
                e.organizer_id AS organizerId, 
                u.name AS organizerName, 
                e.banner_image AS bannerImage,
                e.status, 
                e.max_seats AS maxSeats, 
                e.booked_seats AS bookedSeats,
                e.cancellation_cutoff_days AS cancellationCutoffDays
            FROM events e
            JOIN users u ON e.organizer_id = u.id
            WHERE e.id = ?
        `, [req.params.id]);
        if (events.length > 0) {
            res.json(events[0]);
        }
        else {
            res.status(404).json({ message: 'Event not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// GET /api/events/organizer/:id
// router.get('/organizer/:id', authMiddleware_1.protect, authMiddleware_1.organizer, async (req, res) => {
//     try {
//         const [events] = await db_1.default.query(`
//             SELECT
//                 id, title, description, date, time, venue, category,
//                 organizer_id AS organizerId,
//                 banner_image AS bannerImage,
//                 status,
//                 max_seats AS maxSeats,
//                 booked_seats AS bookedSeats,
//                 cancellation_cutoff_days AS cancellationCutoffDays
//             FROM events WHERE organizer_id = ?
//         `, [req.params.id]);
//         res.json(events);
//     }
//     catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });
// // POST /api/events (Create event)
// router.post('/', authMiddleware_1.protect, authMiddleware_1.organizer, async (req, res) => {
//     const authReq = req;
//     const { title, description, date, time, venue, category, maxSeats, bannerImage, cancellationCutoffDays } = authReq.body;
//     const organizerId = authReq.user.id;
//     try {
//         const [result] = await db_1.default.query('INSERT INTO events (title, description, date, time, venue, category, max_seats, banner_image, cancellation_cutoff_days, organizer_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [title, description, date, time, venue, category, maxSeats, bannerImage, cancellationCutoffDays, organizerId, 'Pending Approval']);
//         res.status(201).json({ id: result.insertId, ...req.body });
//     }
//     catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });
// // PUT /api/events/:id (Update event)
// router.put('/:id', authMiddleware_1.protect, authMiddleware_1.organizer, async (req, res) => {
//     const authReq = req;
//     const { title, description, date, time, venue, category, maxSeats } = authReq.body;
//     try {
//         // First verify ownership
//         const [events] = await db_1.default.query('SELECT organizer_id FROM events WHERE id = ?', [req.params.id]);
//         if (events.length === 0)
//             return res.status(404).json({ message: 'Event not found' });
//         if (events[0].organizer_id !== authReq.user.id && authReq.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Not authorized to edit this event' });
//         }
//         await db_1.default.query('UPDATE events SET title = ?, description = ?, date = ?, time = ?, venue = ?, category = ?, max_seats = ? WHERE id = ?', [title, description, date, time, venue, category, maxSeats, req.params.id]);
//         res.json({ message: 'Event updated successfully' });
//     }
//     catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });
// // GET /api/events/:id/registrations
// router.get('/:id/registrations', authMiddleware_1.protect, authMiddleware_1.organizer, async (req, res) => {
//     try {
//         const [registrations] = await db_1.default.query(`SELECT r.*, u.id as userId, u.name, u.email 
//              FROM registrations r
//              JOIN users u ON r.student_id = u.id
//              WHERE r.event_id = ?`, [req.params.id]);
//         const formattedRegs = registrations.map((reg) => ({
//             registrationId: reg.id,
//             eventId: reg.event_id,
//             studentId: reg.student_id,
//             registeredOn: reg.registered_on,
//             status: reg.status,
//             attended: reg.attended,
//             feedback: {
//                 rating: reg.feedback_rating,
//                 comment: reg.feedback_comment
//             },
//             certificateFeePaid: reg.certificate_fee_paid,
//             participant: {
//                 id: reg.userId,
//                 name: reg.name,
//                 email: reg.email
//             }
//         }));
//         res.json(formattedRegs);
//     }
//     catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });
module.exports = router;