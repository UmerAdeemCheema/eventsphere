// "use strict";
// var __importDefault = (this && this.__importDefault) || function (mod) {
//     return (mod && mod.__esModule) ? mod : { "default": mod };
// };
// Object.defineProperty(exports, "__esModule", { value: true });
// const express_1 = __importDefault(require("express"));
// const cors_1 = __importDefault(require("cors"));
// const dotenv_1 = __importDefault(require("dotenv"));
// // Load environment variables
// dotenv_1.default.config();
// // Import routes
// const auth_1 = __importDefault(require("./routes/auth"));
// const events_1 = __importDefault(require("./routes/events"));
// const users_1 = __importDefault(require("./routes/users"));
// const registrations_1 = __importDefault(require("./routes/registrations"));
// const media_1 = __importDefault(require("./routes/media"));
// const announcements_1 = __importDefault(require("./routes/announcements"));
// const admin_1 = __importDefault(require("./routes/admin"));
// const app = (0, express_1.default)();
// const PORT = process.env.PORT || 3001;
// // Middleware
// app.use((0, cors_1.default)()); // Enable Cross-Origin Resource Sharing
// // Increase payload size limit to handle large Base64 images
// app.use(express_1.default.json({ limit: '50mb' }));
// app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// // API Routes
// app.use('/api/auth', auth_1.default);
// app.use('/api/events', events_1.default);
// app.use('/api/users', users_1.default);
// app.use('/api/registrations', registrations_1.default);
// app.use('/api/media', media_1.default);
// app.use('/api/announcements', announcements_1.default);
// app.use('/api/admin', admin_1.default);
// // Simple error handler middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send({ message: 'Something broke!', error: err.message });
// });
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
