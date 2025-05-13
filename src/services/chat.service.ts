// src/services/chat.service.ts
import { Not } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Message, MessageStatus } from "../entities/message.entity";
import { User } from "../entities/user";


export const ChatService = {
  async createMessage(senderId: number, receiverId: number, content: string) {
    const sender = await AppDataSource.getRepository(User).findOneByOrFail({ user_id: senderId });
    const receiver = await AppDataSource.getRepository(User).findOneByOrFail({ user_id: receiverId });

    const message = AppDataSource.getRepository(Message).create({
      sender,
      receiver,
      content,
      status:MessageStatus.SENT,
    });
    return await AppDataSource.getRepository(Message).save(message);
  },

  async getMessagesBetweenUsers(user1Id: number, user2Id: number) {
  const messageRepo = AppDataSource.getRepository(Message);

  // 1. Mark all messages sent from user2 to user1 as seen (i.e. seen by current user)
  await messageRepo
    .createQueryBuilder()
    .update(Message)
    .set({ status: MessageStatus.SEEN })
    .where("senderUserId = :sender AND receiverUserId = :receiver AND status != :seen", {
      sender: user2Id,
      receiver: user1Id,
      seen: MessageStatus.SEEN
    })
    .execute();

  // 2. Fetch all messages between user1 and user2
  return await messageRepo
    .createQueryBuilder("message")
    .leftJoin("message.sender", "sender")
    .leftJoin("message.receiver", "receiver")
    .select([
      "message.id",
      "message.content",
      "message.createdAt",
      "message.status",               // ✅ Add status to response
      "sender.user_id",
      "receiver.user_id"
    ])
    .where(
      "(message.senderUserId = :user1 AND message.receiverUserId = :user2) OR (message.senderUserId = :user2 AND message.receiverUserId = :user1)",
      {
        user1: user1Id,
        user2: user2Id
      }
    )
    .orderBy("message.createdAt", "ASC")
    .getMany();
},



  async getAllUsersExceptCurrent(user_id: number) {
    const entityManager = AppDataSource.manager;

    const results = await entityManager.query(`
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
  },

  
async markMessagesAsSeen(senderId: number, receiverId: number): Promise<number[]> {
  // Validate input parameters
  if (typeof senderId !== 'number' || isNaN(senderId)) {
    throw new Error(`Invalid senderId: ${senderId}`);
  }
  
  if (typeof receiverId !== 'number' || isNaN(receiverId)) {
    throw new Error(`Invalid receiverId: ${receiverId}`);
  }

  try {
    const result = await AppDataSource.getRepository(Message)
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.SEEN })
      .where("senderUserId = :senderId", { senderId })
      .andWhere("receiverUserId = :receiverId", { receiverId })
      .andWhere("status != :status", { status: MessageStatus.SEEN })
      .returning("id")
      .execute();

    return result.raw.map((msg: { id: number }) => msg.id);
  } catch (error) {
    console.error('Error marking messages as seen:', {
      senderId,
      receiverId,
      error: error instanceof Error ? error.message : error
    });
    throw new Error('Failed to update message status');
  }
},



};
