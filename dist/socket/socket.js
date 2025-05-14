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
exports.initSocket = initSocket;
// src/socket/socket.ts
const socket_io_1 = require("socket.io");
const chat_service_1 = require("../services/chat.service");
function initSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            credentials: true,
            methods: ["GET", "POST"]
        }
    });
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.on("join", (userId) => {
            socket.join(userId.toString());
        });
        socket.on("send_message", (data, callback) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId, content } = data;
            if (!receiverId || !senderId || !content) {
                console.error("Invalid message data:", data);
                return;
            }
            try {
                const saved = yield chat_service_1.ChatService.createMessage(senderId, receiverId, content);
                io.to(receiverId.toString()).emit("receive_message", saved);
                if (callback)
                    callback(saved);
            }
            catch (error) {
                console.error("Error saving message:", error);
            }
        }));
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
        socket.on("seen_messages", (_a) => __awaiter(this, [_a], void 0, function* ({ senderId, receiverId }) {
            if (!senderId || !receiverId || isNaN(senderId) || isNaN(receiverId)) {
                console.error('Invalid IDs in seen_messages:', { senderId, receiverId });
                return;
            }
            try {
                const updatedIds = yield chat_service_1.ChatService.markMessagesAsSeen(senderId, receiverId);
                io.to(senderId.toString()).emit("messages_seen", { messageIds: updatedIds });
                io.to(receiverId.toString()).emit("messages_updated", { messageIds: updatedIds });
            }
            catch (err) {
                console.error("Error updating message statuses to seen:", err);
            }
        }));
    });
}
