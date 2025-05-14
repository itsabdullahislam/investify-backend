import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user";
import { Campaign } from "../entities/campaign.entity";
import { Innovator } from "../entities/innovator.entity";
import { Investor } from "../entities/investor.entity";
import { where } from "sequelize";

const campaignRepository = AppDataSource.getRepository(Campaign);
const userRepository = AppDataSource.getRepository(User);
const innovatorRepository = AppDataSource.getRepository(Innovator);
const investorRepository = AppDataSource.getRepository(Investor);

export const search = {
  userSearch: async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.query as string)?.toLowerCase();
  

    if (!query){
      res.status(400).json({ error: "Query is required" });
      return
    } 

    try {
      const results: any = {};

       {
        const campaignsQueryBuilder = campaignRepository
  .createQueryBuilder("campaign")
  .leftJoinAndSelect("campaign.innovator", "innovator")
  .leftJoinAndSelect("innovator.user", "user")
  .where("campaign.status = :status", { status: "accepted" })
  .andWhere(
    "(LOWER(campaign.title) LIKE :query OR LOWER(campaign.description) LIKE :query)",
    { query: `%${query.toLowerCase()}%` }
  );

       
        
        const campaigns = await campaignsQueryBuilder.getMany();
        results.campaigns = campaigns;
      }

     // ---------- INVESTORS ----------
      {
        const investors = await investorRepository
  .createQueryBuilder("investor")
  .leftJoinAndSelect("investor.user", "user") // JOIN USER
  .leftJoinAndSelect("investor.investments", "investment")
  .leftJoinAndSelect("investment.campaign", "campaigns")
  .where("user.role = :role", { role: "investor" })
  //.andWhere("campaigns.status = :status", { status : "accepted"})
  .andWhere("LOWER(user.name) LIKE :query", { query: `%${query.toLowerCase()}%` })
  .getMany();


        results.investors = investors.map((inv) => ({
          user_id: inv.user.user_id,
          name: inv.user.name,
          image: inv.profile_picture,
          phoneNumber: inv.user.phone_number,
          companyName: inv.company_name,
          companyDescription: inv.company_description,
          interest: inv.interest,
          campaigns: inv.investments?.map((i: any) => i.campaign)
    .filter((c: any) => c?.status === "accepted") || [],
          flag:0,
        }));
      }

      // ---------- INNOVATORS ----------
      {
        const innovators = await innovatorRepository
  .createQueryBuilder("innovator")
  .leftJoinAndSelect("innovator.user", "user") // JOIN USER
  .leftJoinAndSelect("innovator.campaigns", "campaigns")
  .where("user.role = :role", { role: "innovator" })
  //.andWhere("campaigns.status = :status", { status : "accepted"})
  .andWhere("LOWER(user.name) LIKE :query", { query: `${query}%` })
  .getMany();


        results.innovators = innovators.map((ino) => ({
          user_id: ino.user.user_id,
          name: ino.user.name,
          image: ino.profile_picture,
          phoneNumber : ino.user.phone_number,
          companyName: ino.company_name,
          companyDescription: ino.company_description,
          campaigns: ino.campaigns?.filter((c: any) => c?.status === "accepted") || [],
          Likes: ino.campaigns?.length || 0,
          flag:1,
        }));
      }

      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
