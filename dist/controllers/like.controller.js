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
exports.getUserLikedCampaignsController = exports.unlikeCampaignController = exports.likeCampaignController = void 0;
const like_service_1 = require("../services/like.service");
const likeCampaignController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.body.userId);
    const campaignId = Number(req.body.campaignId);
    try {
        const like = yield (0, like_service_1.likeCampaign)(userId, campaignId);
        res.status(200).json(like);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.likeCampaignController = likeCampaignController;
const unlikeCampaignController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.body.userId, 10);
    const campaignId = Number(req.body.campaignId);
    try {
        const result = yield (0, like_service_1.unlikeCampaign)(userId, campaignId);
        res.status(200).json({ message: "Unliked successfully" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.unlikeCampaignController = unlikeCampaignController;
const getUserLikedCampaignsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.userId);
    try {
        const likedCampaignIds = yield (0, like_service_1.getUserLikedCampaigns)(userId);
        res.status(200).json(likedCampaignIds);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getUserLikedCampaignsController = getUserLikedCampaignsController;
