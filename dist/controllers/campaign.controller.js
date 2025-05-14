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
exports.getTrendingCampaignsController = exports.getInnovatorCampaigns = exports.getAllCampaignsController = exports.createCampaignController = void 0;
const campaign_service_1 = require("../services/campaign.service");
const upload_middleware_1 = require("../middleware/upload.middleware");
const campaign_service_2 = require("../services/campaign.service");
upload_middleware_1.upload.fields([{ name: 'image' }, { name: 'video' }]);
const createCampaignController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { user_id, title, description, target_funding_goal, published_date, funding_type, demo_url, equity_offered, category, } = req.body;
        const files = req.files;
        const image = ((_b = (_a = files === null || files === void 0 ? void 0 : files['image']) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path) || null;
        const video = ((_d = (_c = files === null || files === void 0 ? void 0 : files['video']) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.path) || null;
        // Handle docs (can be multiple)
        const docs = ((_e = files === null || files === void 0 ? void 0 : files['docs']) === null || _e === void 0 ? void 0 : _e.map(file => file.path)) || [];
        const campaign = yield (0, campaign_service_1.createCampaignService)(Number(user_id), title, description, Number(target_funding_goal), new Date(published_date), funding_type, demo_url, video, image, equity_offered ? Number(equity_offered) : null, category, docs // Pass to service
        );
        res.status(201).json({
            message: 'Campaign created successfully, awaiting approval.',
            campaign,
        });
    }
    catch (error) {
        const err = error;
        res.status(500).json({
            message: err.message || 'Controller Error creating campaign.',
        });
    }
});
exports.createCampaignController = createCampaignController;
const campaign_service_3 = require("../services/campaign.service");
const getAllCampaignsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaigns = yield (0, campaign_service_3.getAllCampaignsService)();
        res.status(200).json(campaigns);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch campaigns', error: error.message });
    }
});
exports.getAllCampaignsController = getAllCampaignsController;
const getInnovatorCampaigns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
        }
        const campaigns = yield (0, campaign_service_2.getCampaignsByInnovatorId)(userId);
        res.status(200).json(campaigns);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getInnovatorCampaigns = getInnovatorCampaigns;
const getTrendingCampaignsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaigns = yield (0, campaign_service_1.getTrendingCampaigns)();
        res.status(200).json(campaigns);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch trending campaigns", error: err });
    }
});
exports.getTrendingCampaignsController = getTrendingCampaignsController;
