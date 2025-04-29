import { getRepository } from 'typeorm';
import { Investor } from '../entities/investor.entity';
import { Investment } from '../entities/investment';

export class InvestorService {
  // Function to get total investment and the number of unique ideas
  static async getInvestorStats(investorId: number) {
    const investmentRepo = getRepository(Investment);
    
    // Query to calculate total investments and count of unique ideas
    const result = await investmentRepo
      .createQueryBuilder('investment')
      .select('SUM(investment.amount)', 'totalInvestment')
      .addSelect('COUNT(DISTINCT investment.campaign_id)', 'totalIdeas')
      .where('investment.investor_id = :investorId', { investorId })
      .getRawOne();

    return {
      totalInvestment: result.totalInvestment || 0,
      totalIdeas: result.totalIdeas || 0,
    };
  }
}
