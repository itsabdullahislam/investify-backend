import { AppDataSource } from "../config/data-source";
import { Like } from "../entities/like.entity";
import { User } from "../entities/user";
import { Campaign } from "../entities/campaign.entity";

export const likeCampaign = async (userId: number, campaignId: number): Promise<Like> => {
    const likeRepo = AppDataSource.getRepository(Like);
    const userRepo = AppDataSource.getRepository(User);
    const campaignRepo = AppDataSource.getRepository(Campaign);
  
    const existing = await likeRepo.findOne({
      where: {
        user: { user_id: userId },
        campaign: { campaign_id: campaignId }
      }
    });
  
    if (existing) {
      throw new Error("Campaign already liked");
    }
  
    const user = await userRepo.findOne({ where: { user_id: userId } });
    if (!user) throw new Error("User not found");
  
    const campaign = await campaignRepo.findOne({ where: { campaign_id: campaignId } });
    if (!campaign) throw new Error("Campaign not found");
  
    const newLike = likeRepo.create({ user, campaign });
    return await likeRepo.save(newLike);
  };
  
export const unlikeCampaign = async (userId: number, campaignId: number): Promise<void> => {
  const likeRepo = AppDataSource.getRepository(Like);

  const like = await likeRepo.findOne({
    where: {
      user: { user_id: userId },
      campaign: { campaign_id: campaignId }
    }
  });

  if (!like) {
    throw new Error("Like not found");
  }

  await likeRepo.remove(like);
};

export const getUserLikedCampaigns = async (userId: number): Promise<Like[]> => {
  const likeRepo = AppDataSource.getRepository(Like);

   return await likeRepo.find({
    where: {
      user: { user_id: userId },
    },
    relations: ["campaign", "user"], // <-- this is important
  });
};
