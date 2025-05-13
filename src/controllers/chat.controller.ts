// src/controllers/chat.controller.ts
import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";

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



};
