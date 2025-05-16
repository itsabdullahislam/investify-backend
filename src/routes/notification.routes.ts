import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticateUser } from "../middleware/auth";

const router = Router();


router.get("/my-notifications", authenticateUser,NotificationController.getNotifications)

export default router;
