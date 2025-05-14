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
exports.ChatService = void 0;
const data_source_1 = require("../config/data-source");
const message_entity_1 = require("../entities/message.entity");
const user_1 = require("../entities/user");
exports.ChatService = {
    createMessage(senderId, receiverId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const sender = yield data_source_1.AppDataSource.getRepository(user_1.User).findOneByOrFail({ user_id: senderId });
            const receiver = yield data_source_1.AppDataSource.getRepository(user_1.User).findOneByOrFail({ user_id: receiverId });
            const message = data_source_1.AppDataSource.getRepository(message_entity_1.Message).create({
                sender,
                receiver,
                content,
                status: message_entity_1.MessageStatus.SENT,
            });
            return yield data_source_1.AppDataSource.getRepository(message_entity_1.Message).save(message);
        });
    },
    getMessagesBetweenUsers(user1Id, user2Id) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageRepo = data_source_1.AppDataSource.getRepository(message_entity_1.Message);
            // 1. Mark all messages sent from user2 to user1 as seen (i.e. seen by current user)
            yield messageRepo
                .createQueryBuilder()
                .update(message_entity_1.Message)
                .set({ status: message_entity_1.MessageStatus.SEEN })
                .where("senderUserId = :sender AND receiverUserId = :receiver AND status != :seen", {
                sender: user2Id,
                receiver: user1Id,
                seen: message_entity_1.MessageStatus.SEEN
            })
                .execute();
            // 2. Fetch all messages between user1 and user2
            return yield messageRepo
                .createQueryBuilder("message")
                .leftJoin("message.sender", "sender")
                .leftJoin("message.receiver", "receiver")
                .select([
                "message.id",
                "message.content",
                "message.createdAt",
                "message.status", // ✅ Add status to response
                "sender.user_id",
                "receiver.user_id"
            ])
                .where("(message.senderUserId = :user1 AND message.receiverUserId = :user2) OR (message.senderUserId = :user2 AND message.receiverUserId = :user1)", {
                user1: user1Id,
                user2: user2Id
            })
                .orderBy("message.createdAt", "ASC")
                .getMany();
        });
    },
    getAllUsersExceptCurrent(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = data_source_1.AppDataSource.manager;
            const results = yield entityManager.query(`
      SELECT
        u.user_id,
        u.name,
        u.role,
        m.content AS last_message,
        m."createdAt" AS last_message_time,
        COUNT(m_unread.id) AS unread_count
      FROM "users" u
      JOIN LATERAL (
        SELECT *
        FROM message
        WHERE 
          (message."senderUserId" = u.user_id AND message."receiverUserId" = $1)
          OR
          ( message."receiverUserId" = u.user_id AND message."senderUserId" = $1)
        ORDER BY "createdAt" DESC
        LIMIT 1
      ) m ON TRUE
      LEFT JOIN message m_unread ON 
        m_unread."senderUserId" = u.user_id AND
        m_unread."receiverUserId" = $1 AND
        m_unread.status != 'seen'
      WHERE u.user_id != $1
      GROUP BY u.user_id, u.name, u.role, m.content, m."createdAt"
      ORDER BY m."createdAt" DESC
    `, [user_id]);
            return results;
        });
    },
    markMessagesAsSeen(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate input parameters
            if (typeof senderId !== 'number' || isNaN(senderId)) {
                throw new Error(`Invalid senderId: ${senderId}`);
            }
            if (typeof receiverId !== 'number' || isNaN(receiverId)) {
                throw new Error(`Invalid receiverId: ${receiverId}`);
            }
            try {
                const result = yield data_source_1.AppDataSource.getRepository(message_entity_1.Message)
                    .createQueryBuilder()
                    .update(message_entity_1.Message)
                    .set({ status: message_entity_1.MessageStatus.SEEN })
                    .where("senderUserId = :senderId", { senderId })
                    .andWhere("receiverUserId = :receiverId", { receiverId })
                    .andWhere("status != :status", { status: message_entity_1.MessageStatus.SEEN })
                    .returning("id")
                    .execute();
                return result.raw.map((msg) => msg.id);
            }
            catch (error) {
                console.error('Error marking messages as seen:', {
                    senderId,
                    receiverId,
                    error: error instanceof Error ? error.message : error
                });
                throw new Error('Failed to update message status');
            }
        });
    },
};
