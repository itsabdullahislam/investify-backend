// src/controllers/chat.controller.ts
import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { Message } from "../entities/message.entity";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user";

export const ChatController = {
  async sendMessage(req: Request, res: Response) {
    const { senderId, receiverId, content } = req.body;
    const message = await ChatService.createMessage(senderId, receiverId, content);
    res.status(201).json(message);
  },

  async getMessages(req: Request, res: Response) {
    const { user1Id, user2Id } = req.params;
    const messages = await ChatService.getMessagesBetweenUsers(+user1Id, +user2Id);
    res.json(messages);
  },


  async getUserList(req: Request, res: Response){
    try {
    const currentUserId = req.user?.id ?? null; // Assuming user is authenticated and `req.user` is populated
    if (!currentUserId) {
       res.status(400).json({ message: "User is not authenticated" });
       return
    }
    const users = await ChatService.getAllUsersExceptCurrent(currentUserId);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
  },

 async getUnreadMessageCount(req: Request, res: Response){
  try {
    const currentUserId = req.user?.id ?? null; // assuming user is set by auth middleware

    const messageRepo = AppDataSource.getRepository(Message);

    const unreadCount = await AppDataSource.getRepository(Message)
  .createQueryBuilder("message")
  .where("message.receiverUserId = :userId", { userId: currentUserId })
  .andWhere("message.status != :status", { status: "seen" }) // or 'read'
  .getCount();


     res.status(200).json({ count: unreadCount });
  } catch (err) {
    console.error("Error fetching unread message count:", err);
     res.status(500).json({ message: "Internal Server Error" });
  }
 },



 async searchUsers(req:Request , res:Response){
  const currentUserId = req.user?.id; // from authMiddleware
  const query = req.query.query?.toString().toLowerCase() || "";

  try {
    if (!query.trim()) {
       res.status(400).json({ message: "Search query is required" });
    }

    const userRepo = AppDataSource.getRepository(User);

    const users = await userRepo
      .createQueryBuilder("user")
      .where("LOWER(user.name) LIKE :query ", {
        query: `%${query}%`,
      })
      .andWhere("user.user_id != :currentUserId", { currentUserId })
      .select(["user.user_id", "user.name", "user.email", "user.role"])
      .limit(10)
      .getMany();

     res.json(users);
  } catch (err) {
    console.error("User search failed", err);
     res.status(500).json({ message: "Server error" });
  }
 }

};
