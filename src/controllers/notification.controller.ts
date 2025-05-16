import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Notification } from "../entities/notification.entity"; // <- this was missing
import { NotificationService } from "../services/notification.service";

export class NotificationController {
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // assuming req.user is populated via auth middleware
      if (!userId) {
         res.status(401).json({ message: "Unauthorized" });
         return
      }

      const notificationRepo = AppDataSource.getRepository(Notification);
      const notifications = await notificationRepo.find({
        where: { recipient: { user_id: userId } }, // Note: recipient is a relation
        order: { createdAt: "DESC" },
        relations: ["recipient"], // include relation if needed
      });

       res.status(200).json(notifications);
       
    } catch (err) {
      console.error("Error fetching notifications:", err);
       res.status(500).json({ message: "Internal server error" });
      
    }
  }
}
