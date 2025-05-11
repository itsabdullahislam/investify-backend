import { Request, Response } from "express";
import { likeCampaign, unlikeCampaign, getUserLikedCampaigns } from "../services/like.service";

export const likeCampaignController = async (req: Request, res: Response) => {
    const userId = Number(req.body.userId);
    const campaignId = Number(req.body.campaignId);
  try {
    const like = await likeCampaign(userId, campaignId);
    res.status(200).json(like);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const unlikeCampaignController = async (req: Request, res: Response) => {
  const userId = parseInt(req.body.userId, 10);
  const campaignId = Number(req.body.campaignId);

  try {
    const result = await unlikeCampaign(userId, campaignId);
    res.status(200).json({ message: "Unliked successfully" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getUserLikedCampaignsController = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  try {
    const likedCampaignIds = await getUserLikedCampaigns(userId);
    res.status(200).json(likedCampaignIds);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
