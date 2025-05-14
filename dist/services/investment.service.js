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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentService = void 0;
const data_source_1 = require("../config/data-source");
const innovator_entity_1 = require("../entities/innovator.entity");
const investment_1 = require("../entities/investment");
const moment_1 = __importDefault(require("moment"));
const investor_entity_1 = require("../entities/investor.entity");
const campaign_entity_1 = require("../entities/campaign.entity");
class InvestmentService {
    static getMonthlyInvestmentsByInnovator(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const currentYear = new Date().getFullYear();
                const investments = yield data_source_1.AppDataSource.getRepository(investment_1.Investment)
                    .createQueryBuilder("investment")
                    .leftJoin("investment.campaign", "campaign")
                    .select("TO_CHAR(DATE_TRUNC('month', investment.investment_date), 'YYYY-MM')", "month")
                    .addSelect("SUM(investment.amount)", "total")
                    .where("campaign.innovator_id = :userId", { userId })
                    .andWhere("EXTRACT(YEAR FROM investment.investment_date) = :year", {
                    year: currentYear,
                })
                    .groupBy("month")
                    .orderBy("month", "ASC")
                    .getRawMany();
                // Initialize all months with zero
                const monthlyData = {
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
                investments.forEach(({ month, total }) => {
                    const abbr = (0, moment_1.default)(month, "YYYY-MM").format("MMM").toUpperCase();
                    if (abbr in monthlyData) {
                        monthlyData[abbr] = parseFloat(total);
                    }
                });
                // Total funding raised by the innovator
                const investmentRepo = data_source_1.AppDataSource.getRepository(investment_1.Investment);
                const totalRaisedResult = yield investmentRepo
                    .createQueryBuilder("investment")
                    .leftJoin("investment.campaign", "campaign")
                    .select("SUM(investment.amount)", "totalRaised")
                    .where("campaign.innovator_id = :userId", { userId })
                    .getRawOne();
                const totalRaised = parseFloat((_a = totalRaisedResult === null || totalRaisedResult === void 0 ? void 0 : totalRaisedResult.totalRaised) !== null && _a !== void 0 ? _a : 0);
                const innovator = yield data_source_1.AppDataSource.getRepository(innovator_entity_1.Innovator).findOne({
                    where: { user: { user_id: userId } },
                });
                if (innovator) {
                    innovator.funds_raised = totalRaised;
                    yield data_source_1.AppDataSource.getRepository(innovator_entity_1.Innovator).save(innovator);
                }
                // Total funding in the current month
                const startOfMonth = (0, moment_1.default)().startOf("month").toDate();
                const endOfMonth = (0, moment_1.default)().endOf("month").toDate();
                const totalThisMonthResult = yield investmentRepo
                    .createQueryBuilder("investment")
                    .leftJoin("investment.campaign", "campaign")
                    .select("SUM(investment.amount)", "totalThisMonth")
                    .where("campaign.innovator_id = :userId", { userId })
                    .andWhere("investment.investment_date BETWEEN :start AND :end", {
                    start: startOfMonth,
                    end: endOfMonth,
                })
                    .getRawOne();
                const totalThisMonth = parseFloat((_b = totalThisMonthResult === null || totalThisMonthResult === void 0 ? void 0 : totalThisMonthResult.totalThisMonth) !== null && _b !== void 0 ? _b : 0);
                return {
                    success: true,
                    monthdata: monthlyData,
                    totalRaised,
                    totalThisMonth,
                };
            }
            catch (error) {
                console.error("Error fetching investment data:", error.message || error);
                return {
                    success: false,
                    message: "Failed to fetch investment data",
                    error: error.message || error,
                };
            }
        });
    }
    static getInvestorCampaigns(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const investorRepo = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
            const investmentRepo = data_source_1.AppDataSource.getRepository(investment_1.Investment);
            // Find the investor using the user_id
            const investor = yield investorRepo.findOne({
                where: { user: { user_id: user_id } },
            });
            if (!investor) {
                throw new Error("Investor not found");
            }
            // Fetch all investments made by this investor
            const investments = yield investmentRepo.find({
                where: { investor: { investor_id: investor.investor_id } },
                relations: ["campaign"],
            });
            // Extract the campaigns
            const campaigns = investments.map((inv) => inv.campaign);
            return campaigns;
        });
    }
    static investInCampaign(userId, campaignId) {
        return __awaiter(this, void 0, void 0, function* () {
            const investorRepo = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
            const campaignRepo = data_source_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
            const investmentRepo = data_source_1.AppDataSource.getRepository(investment_1.Investment);
            // Find investor using user ID
            const investor = yield investorRepo.findOne({ where: { user: { user_id: userId } } });
            if (!investor)
                throw new Error("Investor not found.");
            // Find campaign
            const campaign = yield campaignRepo.findOne({ where: { campaign_id: campaignId } });
            if (!campaign)
                throw new Error("Campaign not found.");
            // Only allow investment if campaign is not closed
            if (campaign.isClosed)
                throw new Error("Campaign is already closed.");
            // Create investment
            const newInvestment = investmentRepo.create({
                investor,
                campaign,
                amount: campaign.target_funding_goal
            });
            yield investmentRepo.save(newInvestment);
            // Update campaign to mark as closed
            campaign.isClosed = true;
            campaign.closedBy = investor;
            yield campaignRepo.save(campaign);
            return newInvestment;
        });
    }
}
exports.InvestmentService = InvestmentService;
