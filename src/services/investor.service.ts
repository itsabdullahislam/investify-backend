import { Investor } from '../entities/investor.entity';
import { Investment } from '../entities/investment';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user';
import { Campaign } from '../entities/campaign.entity';
import moment from 'moment';
import { Like } from '../entities/like.entity';
import { In, Not } from 'typeorm';
import { where } from 'sequelize';

interface UpdateProfileData {
    name?: string;
    phone_number?: string;
    company_name?: string;
    company_description?: string;
  }
  

export class InvestorService {


  static async setInterest(userId: number, interests: string[]){

     const investorRepo = AppDataSource.getRepository(Investor);
     const investor = await investorRepo.findOne({
      where: { investor_id: userId },
    });

    if (!investor) {
      throw new Error("Investor not found");
    }

    investor.interest = interests;
    await investorRepo.save(investor);

    return investor;
  }
  

  static async getInvestorProfile(user_id: number) {
    const userRepo = AppDataSource.getRepository(User);
    const investmentRepo = AppDataSource.getRepository(Investment);
  
    const user = await userRepo
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.investor', 'investor')
  .where('user.user_id = :user_id', { user_id })
  .getOne();

    if (!user || !user.investor) { {
      throw new Error('Investor profile not found');
    }
  }
 const investmentStats = await investmentRepo
    .createQueryBuilder('investment')
    .select('COUNT(DISTINCT investment.campaign_id)', 'uniqueCampaigns')
    .addSelect('SUM(investment.amount)', 'totalAmountInvested')
    .where('investment.investor_id = :investorId', { investorId: user.investor.investor_id })
    .getRawOne();

  return {
    user,
    uniqueCampaigns: Number(investmentStats.uniqueCampaigns || 0),
    totalAmountInvested: Number(investmentStats.totalAmountInvested || 0),
  };
}

 static async updateInvestorProfile(userId: number, filePath: string) {
  const investorRepo = AppDataSource.getRepository(Investor);
  const investor = await investorRepo.findOne({
    where: { user: { user_id: userId } },
    relations: ["user"],
  });

  if (!investor) {
    throw new Error("Investor not found");
  }

  investor.profile_picture = filePath;
  await investorRepo.save(investor);
  
};  


 static async updateInvestorProfileInfo(
  user_id: number,
  updates: UpdateProfileData
) {
  const userRepo = AppDataSource.getRepository(User);
      const innovatorRepo = AppDataSource.getRepository(Investor);
    
      const user = await userRepo.findOne({
        where: { user_id },
        relations: ['investor'],
      });
    
      if (!user || user.role !== 'investor') {
        throw new Error('User not found or is not an investor.');
      }
    
      // Update user table fields
      if (updates.name) user.name = updates.name;
      if (updates.phone_number) user.phone_number = updates.phone_number;
      await userRepo.save(user);
    
      const investor = user.investor;
    
      if (investor) {
        if (updates.company_name) investor.company_name = updates.company_name;
        if (updates.company_description) investor.company_description = updates.company_description;
        await innovatorRepo.save(investor);
      }
    
      return { user };
};
  

static async getRankedInvestors(userId: number) {
  const investmentRepo = AppDataSource.getRepository(Investment);
  const investorRepo = AppDataSource.getRepository(Investor);
  const campaignRepo = AppDataSource.getRepository(Campaign);
  

  // Step 1: Aggregate investment stats by investor
  const result = await investmentRepo
    .createQueryBuilder("investment")
    .select("investment.investor_id", "investorId")
    .addSelect("COUNT(*)", "totalInvestments")
    .addSelect("COUNT(DISTINCT investment.campaign_id)", "uniqueCampaigns")
    .addSelect("SUM(investment.amount)", "totalAmountInvested")
    .groupBy("investment.investor_id")
    .orderBy("COUNT(*)", "DESC")
    .addOrderBy("COUNT(DISTINCT investment.campaign_id)", "DESC")
    .addOrderBy("SUM(investment.amount)", "DESC")
    .getRawMany();

  // Step 2: Enrich each investor with user data and campaign list
  const rankedInvestors = await Promise.all(
   
    result
     .filter(row => row.investorId !== userId)
     .map(async (row) => {
      const investor = await investorRepo.findOne({
        where: { investor_id: row.investorId },
        relations: ["user"],
      });

      // Fetch campaigns the investor has invested in
      const campaigns = await investmentRepo
        .createQueryBuilder("investment")
        .leftJoinAndSelect("investment.campaign", "campaign")
        .select(["campaign.campaign_id","campaign.status", "campaign.title", "campaign.description", "investment.amount", "campaign.image"])
        .where("investment.investor_id = :investorId", { investorId: row.investorId })
        .andWhere("campaign.status = :status", { status: "accepted" })
        .groupBy("campaign.campaign_id, investment.amount")
        .getRawMany();

      return {
        investorId: investor?.investor_id,
        name: investor?.user?.name,
        email: investor?.user?.email,
        profilePic: investor?.profile_picture || null,
        totalInvestments: Number(row.totalInvestments),
        uniqueCampaigns: Number(row.uniqueCampaigns),
        totalAmountInvested: Number(row.totalAmountInvested),
        
         user: {
          companyname: investor?.company_name,
          companydescription: investor?.company_description,
          interest : investor?.interest,
          id: investor?.user?.user_id,
          name: investor?.user?.name,
          email: investor?.user?.email,
          profilePic: investor?.profile_picture || null,
          number : investor?.user?.phone_number,
          role: investor?.user?.role,
          campaigns: campaigns.map(c => ({
          campaignId: c.campaign_id,
          status: c.campaign_status,
          title: c.campaign_title,
          image: c.campaign_image,
          description: c.campaign_description,
          investedAmount: Number(c.investment_amount)
        }))
        },
       
      };
    })
  );

  return rankedInvestors;
}




static async getInvestorInterestCampaigns(user_id: number) {
  const investorRepo = AppDataSource.getRepository(Investor);

  // Step 1: Get Investor using user_id and load interest array
  const investor = await investorRepo.findOne({
    where: { user: { user_id } },
    relations: ['user'],
  });

  if (!investor) throw new Error("Investor not found");

  const interests = investor.interest;
  if (!interests || interests.length === 0) return [];

  // Step 2: Fetch campaigns matching investor interests
  const campaignRepo = AppDataSource.getRepository(Campaign);

  const campaigns = await campaignRepo
    .createQueryBuilder("campaign")
    .leftJoinAndSelect("campaign.innovator", "innovator")
    .leftJoinAndSelect("innovator.user", "user")
    .leftJoinAndSelect("innovator.campaigns", "allCampaignsByInnovator")
    .where("campaign.category = ANY(:interests)", { interests },)
    .andWhere("campaign.status = :status", { status: "accepted" })
    .orderBy("campaign.published_date", "DESC")
    .getMany();

  // Step 3: Format the response
  const formatted = campaigns.map((campaign) => {
    const innovator = campaign.innovator;
    const user = innovator.user;
    const allCampaigns = innovator.campaigns.filter(
      (campaign) => campaign.status === "accepted"
    ) || [];

    const allCampaignsByInnovator = allCampaigns.map((c) => ({
      campaign_id: c.campaign_id,
      title: c.title,
      image: c.image,
      description: c.description,
      target_funding_goal: c.target_funding_goal,
      status: c.status,
    }));

    return {
      campaign_id: campaign.campaign_id,
      title: campaign.title,
      description: campaign.description,
      target_funding_goal: campaign.target_funding_goal,
      current_funding_raised: campaign.current_funding_raised,
      published_date: campaign.published_date,
      status: campaign.status,
      funding_type: campaign.funding_type,
      demo_url: campaign.demo_url,
      category: campaign.category,
      video: campaign.video,
      image: campaign.image,
      docs: campaign.docs,
      equity_offered: campaign.equity_offered,
      isclosed: campaign.isClosed,
      closedby: campaign.closedBy,
      innovator: {
        innovator_id: innovator.innovator_id,
        company_name: innovator.company_name,
        company_description: innovator.company_description,
        industry: innovator.industry,
        funds_raised: innovator.funds_raised,
        campaigns_count: allCampaigns.length,
        profile_picture: innovator.profile_picture,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          password: user.password, // Only include if required
          role: user.role,
          phone_number: user.phone_number,
          registration_date: user.registration_date,
          status: user.status,
        },
      },
      innovator_name: user.name || "Unknown",
      company_name: innovator.company_name || "Unknown",
      company_description: innovator.company_description || "No description available",
      campaigns_count: allCampaigns.length,
      number: user.phone_number || "Not available",
      allCampaignsByInnovator,
    };
  });

  return formatted;
}




static async getInvestorStats(userId: number) {
  try {
    const currentYear = new Date().getFullYear();
    const investmentRepo = AppDataSource.getRepository(Investment);

    // Monthly investments grouped by month
    const investments = await investmentRepo
      .createQueryBuilder("investment")
      .select(
        "TO_CHAR(DATE_TRUNC('month', investment.investment_date), 'YYYY-MM')",
        "month"
      )
      .addSelect("SUM(investment.amount)", "total")
      .where("investment.investor_id = :userId", { userId })
      .andWhere("EXTRACT(YEAR FROM investment.investment_date) = :year", {
        year: currentYear,
      })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany();

    const monthlyData: Record<
      | "JAN"
      | "FEB"
      | "MAR"
      | "APR"
      | "MAY"
      | "JUN"
      | "JUL"
      | "AUG"
      | "SEP"
      | "OCT"
      | "NOV"
      | "DEC",
      number
    > = {
      JAN: 0,
      FEB: 0,
      MAR: 0,
      APR: 0,
      MAY: 0,
      JUN: 0,
      JUL: 0,
      AUG: 0,
      SEP: 0,
      OCT: 0,
      NOV: 0,
      DEC: 0,
    };

    investments.forEach(({ month, total }: { month: string; total: string }) => {
      const abbr = moment(month, "YYYY-MM").format("MMM").toUpperCase();
      if (abbr in monthlyData) {
        monthlyData[abbr as keyof typeof monthlyData] = parseFloat(total);
      }
    });

    // Total amount invested
    const totalInvestedResult = await investmentRepo
      .createQueryBuilder("investment")
      .select("SUM(investment.amount)", "totalInvested")
      .where("investment.investor_id = :userId", { userId })
      .getRawOne();

    const totalInvested = parseFloat(totalInvestedResult?.totalInvested ?? 0);

    // Amount invested this month
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const totalThisMonthResult = await investmentRepo
      .createQueryBuilder("investment")
      .select("SUM(investment.amount)", "totalThisMonth")
      .where("investment.investor_id = :userId", { userId })
      .andWhere("investment.investment_date BETWEEN :start AND :end", {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getRawOne();

    const totalThisMonth = parseFloat(
      totalThisMonthResult?.totalThisMonth ?? 0
    );

    // Total distinct campaigns invested in
    const totalCampaignsResult = await investmentRepo
      .createQueryBuilder("investment")
      .select("COUNT(DISTINCT investment.campaign_id)", "totalCampaigns")
      .where("investment.investor_id = :userId", { userId })
      .getRawOne();

    const totalCampaigns = parseInt(totalCampaignsResult?.totalCampaigns ?? 0);

    return {
      success: true,
      monthdata: monthlyData,
      totalInvested,
      totalThisMonth,
      totalCampaigns,
    };
  } catch (error: any) {
    console.error("Error fetching investor data:", error.message || error);
    return {
      success: false,
      message: "Failed to fetch investor data",
      error: error.message || error,
    };
  }
}


static async getInvestorCampaignInvestments(userId: number) {
  const investorRepo = AppDataSource.getRepository(Investor);
  const investmentRepo = AppDataSource.getRepository(Investment);
  const likeRepo = AppDataSource.getRepository(Like);

  const investor = await investorRepo.findOne({
    where: { user: { user_id: userId } },
  });

  if (!investor) {
    throw new Error("Investor not found");
  }

  const investments = await investmentRepo.find({
    where: { investor: { investor_id: investor.investor_id } },
    relations: ["campaign"],
  });

  const campaignMap = new Map<number, { title: string; investment: number; date: Date }>();

  for (const inv of investments) {
    const campaignId = inv.campaign.campaign_id;
    if (campaignMap.has(campaignId)) {
      const existing = campaignMap.get(campaignId)!;
      existing.investment += inv.amount;
    } else {
      campaignMap.set(campaignId, {
        title: inv.campaign.title,
        investment: inv.amount,
        date: inv.campaign.published_date,
      });
    }
  }

  const campaignIds = Array.from(campaignMap.keys());

  const likes = await likeRepo
    .createQueryBuilder("l")
    .select("l.campaignCampaignId", "campaign_id")
    .addSelect("COUNT(*)", "like_count")
    .where("l.campaignCampaignId IN (:...ids)", { ids: campaignIds })
    .groupBy("l.campaignCampaignId")
    .getRawMany();  

  const likeMap = new Map<number, number>();
  likes.forEach((like) => {
    likeMap.set(parseInt(like.campaign_id), parseInt(like.like_count));
  });

  const result = campaignIds.map((id) => {
    const campaign = campaignMap.get(id)!;
    return {
      title: campaign.title,
      investment: campaign.investment,
      date: campaign.date.toISOString().split("T")[0],
      likes: likeMap.get(id) || 0,
    };
  });

  return result;
}



}
