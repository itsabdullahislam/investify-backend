"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_controller_1 = require("../controllers/campaign.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const campaign_controller_2 = require("../controllers/campaign.controller");
const router = (0, express_1.Router)();
router.post('/create', upload_middleware_1.upload.fields([
    { name: 'image', maxCount: 5 },
    { name: 'video', maxCount: 5 },
    { name: 'docs', maxCount: 10 },
]), campaign_controller_1.createCampaignController);
router.get('/all', campaign_controller_2.getAllCampaignsController);
router.get("/innovator/:userId", campaign_controller_1.getInnovatorCampaigns);
router.get("/trending", campaign_controller_1.getTrendingCampaignsController);
exports.default = router;
