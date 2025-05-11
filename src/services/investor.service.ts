import { Investor } from '../entities/investor.entity';
import { Investment } from '../entities/investment';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user';
import { Campaign } from '../entities/campaign.entity';

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
  

static async getRankedInvestors() {
  const investmentRepo = AppDataSource.getRepository(Investment);

 
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

  const investorRepo = AppDataSource.getRepository(Investor);

  const rankedInvestors = await Promise.all(
    result.map(async (row) => {
      const investor = await investorRepo.findOne({
        where: { investor_id: row.investorId },
        relations: ["user"],
      });

      return {
        investorId: investor?.investor_id,
        name: investor?.user?.name,
        email: investor?.user?.email,
        profilePic: investor?.profile_picture || null,
        totalInvestments: Number(row.totalInvestments),
        uniqueCampaigns: Number(row.uniqueCampaigns),
        totalAmountInvested: Number(row.totalAmountInvested),
      };
    })
  );

  return rankedInvestors;

}



static async getInvestorInterestCampaigns(user_id: number) {
  const investorRepo = AppDataSource.getRepository(Investor);

  const investor = await investorRepo.findOne({
    where: { user: { user_id: user_id } },
  });

  if (!investor) {
    throw new Error("Investor not found");
  }

  const interests = investor.interest; // e.g., ['Tech', 'Health', 'Education']

  if (!interests || interests.length === 0) {
    return []; // No interests, return empty feed
  }

  const campaignRepo = AppDataSource.getRepository(Campaign);

  const campaigns = await campaignRepo
  .createQueryBuilder("campaign")
  .where("campaign.category = ANY(:interests::text[])", { interests })
  .orderBy("campaign.published_date", "DESC")
  .getMany();

  return campaigns;


}


}
