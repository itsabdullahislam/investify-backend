"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
const message_entity_1 = require("../entities/message.entity");
const data_source_1 = require("../config/data-source");
const user_1 = require("../entities/user");
exports.ChatController = {
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId, content } = req.body;
            const message = yield chat_service_1.ChatService.createMessage(senderId, receiverId, content);
            res.status(201).json(message);
        });
    },
    getMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user1Id, user2Id } = req.params;
            const messages = yield chat_service_1.ChatService.getMessagesBetweenUsers(+user1Id, +user2Id);
            res.json(messages);
        });
    },
    getUserList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const currentUserId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null; // Assuming user is authenticated and `req.user` is populated
                if (!currentUserId) {
                    res.status(400).json({ message: "User is not authenticated" });
                    return;
                }
                const users = yield chat_service_1.ChatService.getAllUsersExceptCurrent(currentUserId);
                res.json(users);
            }
            catch (err) {
                console.error("Error fetching users:", err);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    },
    getUnreadMessageCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const currentUserId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null; // assuming user is set by auth middleware
                const messageRepo = data_source_1.AppDataSource.getRepository(message_entity_1.Message);
                const unreadCount = yield data_source_1.AppDataSource.getRepository(message_entity_1.Message)
                    .createQueryBuilder("message")
                    .where("message.receiverUserId = :userId", { userId: currentUserId })
                    .andWhere("message.status != :status", { status: "seen" }) // or 'read'
                    .getCount();
                res.status(200).json({ count: unreadCount });
            }
            catch (err) {
                console.error("Error fetching unread message count:", err);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    },
    searchUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // from authMiddleware
            const query = ((_b = req.query.query) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase()) || "";
            try {
                if (!query.trim()) {
                    res.status(400).json({ message: "Search query is required" });
                }
                const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
                const users = yield userRepo
                    .createQueryBuilder("user")
                    .where("LOWER(user.name) LIKE :query ", {
                    query: `%${query}%`,
                })
                    .andWhere("user.user_id != :currentUserId", { currentUserId })
                    .select(["user.user_id", "user.name", "user.email", "user.role"])
                    .limit(10)
                    .getMany();
                res.json(users);
            }
            catch (err) {
                console.error("User search failed", err);
                res.status(500).json({ message: "Server error" });
            }
        });
    }
};
