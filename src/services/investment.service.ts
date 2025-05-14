import { AppDataSource } from "../config/data-source";
import { Innovator } from "../entities/innovator.entity";
import { Investment } from "../entities/investment";
import moment from "moment";
import { Investor } from "../entities/investor.entity";
import { Campaign } from "../entities/campaign.entity";

export class InvestmentService {
  static async getMonthlyInvestmentsByInnovator(userId: number) {
    try {
      const currentYear = new Date().getFullYear();

      const investments = await AppDataSource.getRepository(Investment)
        .createQueryBuilder("investment")
        .leftJoin("investment.campaign", "campaign")
        .select(
          "TO_CHAR(DATE_TRUNC('month', investment.investment_date), 'YYYY-MM')",
          "month"
        )
        .addSelect("SUM(investment.amount)", "total")
        .where("campaign.innovator_id = :userId", { userId })
        .andWhere("EXTRACT(YEAR FROM investment.investment_date) = :year", {
          year: currentYear,
        })
        .groupBy("month")
        .orderBy("month", "ASC")
        .getRawMany();

      // Initialize all months with zero
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

      investments.forEach(
        ({ month, total }: { month: string; total: string }) => {
          const abbr = moment(month, "YYYY-MM").format("MMM").toUpperCase();
          if (abbr in monthlyData) {
            monthlyData[abbr as keyof typeof monthlyData] = parseFloat(total);
          }
        }
      );

      // Total funding raised by the innovator
      const investmentRepo = AppDataSource.getRepository(Investment);
      const totalRaisedResult = await investmentRepo
        .createQueryBuilder("investment")
        .leftJoin("investment.campaign", "campaign")
        .select("SUM(investment.amount)", "totalRaised")
        .where("campaign.innovator_id = :userId", { userId })
        .getRawOne();

      const totalRaised = parseFloat(totalRaisedResult?.totalRaised ?? 0);

      const innovator = await AppDataSource.getRepository(Innovator).findOne({
        where: { user: { user_id: userId } },
      });

      if (innovator) {
        innovator.funds_raised = totalRaised;
        await AppDataSource.getRepository(Innovator).save(innovator);
      }

      // Total funding in the current month
      const startOfMonth = moment().startOf("month").toDate();
      const endOfMonth = moment().endOf("month").toDate();

      const totalThisMonthResult = await investmentRepo
        .createQueryBuilder("investment")
        .leftJoin("investment.campaign", "campaign")
        .select("SUM(investment.amount)", "totalThisMonth")
        .where("campaign.innovator_id = :userId", { userId })
        .andWhere("investment.investment_date BETWEEN :start AND :end", {
          start: startOfMonth,
          end: endOfMonth,
        })
        .getRawOne();

      const totalThisMonth = parseFloat(
        totalThisMonthResult?.totalThisMonth ?? 0
      );

      return {
        success: true,
        monthdata: monthlyData,
        totalRaised,
        totalThisMonth,
      };
    } catch (error: any) {
      console.error("Error fetching investment data:", error.message || error);
      return {
        success: false,
        message: "Failed to fetch investment data",
        error: error.message || error,
      };
    }
  }




  static async getInvestorCampaigns(user_id: number) {
    const investorRepo = AppDataSource.getRepository(Investor);
  const investmentRepo = AppDataSource.getRepository(Investment);

  // Find the investor using the user_id
  const investor = await investorRepo.findOne({
    where: { user: { user_id: user_id } },
  });

  if (!investor) {
    throw new Error("Investor not found");
  }

  // Fetch all investments made by this investor
  const investments = await investmentRepo.find({
    where: { investor: { investor_id: investor.investor_id } },
    relations: ["campaign"],
  });

  // Extract the campaigns
  const campaigns = investments.map((inv) => inv.campaign);
  

  return campaigns;
  }



  static async investInCampaign(userId: number, campaignId: number){
    const investorRepo = AppDataSource.getRepository(Investor);
    const campaignRepo = AppDataSource.getRepository(Campaign);
    const investmentRepo = AppDataSource.getRepository(Investment);

    // Find investor using user ID
    const investor = await investorRepo.findOne({ where: { user: { user_id: userId } } });
    if (!investor) throw new Error("Investor not found.");

    // Find campaign
    const campaign = await campaignRepo.findOne({ where: { campaign_id: campaignId } });
    if (!campaign) throw new Error("Campaign not found.");

   // Only allow investment if campaign is not closed
if (campaign.isClosed) throw new Error("Campaign is already closed.");

// Create investment
const newInvestment = investmentRepo.create({
  investor,
  campaign,
  amount: campaign.target_funding_goal
});

await investmentRepo.save(newInvestment);

// Update campaign to mark as closed
campaign.isClosed = true;
campaign.closedBy = investor;
await campaignRepo.save(campaign);

return newInvestment;

  }
}
