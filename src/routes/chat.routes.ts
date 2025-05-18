// src/routes/chat.routes.ts
import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authenticateUser } from "../middleware/auth";

const router = Router();

router.post("/send", ChatController.sendMessage);
// router.get("/:user1Id/:user2Id", ChatController.getMessages);
router.get("/users", authenticateUser, ChatController.getUserList);
router.get("/unread-count", authenticateUser, ChatController.getUnreadMessageCount);
router.get("/search", authenticateUser, ChatController.searchUsers);

export default router;
