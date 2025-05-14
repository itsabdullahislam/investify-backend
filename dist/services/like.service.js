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
exports.getUserLikedCampaigns = exports.unlikeCampaign = exports.likeCampaign = void 0;
const data_source_1 = require("../config/data-source");
const like_entity_1 = require("../entities/like.entity");
const user_1 = require("../entities/user");
const campaign_entity_1 = require("../entities/campaign.entity");
const likeCampaign = (userId, campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    const likeRepo = data_source_1.AppDataSource.getRepository(like_entity_1.Like);
    const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
    const campaignRepo = data_source_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
    const existing = yield likeRepo.findOne({
        where: {
            user: { user_id: userId },
            campaign: { campaign_id: campaignId }
        }
    });
    if (existing) {
        throw new Error("Campaign already liked");
    }
    const user = yield userRepo.findOne({ where: { user_id: userId } });
    if (!user)
        throw new Error("User not found");
    const campaign = yield campaignRepo.findOne({ where: { campaign_id: campaignId } });
    if (!campaign)
        throw new Error("Campaign not found");
    const newLike = likeRepo.create({ user, campaign });
    return yield likeRepo.save(newLike);
});
exports.likeCampaign = likeCampaign;
const unlikeCampaign = (userId, campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    const likeRepo = data_source_1.AppDataSource.getRepository(like_entity_1.Like);
    const like = yield likeRepo.findOne({
        where: {
            user: { user_id: userId },
            campaign: { campaign_id: campaignId }
        }
    });
    if (!like) {
        throw new Error("Like not found");
    }
    yield likeRepo.remove(like);
});
exports.unlikeCampaign = unlikeCampaign;
const getUserLikedCampaigns = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const likeRepo = data_source_1.AppDataSource.getRepository(like_entity_1.Like);
    return yield likeRepo.find({
        where: {
            user: { user_id: userId },
        },
        relations: ["campaign", "user"], // <-- this is important
    });
});
exports.getUserLikedCampaigns = getUserLikedCampaigns;
