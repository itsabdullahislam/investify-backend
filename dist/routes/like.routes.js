"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const like_controller_1 = require("../controllers/like.controller");
const router = (0, express_1.Router)();
router.post("/like", like_controller_1.likeCampaignController);
router.post("/unlike", like_controller_1.unlikeCampaignController);
router.get("/likes/:userId", like_controller_1.getUserLikedCampaignsController);
exports.default = router;
