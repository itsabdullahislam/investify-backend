// notification.service.ts

import { AppDataSource } from "../config/data-source";
import { Notification } from "../entities/notification.entity";
import { User } from "../entities/user";
import { getIO } from "../socket/socket";

export class NotificationService {
  static async send(userId: number, message: string) {
    const notificationRepo = AppDataSource.getRepository(Notification);
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOneBy({ user_id: userId });
    if (!user) throw new Error("User not found");

    const notification = notificationRepo.create({
      recipient: user,
      message,
    });
    
    await notificationRepo.save(notification);
    getIO().to(`user_${userId}`).emit("new_notification", notification);
  }
}
