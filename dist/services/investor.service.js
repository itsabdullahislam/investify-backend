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
exports.InvestorService = void 0;
const investor_entity_1 = require("../entities/investor.entity");
const investment_1 = require("../entities/investment");
const data_source_1 = require("../config/data-source");
const user_1 = require("../entities/user");
const campaign_entity_1 = require("../entities/campaign.entity");
const moment_1 = __importDefault(require("moment"));
const like_entity_1 = require("../entities/like.entity");
class InvestorService {
    static setInterest(userId, interests) {
        return __awaiter(this, void 0, void 0, function* () {
            const investorRepo = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
            const investor = yield investorRepo.findOne({
                where: { investor_id: userId },
            });
            if (!investor) {
                throw new Error("Investor not found");
            }
            investor.interest = interests;
            yield investorRepo.save(investor);
            return investor;
        });
    }
    static getInvestorProfile(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
            const investmentRepo = data_source_1.AppDataSource.getRepository(investment_1.Investment);
            const user = yield userRepo
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.investor', 'investor')
                .where('user.user_id = :user_id', { user_id })
                .getOne();
            if (!user || !user.investor) {
                {
                    throw new Error('Investor profile not found');
                }
            }
            const investmentStats = yield investmentRepo
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
        });
    }
    static updateInvestorProfile(userId, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const investorRepo = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
            const investor = yield investorRepo.findOne({
                where: { user: { user_id: userId } },
                relations: ["user"],
            });
            if (!investor) {
                throw new Error("Investor not found");
            }
            investor.profile_picture = filePath;
            yield investorRepo.save(investor);
        });
    }
    ;
    static updateInvestorProfileInfo(user_id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
            const innovatorRepo = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
            const user = yield userRepo.findOne({
                where: { user_id },
                relations: ['investor'],
            });
            if (!user || user.role !== 'investor') {
                throw new Error('User not found or is not an investor.');
            }
            // Update user table fields
            if (updates.name)
                user.name = updates.name;
            if (updates.phone_number)
                user.phone_number = updates.phone_number;
            yield userRepo.save(user);
            const investor = user.investor;
            if (investor) {
                if (updates.company_name)
                    investor.company_name = updates.company_name;
                if (updates.company_description)
                    investor.company_description = updates.company_description;
                yield innovatorRepo.save(investor);
            }
            return { user };
        });
    }
    ;
    static getRankedInvestors(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const investmentRepo = data_source_1.AppDataSource.getRepository(investment_1.Investment);
            const investorRepo = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
            const campaignRepo = data_source_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
            // Step 1: Aggregate investment stats by investor
            const result = yield investmentRepo
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
            const rankedInvestors = yield Promise.all(result
                .filter(row => row.investorId !== userId)
                .map((row) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                const investor = yield investorRepo.findOne({
                    where: { investor_id: row.investorId },
                    relations: ["user"],
                });
                // Fetch campaigns the investor has invested in
                const campaigns = yield investmentRepo
                    .createQueryBuilder("investment")
                    .leftJoinAndSelect("investment.campaign", "campaign")
                    .select(["campaign.campaign_id", "campaign.status", "campaign.title", "campaign.description", "investment.amount", "campaign.image"])
                    .where("investment.investor_id = :investorId", { investorId: row.investorId })
                    .andWhere("campaign.status = :status", { status: "accepted" })
                    .groupBy("campaign.campaign_id, investment.amount")
                    .getRawMany();
                return {
                    investorId: investor === null || investor === void 0 ? void 0 : investor.investor_id,
                    name: (_a = investor === null || investor === void 0 ? void 0 : investor.user) === null || _a === void 0 ? void 0 : _a.name,
                    email: (_b = investor === null || investor === void 0 ? void 0 : investor.user) === null || _b === void 0 ? void 0 : _b.email,
                    profilePic: (investor === null || investor === void 0 ? void 0 : investor.profile_picture) || null,
                    totalInvestments: Number(row.totalInvestments),
                    uniqueCampaigns: Number(row.uniqueCampaigns),
                    totalAmountInvested: Number(row.totalAmountInvested),
                    user: {
                        companyname: investor === null || investor === void 0 ? void 0 : investor.company_name,
                        companydescription: investor === null || investor === void 0 ? void 0 : investor.company_description,
                        interest: investor === null || investor === void 0 ? void 0 : investor.interest,
                        id: (_c = investor === null || investor === void 0 ? void 0 : investor.user) === null || _c === void 0 ? void 0 : _c.user_id,
                        name: (_d = investor === null || investor === void 0 ? void 0 : investor.user) === null || _d === void 0 ? void 0 : _d.name,
                        email: (_e = investor === null || investor === void 0 ? void 0 : investor.user) === null || _e === void 0 ? void 0 : _e.email,
                        profilePic: (investor === null || investor === void 0 ? void 0 : investor.profile_picture) || null,
                        number: (_f = investor === null || investor === void 0 ? void 0 : investor.user) === null || _f === void 0 ? void 0 : _f.phone_number,
                        role: (_g = investor === null || investor === void 0 ? void 0 : investor.user) === null || _g === void 0 ? void 0 : _g.role,
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
            })));
            return rankedInvestors;
        });
    }
    static getInvestorInterestCampaigns(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const investorRepo = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
            // Step 1: Get Investor using user_id and load interest array
            const investor = yield investorRepo.findOne({
                where: { user: { user_id } },
                relations: ['user'],
            });
            if (!investor)
                throw new Error("Investor not found");
            const interests = investor.interest;
            if (!interests || interests.length === 0)
                return [];
            // Step 2: Fetch campaigns matching investor interests
            const campaignRepo = data_source_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
            const campaigns = yield campaignRepo
                .createQueryBuilder("campaign")
                .leftJoinAndSelect("campaign.innovator", "innovator")
                .leftJoinAndSelect("innovator.user", "user")
                .leftJoinAndSelect("innovator.campaigns", "allCampaignsByInnovator")
                .where("campaign.category = ANY(:interests)", { interests })
                .andWhere("campaign.status = :status", { status: "accepted" })
                .orderBy("campaign.published_date", "DESC")
                .getMany();
            // Step 3: Format the response
            const formatted = campaigns.map((campaign) => {
                const innovator = campaign.innovator;
                const user = innovator.user;
                const allCampaigns = innovator.campaigns.filter((campaign) => campaign.status === "accepted") || [];
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
        });
    }
    static getInvestorStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const currentYear = new Date().getFullYear();
                const investmentRepo = data_source_1.AppDataSource.getRepository(investment_1.Investment);
                // Monthly investments grouped by month
                const investments = yield investmentRepo
                    .createQueryBuilder("investment")
                    .select("TO_CHAR(DATE_TRUNC('month', investment.investment_date), 'YYYY-MM')", "month")
                    .addSelect("SUM(investment.amount)", "total")
                    .where("investment.investor_id = :userId", { userId })
                    .andWhere("EXTRACT(YEAR FROM investment.investment_date) = :year", {
                    year: currentYear,
                })
                    .groupBy("month")
                    .orderBy("month", "ASC")
                    .getRawMany();
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
                // Total amount invested
                const totalInvestedResult = yield investmentRepo
                    .createQueryBuilder("investment")
                    .select("SUM(investment.amount)", "totalInvested")
                    .where("investment.investor_id = :userId", { userId })
                    .getRawOne();
                const totalInvested = parseFloat((_a = totalInvestedResult === null || totalInvestedResult === void 0 ? void 0 : totalInvestedResult.totalInvested) !== null && _a !== void 0 ? _a : 0);
                // Amount invested this month
                const startOfMonth = (0, moment_1.default)().startOf("month").toDate();
                const endOfMonth = (0, moment_1.default)().endOf("month").toDate();
                const totalThisMonthResult = yield investmentRepo
                    .createQueryBuilder("investment")
                    .select("SUM(investment.amount)", "totalThisMonth")
                    .where("investment.investor_id = :userId", { userId })
                    .andWhere("investment.investment_date BETWEEN :start AND :end", {
                    start: startOfMonth,
                    end: endOfMonth,
                })
                    .getRawOne();
                const totalThisMonth = parseFloat((_b = totalThisMonthResult === null || totalThisMonthResult === void 0 ? void 0 : totalThisMonthResult.totalThisMonth) !== null && _b !== void 0 ? _b : 0);
                // Total distinct campaigns invested in
                const totalCampaignsResult = yield investmentRepo
                    .createQueryBuilder("investment")
                    .select("COUNT(DISTINCT investment.campaign_id)", "totalCampaigns")
                    .where("investment.investor_id = :userId", { userId })
                    .getRawOne();
                const totalCampaigns = parseInt((_c = totalCampaignsResult === null || totalCampaignsResult === void 0 ? void 0 : totalCampaignsResult.totalCampaigns) !== null && _c !== void 0 ? _c : 0);
                return {
                    success: true,
                    monthdata: monthlyData,
                    totalInvested,
                    totalThisMonth,
                    totalCampaigns,
                };
            }
            catch (error) {
                console.error("Error fetching investor data:", error.message || error);
                return {
                    success: false,
                    message: "Failed to fetch investor data",
                    error: error.message || error,
                };
            }
        });
    }
    static getInvestorCampaignInvestments(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const investorRepo = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
            const investmentRepo = data_source_1.AppDataSource.getRepository(investment_1.Investment);
            const likeRepo = data_source_1.AppDataSource.getRepository(like_entity_1.Like);
            const investor = yield investorRepo.findOne({
                where: { user: { user_id: userId } },
            });
            if (!investor) {
                throw new Error("Investor not found");
            }
            const investments = yield investmentRepo.find({
                where: { investor: { investor_id: investor.investor_id } },
                relations: ["campaign"],
            });
            const campaignMap = new Map();
            for (const inv of investments) {
                const campaignId = inv.campaign.campaign_id;
                if (campaignMap.has(campaignId)) {
                    const existing = campaignMap.get(campaignId);
                    existing.investment += inv.amount;
                }
                else {
                    campaignMap.set(campaignId, {
                        title: inv.campaign.title,
                        investment: inv.amount,
                        date: inv.campaign.published_date,
                    });
                }
            }
            const campaignIds = Array.from(campaignMap.keys());
            const likes = yield likeRepo
                .createQueryBuilder("l")
                .select("l.campaignCampaignId", "campaign_id")
                .addSelect("COUNT(*)", "like_count")
                .where("l.campaignCampaignId IN (:...ids)", { ids: campaignIds })
                .groupBy("l.campaignCampaignId")
                .getRawMany();
            const likeMap = new Map();
            likes.forEach((like) => {
                likeMap.set(parseInt(like.campaign_id), parseInt(like.like_count));
            });
            const result = campaignIds.map((id) => {
                const campaign = campaignMap.get(id);
                return {
                    title: campaign.title,
                    investment: campaign.investment,
                    date: campaign.date.toISOString().split("T")[0],
                    likes: likeMap.get(id) || 0,
                };
            });
            return result;
        });
    }
}
exports.InvestorService = InvestorService;
