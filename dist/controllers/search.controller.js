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
exports.search = void 0;
const data_source_1 = require("../config/data-source");
const user_1 = require("../entities/user");
const campaign_entity_1 = require("../entities/campaign.entity");
const innovator_entity_1 = require("../entities/innovator.entity");
const investor_entity_1 = require("../entities/investor.entity");
const campaignRepository = data_source_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
const userRepository = data_source_1.AppDataSource.getRepository(user_1.User);
const innovatorRepository = data_source_1.AppDataSource.getRepository(innovator_entity_1.Innovator);
const investorRepository = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
exports.search = {
    userSearch: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const query = (_a = req.query.query) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (!query) {
            res.status(400).json({ error: "Query is required" });
            return;
        }
        try {
            const results = {};
            {
                const campaignsQueryBuilder = campaignRepository
                    .createQueryBuilder("campaign")
                    .leftJoinAndSelect("campaign.innovator", "innovator")
                    .leftJoinAndSelect("innovator.user", "user")
                    .where("campaign.status = :status", { status: "accepted" })
                    .andWhere("(LOWER(campaign.title) LIKE :query OR LOWER(campaign.description) LIKE :query)", { query: `%${query.toLowerCase()}%` });
                const campaigns = yield campaignsQueryBuilder.getMany();
                results.campaigns = campaigns;
            }
            // ---------- INVESTORS ----------
            {
                const investors = yield investorRepository
                    .createQueryBuilder("investor")
                    .leftJoinAndSelect("investor.user", "user") // JOIN USER
                    .leftJoinAndSelect("investor.investments", "investment")
                    .leftJoinAndSelect("investment.campaign", "campaigns")
                    .where("user.role = :role", { role: "investor" })
                    //.andWhere("campaigns.status = :status", { status : "accepted"})
                    .andWhere("LOWER(user.name) LIKE :query", { query: `%${query.toLowerCase()}%` })
                    .getMany();
                results.investors = investors.map((inv) => {
                    var _a;
                    return ({
                        user_id: inv.user.user_id,
                        name: inv.user.name,
                        image: inv.profile_picture,
                        phoneNumber: inv.user.phone_number,
                        companyName: inv.company_name,
                        companyDescription: inv.company_description,
                        interest: inv.interest,
                        campaigns: ((_a = inv.investments) === null || _a === void 0 ? void 0 : _a.map((i) => i.campaign).filter((c) => (c === null || c === void 0 ? void 0 : c.status) === "accepted")) || [],
                        flag: 0,
                    });
                });
            }
            // ---------- INNOVATORS ----------
            {
                const innovators = yield innovatorRepository
                    .createQueryBuilder("innovator")
                    .leftJoinAndSelect("innovator.user", "user") // JOIN USER
                    .leftJoinAndSelect("innovator.campaigns", "campaigns")
                    .where("user.role = :role", { role: "innovator" })
                    //.andWhere("campaigns.status = :status", { status : "accepted"})
                    .andWhere("LOWER(user.name) LIKE :query", { query: `${query}%` })
                    .getMany();
                results.innovators = innovators.map((ino) => {
                    var _a, _b;
                    return ({
                        user_id: ino.user.user_id,
                        name: ino.user.name,
                        image: ino.profile_picture,
                        phoneNumber: ino.user.phone_number,
                        companyName: ino.company_name,
                        companyDescription: ino.company_description,
                        campaigns: ((_a = ino.campaigns) === null || _a === void 0 ? void 0 : _a.filter((c) => (c === null || c === void 0 ? void 0 : c.status) === "accepted")) || [],
                        Likes: ((_b = ino.campaigns) === null || _b === void 0 ? void 0 : _b.length) || 0,
                        flag: 1,
                    });
                });
            }
            res.json(results);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }),
};
