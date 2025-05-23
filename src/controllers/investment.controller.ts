import { Request, Response } from "express";
import { InvestmentService } from "../services/investment.service";

export class InvestmentController {
  static async getMonthlyInvestments(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const monthlyData = await InvestmentService.getMonthlyInvestmentsByInnovator(userId);
      res.status(200).json({ success: true, Mdata: monthlyData });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch investment data", error });
    }
  }


  static async getInvestorCampaigns(req: Request, res: Response) {
  try {
    const user_id = req.params.user_id;

    if (!user_id) {
       res.status(400).json({ message: "User ID is required" });
    }

    const campaigns = await InvestmentService.getInvestorCampaigns(Number(user_id));
     res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching investor campaigns:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  
  }


  static async investInCampaign(req: Request, res: Response) {
    try {
    const userId = req.params.user_id; 
    const { campaignId } = req.body;
    console.log("req.body:", req.body); // 👉 Check what's actually coming in


    console.log("ids", campaignId,userId);

    if (!campaignId) {
       res.status(400).json({ message: "Campaign ID is required." });
       return;
    }

    const result = await InvestmentService.investInCampaign(Number(userId), campaignId);
    res.status(201).json({ message: "Investment successful", investment: result });
  } catch (error) {
    console.error("Investment error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
}
}
