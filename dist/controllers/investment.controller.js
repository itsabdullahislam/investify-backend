"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentController = void 0;
const investment_service_1 = require("../services/investment.service");
class InvestmentController {
    static getMonthlyInvestments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.userId);
                const monthlyData = yield investment_service_1.InvestmentService.getMonthlyInvestmentsByInnovator(userId);
                res.status(200).json({ success: true, Mdata: monthlyData });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Failed to fetch investment data", error });
            }
        });
    }
    static getInvestorCampaigns(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user_id = req.params.user_id;
                if (!user_id) {
                    res.status(400).json({ message: "User ID is required" });
                }
                const campaigns = yield investment_service_1.InvestmentService.getInvestorCampaigns(Number(user_id));
                res.status(200).json(campaigns);
            }
            catch (error) {
                console.error("Error fetching investor campaigns:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static investInCampaign(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.user_id;
                const { campaign_id } = req.body;
                if (!campaign_id) {
                    res.status(400).json({ message: "Campaign ID is required." });
                }
                const result = yield investment_service_1.InvestmentService.investInCampaign(Number(userId), campaign_id);
                res.status(201).json({ message: "Investment successful", investment: result });
            }
            catch (error) {
                console.error("Investment error:", error);
                res.status(500).json({ message: "Internal server error", error });
            }
        });
    }
}
exports.InvestmentController = InvestmentController;
