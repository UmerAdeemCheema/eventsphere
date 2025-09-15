const serverless = require('serverless-http');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

function normalizeRoute(route) {
  return route && route.default ? route.default : route;
}

// Import compiled route modules from ./dist
const events = normalizeRoute(require('../dist/routes/events'));
const users = normalizeRoute(require('../dist/routes/users'));
const registrations = normalizeRoute(require('../dist/routes/registrations'));
const media = normalizeRoute(require('../dist/routes/media'));
const announcements = normalizeRoute(require('../dist/routes/announcements'));
const admin = normalizeRoute(require('../dist/routes/admin'));
const auth = normalizeRoute(require('../dist/routes/auth'));

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

// simple error handler (serverless friendly)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
});

// ✅ Correct export for Vercel (CommonJS)
module.exports = serverless(app);
