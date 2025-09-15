"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizer = exports.admin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const protect = (req, res, next) => {
    const authReq = req;
    if (authReq.headers.authorization && authReq.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            const token = authReq.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
            // Attach user to the request object
            authReq.user = decoded;
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.protect = protect;
const admin = (req, res, next) => {
    const authReq = req;
    if (authReq.user && authReq.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};
exports.admin = admin;
const organizer = (req, res, next) => {
    const authReq = req;
    if (authReq.user && (authReq.user.role === 'organizer' || authReq.user.role === 'admin')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as an organizer' });
    }
};
exports.organizer = organizer;
