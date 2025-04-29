import { Request, Response } from 'express';
import { InvestorService } from '../services/investor.service';

export class InvestorController {
  static async getInvestorStats(req: Request, res: Response) {
    try {
      const investorId = req.params.id;
      
      const stats = await InvestorService.getInvestorStats(parseInt(investorId));

      return res.json({
        totalInvestment: stats.totalInvestment,
        totalIdeas: stats.totalIdeas,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while fetching stats' });
    }
  }
}
