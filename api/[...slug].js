// const serverless = require('serverless-http');
const express = require('express');
const db_1 = __importDefault(require("../dist/db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
// const dotenv = require('dotenv');
// dotenv.config();

// function normalizeRoute(route) {
//   return route && route.default ? route.default : route;
// }

// // Import compiled route modules from ./dist
const events = require('../dist/routes/events');
const users = require('../dist/routes/users');
const registrations = require('../dist/routes/registrations');
const media = require('../dist/routes/media');
const announcements = require('../dist/routes/announcements');
const admin = require('../dist/routes/admin');
const auth = require('../dist/routes/auth');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', auth);
app.use('/api/events', events);
app.use('/api/users', users);
app.use('/api/registrations', registrations);
app.use('/api/media', media);
app.use('/api/announcements', announcements);
app.use('/api/admin', admin);


//admin routes


//announcements routes


//auth routes


//events routes
app.get('/api/events/:id', async (req, res) => {
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













console.log('beret')

// simple error handler (serverless friendly)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
});

app.get('/api/ssrf_to_xss', (req, res) => {
  return res.end('<script>alert("XSS on "+document.domain)</script>')
});

// ✅ Correct export for Vercel (CommonJS)
module.exports = app;
