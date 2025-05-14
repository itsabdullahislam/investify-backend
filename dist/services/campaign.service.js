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
exports.getTrendingCampaigns = exports.getCampaignsByInnovatorId = exports.getAllCampaignsService = exports.createCampaignService = void 0;
const data_source_1 = require("../config/data-source");
const campaign_entity_1 = require("../entities/campaign.entity");
const user_1 = require("../entities/user");
const axios_1 = __importDefault(require("axios"));
const innovator_entity_1 = require("../entities/innovator.entity");
const createCampaignService = (user_id, title, description, target_funding_goal, published_date, funding_type, demo_url, video, image, equity_offered, category, docs // Added docs parameter
) => __awaiter(void 0, void 0, void 0, function* () {
    const campaignRepo = data_source_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
    const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
    try {
        // 1. Find user
        const user = yield userRepo.findOne({
            where: { user_id },
        });
        if (!user || user.role !== "innovator") {
            throw new Error("Only innovators can create campaigns.");
        }
        // 2. Create campaign
        const campaign = new campaign_entity_1.Campaign();
        const innovatorRepo = data_source_1.AppDataSource.getRepository(innovator_entity_1.Innovator);
        const innovator = yield innovatorRepo.findOne({
            where: { user: { user_id } },
            relations: ["user"],
        });
        if (!innovator) {
            throw new Error("Innovator profile not found.");
        }
        campaign.innovator = innovator;
        campaign.title = title;
        campaign.description = description;
        campaign.target_funding_goal = target_funding_goal;
        campaign.current_funding_raised = 0;
        campaign.published_date = published_date;
        campaign.status = "pending"; // Initially pending
        campaign.funding_type = funding_type || "equity";
        campaign.demo_url = demo_url || null;
        campaign.video = video || null;
        campaign.image = image || null;
        campaign.equity_offered = equity_offered || null;
        campaign.category = category || null;
        campaign.likes = [];
        campaign.docs = docs || [];
        // 3. Save campaign initially
        const savedCampaign = yield campaignRepo.save(campaign);
        // Increment campaign count for the innovator
        if (innovator) {
            innovator.campaigns_count = (innovator.campaigns_count || 0) + 1;
            yield innovatorRepo.save(innovator);
        }
        // 4. Call novelty API
        try {
            const noveltyResponse = yield axios_1.default.post("http://localhost:8000/check-novelty", {
                title: savedCampaign.title,
                description: savedCampaign.description,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log("Novelty API Response:", noveltyResponse.data);
            if (!noveltyResponse.data.is_novel) {
                savedCampaign.status = "accepted";
            }
            else {
                savedCampaign.status = "rejected";
            }
            // 5. Save updated campaign status
            yield campaignRepo.save(savedCampaign);
        }
        catch (noveltyError) {
            console.error("Error calling novelty AI model:", noveltyError);
            // Optionally leave status as 'pending'
        }
        // 6. Return saved campaign (with final status)
        return { savedCampaign, count: innovator ? innovator.campaigns_count : 0 };
    }
    catch (error) {
        console.error("Service Error creating campaign:", error.message);
        throw error; // throw original error, not custom string
    }
});
exports.createCampaignService = createCampaignService;
const getAllCampaignsService = () => __awaiter(void 0, void 0, void 0, function* () {
    const campaignRepo = data_source_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
    try {
        const campaigns = yield campaignRepo.find({
            where: { status: 'accepted' },
            relations: ['innovator', 'innovator.user'],
            order: { published_date: 'DESC' },
        });
        const formattedCampaigns = yield Promise.all(campaigns.map((campaign) => __awaiter(void 0, void 0, void 0, function* () {
            const innovator = campaign.innovator;
            const user = innovator === null || innovator === void 0 ? void 0 : innovator.user;
            // Get all campaigns for this innovator
            const allCampaignsByInnovator = yield campaignRepo.find({
                where: {
                    innovator: { innovator_id: innovator === null || innovator === void 0 ? void 0 : innovator.innovator_id },
                    status: 'accepted',
                },
                relations: ['innovator'],
            });
            return Object.assign(Object.assign({}, campaign), { innovator_name: (user === null || user === void 0 ? void 0 : user.name) || 'Unknown', company_name: (innovator === null || innovator === void 0 ? void 0 : innovator.company_name) || 'Unknown', company_description: (innovator === null || innovator === void 0 ? void 0 : innovator.company_description) || 'No description available', campaigns_count: (innovator === null || innovator === void 0 ? void 0 : innovator.campaigns_count) || 0, number: (user === null || user === void 0 ? void 0 : user.phone_number) || 'Not available', allCampaignsByInnovator: allCampaignsByInnovator.map(campaign => ({
                    campaign_id: campaign.campaign_id,
                    title: campaign.title,
                    image: campaign.image,
                    description: campaign.description,
                    target_funding_goal: campaign.target_funding_goal,
                    status: campaign.status,
                })) });
        })));
        return formattedCampaigns;
    }
    catch (error) {
        console.error("Error fetching campaigns:", error.message);
        throw error;
    }
});
exports.getAllCampaignsService = getAllCampaignsService;
const getCampaignsByInnovatorId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const innovatorRepository = data_source_1.AppDataSource.getRepository(innovator_entity_1.Innovator);
    const campaignRepository = data_source_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
    const innovator = yield innovatorRepository.findOne({
        where: { user: { user_id: Number(userId) } },
        relations: ["user"],
    });
    if (!innovator) {
        throw new Error("Innovator not found");
    }
    const campaigns = yield campaignRepository
        .createQueryBuilder("campaign")
        .leftJoin("campaign.innovator", "innovator")
        .where("innovator.innovator_id = :id", { id: innovator.innovator_id })
        .loadRelationCountAndMap("campaign.totalLikes", "campaign.likes")
        .getMany();
    return campaigns;
});
exports.getCampaignsByInnovatorId = getCampaignsByInnovatorId;
const getTrendingCampaigns = () => __awaiter(void 0, void 0, void 0, function* () {
    const campaignRepo = data_source_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
    const user = data_source_1.AppDataSource.getRepository(user_1.User);
    const result = yield data_source_1.AppDataSource.query(`
    SELECT 
      c.*,
      i."company_name" AS "company_name",
      i."campaigns_count" AS "campaigns_count",
      i."company_description" AS "company_description",
      u."user_id",
      u."name" AS "innovator_name",
      u."phone_number" AS "number",
      (
        SELECT COUNT(*) 
        FROM "like" l 
        WHERE l."campaignCampaignId" = c."campaign_id"
      ) AS "likesCount",
      (
        SELECT json_agg(all_camps)
        FROM (
          SELECT 
            c2."campaign_id", 
            c2."title", 
            c2."description",
            c2."target_funding_goal",
            c2."image",
            c2."status"
          FROM "campaigns" c2
          WHERE c2."innovator_id" = c."innovator_id"
        ) all_camps
      ) AS "allCampaignsByInnovator"
    FROM "campaigns" c
    LEFT JOIN "innovator" i ON i."innovator_id" = c."innovator_id"
    LEFT JOIN "users" u ON u."innovator_id" = i."innovator_id"
    ORDER BY 
      (
        SELECT COUNT(*) 
        FROM "like" l 
        WHERE l."campaignCampaignId" = c."campaign_id"
      ) DESC, 
      c."target_funding_goal" DESC
    LIMIT 3;
  `);
    return result;
});
exports.getTrendingCampaigns = getTrendingCampaigns;
