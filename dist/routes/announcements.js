"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
// GET /api/announcements
router.get('/', async (req, res) => {
    try {
        const [announcements] = await db_1.default.query(`
            SELECT id, title, message, target_role as target, created_at as date 
            FROM announcements ORDER BY created_at DESC
        `);
        res.json(announcements);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.default = router;
