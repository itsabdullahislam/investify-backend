import { AppDataSource } from "../config/data-source";
import { Campaign } from "../entities/campaign.entity";
import { User } from "../entities/user";
import axios from "axios";
import { Innovator } from "../entities/innovator.entity";

export const createCampaignService = async (
  user_id: number,
  title: string,
  description: string,
  target_funding_goal: number,
  published_date: Date,
  funding_type: string | null,
  demo_url: string | null,
  video: string | null,
  image: string | null,
  equity_offered: number | null,
  category: string | null,
  docs: string[] | null // Added docs parameter
) => {
  const campaignRepo = AppDataSource.getRepository(Campaign);
  const userRepo = AppDataSource.getRepository(User);

  try {
    // 1. Find user
    const user = await userRepo.findOne({
      where: { user_id },
    });

    if (!user || user.role !== "innovator") {
      throw new Error("Only innovators can create campaigns.");
    }

    // 2. Create campaign
    const campaign = new Campaign();
    const innovatorRepo = AppDataSource.getRepository(Innovator);
    const innovator = await innovatorRepo.findOne({
      where: { user: { user_id } },
      relations: ["user"],
    });

    if (!innovator) {
      throw new Error("Innovator profile not found.");
    }

    campaign.innovator = innovator;

    campaign.title = title;
    campaign.description = description;
    campaign.target_funding_goal = target_funding_goal;
    campaign.current_funding_raised = 0;
    campaign.published_date = published_date;
    campaign.status = "pending"; // Initially pending
    campaign.funding_type = funding_type || "equity";
    campaign.demo_url = demo_url || null;
    campaign.video = video || null;
    campaign.image = image || null;
    campaign.equity_offered = equity_offered || null;
    campaign.category = category || null;
    campaign.likes = [];
    campaign.docs = docs || [];

    // 3. Save campaign initially
    const savedCampaign = await campaignRepo.save(campaign);
    // Increment campaign count for the innovator

    if (innovator) {
      innovator.campaigns_count = (innovator.campaigns_count || 0) + 1;
      await innovatorRepo.save(innovator);
    }

    // 4. Call novelty API
    try {
      const noveltyResponse = await axios.post(
        "http://localhost:8000/check-novelty",
        {
          title: savedCampaign.title,
          description: savedCampaign.description,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Novelty API Response:", noveltyResponse.data);

      if (!noveltyResponse.data.is_novel) {
        savedCampaign.status = "accepted";
      } else {
        savedCampaign.status = "rejected";
      }

      // 5. Save updated campaign status
      await campaignRepo.save(savedCampaign);
    } catch (noveltyError) {
      console.error("Error calling novelty AI model:", noveltyError);
      // Optionally leave status as 'pending'
    }

    // 6. Return saved campaign (with final status)
    return { savedCampaign, count: innovator ? innovator.campaigns_count : 0 };
  } catch (error) {
    console.error("Service Error creating campaign:", (error as Error).message);
    throw error; // throw original error, not custom string
  }
};

export const getAllCampaignsService = async () => {
  const campaignRepo = AppDataSource.getRepository(Campaign);

  try {
    const campaigns = await campaignRepo.find({
       where: { status: 'accepted' },
      relations: ['innovator', 'innovator.user'],
      order: { published_date: 'DESC' },
    });

    const formattedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
      const innovator = campaign.innovator;
      const user = innovator?.user;

      // Get all campaigns for this innovator
      const allCampaignsByInnovator = await campaignRepo.find({
        where: {
          innovator: { innovator_id: innovator?.innovator_id },
          status: 'accepted',
        },
        relations: ['innovator'],
      });

      return {
        ...campaign,
        innovator_name: user?.name || 'Unknown',
        company_name: innovator?.company_name || 'Unknown',
        company_description: innovator?.company_description || 'No description available',
        campaigns_count: innovator?.campaigns_count || 0,
        number: user?.phone_number || 'Not available',
        allCampaignsByInnovator: allCampaignsByInnovator.map(campaign => ({
          campaign_id: campaign.campaign_id,
          title: campaign.title,
          image: campaign.image,
          description: campaign.description,
          target_funding_goal: campaign.target_funding_goal,
          status: campaign.status,
        })),
      };
    }));

    return formattedCampaigns;
  } catch (error) {
    console.error("Error fetching campaigns:", (error as Error).message);
    throw error;
  }
};


export const getCampaignsByInnovatorId = async (
  userId: number
): Promise<Campaign[]> => {
  const innovatorRepository = AppDataSource.getRepository(Innovator);
  const campaignRepository = AppDataSource.getRepository(Campaign);

  const innovator = await innovatorRepository.findOne({
    where: { user: { user_id: Number(userId) } },
    relations: ["user"],
  });

  if (!innovator) {
    throw new Error("Innovator not found");
  }

  const campaigns = await campaignRepository
    .createQueryBuilder("campaign")
    .leftJoin("campaign.innovator", "innovator")
    .where("innovator.innovator_id = :id", { id: innovator.innovator_id })
    .loadRelationCountAndMap("campaign.totalLikes", "campaign.likes")
    .getMany();

  return campaigns;
};


export const getTrendingCampaigns = async (): Promise<Campaign[]> => {
  const campaignRepo = AppDataSource.getRepository(Campaign);
  const user = AppDataSource.getRepository(User);

  const result = await AppDataSource.query(`
    SELECT 
      c.*,
      i."company_name" AS "company_name",
      i."campaigns_count" AS "campaigns_count",
      i."company_description" AS "company_description",
      u."user_id",
      u."name" AS "innovator_name",
      u."phone_number" AS "number",
      (
        SELECT COUNT(*) 
        FROM "like" l 
        WHERE l."campaignCampaignId" = c."campaign_id"
      ) AS "likesCount",
      (
        SELECT json_agg(all_camps)
        FROM (
          SELECT 
            c2."campaign_id", 
            c2."title", 
            c2."description",
            c2."target_funding_goal",
            c2."image",
            c2."status"
          FROM "campaigns" c2
          WHERE c2."innovator_id" = c."innovator_id"
        ) all_camps
      ) AS "allCampaignsByInnovator"
    FROM "campaigns" c
    LEFT JOIN "innovator" i ON i."innovator_id" = c."innovator_id"
    LEFT JOIN "users" u ON u."innovator_id" = i."innovator_id"
    ORDER BY 
      (
        SELECT COUNT(*) 
        FROM "like" l 
        WHERE l."campaignCampaignId" = c."campaign_id"
      ) DESC, 
      c."target_funding_goal" DESC
    LIMIT 3;
  `);
  

  return result;
};
