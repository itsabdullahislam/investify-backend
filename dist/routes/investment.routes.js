"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const investment_controller_1 = require("../controllers/investment.controller");
const router = (0, express_1.Router)();
// GET /api/investments/monthly/:userId
router.get("/monthly/:userId", investment_controller_1.InvestmentController.getMonthlyInvestments);
router.get("/:user_id/campaigns", investment_controller_1.InvestmentController.getInvestorCampaigns);
router.post("/invest/:user_id", investment_controller_1.InvestmentController.investInCampaign);
exports.default = router;
