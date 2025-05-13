import { Router } from "express";
import { InvestmentController } from "../controllers/investment.controller";

const router = Router();

// GET /api/investments/monthly/:userId
router.get("/monthly/:userId", InvestmentController.getMonthlyInvestments);
router.get("/:user_id/campaigns", InvestmentController.getInvestorCampaigns);
router.post("/invest/:user_id", InvestmentController.investInCampaign);

export default router;
