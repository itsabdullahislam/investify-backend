"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chat.routes.ts
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/send", chat_controller_1.ChatController.sendMessage);
router.get("/:user1Id/:user2Id", chat_controller_1.ChatController.getMessages);
router.get("/users", auth_1.authenticateUser, chat_controller_1.ChatController.getUserList);
router.get("/unread-count", auth_1.authenticateUser, chat_controller_1.ChatController.getUnreadMessageCount);
router.get("/search", auth_1.authenticateUser, chat_controller_1.ChatController.searchUsers);
exports.default = router;
