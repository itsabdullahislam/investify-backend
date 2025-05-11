import { Router } from "express";
import {
  likeCampaignController,
  unlikeCampaignController,
  getUserLikedCampaignsController
} from "../controllers/like.controller";

const router = Router();

router.post("/like", likeCampaignController);
router.post("/unlike", unlikeCampaignController);
router.get("/likes/:userId", getUserLikedCampaignsController);

export default router;
