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
exports.InvestorController = void 0;
const investor_service_1 = require("../services/investor.service");
class InvestorController {
    static setInterest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.body.user_id;
                if (!userId) {
                    res.status(400).json({ message: "User ID is required." });
                }
                const { interests } = req.body;
                if (!Array.isArray(interests)) {
                    res.status(400).json({ message: "Interests must be an array." });
                }
                const updatedInvestor = yield investor_service_1.InvestorService.setInterest(userId, interests);
                res.status(200).json({
                    message: "Interests updated successfully",
                    interests: updatedInvestor.interest,
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
    }
    static getInvestorProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user_id = parseInt(req.params.user_id);
                const investorProfile = yield investor_service_1.InvestorService.getInvestorProfile(user_id);
                res.status(200).json(investorProfile);
            }
            catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({ message: 'An error occurred while fetching investor profile', error: errorMessage });
            }
        });
    }
    static updateProfilePicture(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = parseInt(req.params.id);
                const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
                if (!filePath) {
                    res.status(400).json({ message: "No file uploaded" });
                }
                if (!filePath) {
                    res.status(400).json({ message: "No file uploaded" });
                    return;
                }
                const updatedInvestor = yield investor_service_1.InvestorService.updateInvestorProfile(userId, filePath);
                res.status(200).json({ message: "Profile picture updated", investor: updatedInvestor });
            }
            catch (err) {
                console.error("Error updating investor profile picture:", err);
                res.status(500).json({ message: "Server error" });
            }
        });
    }
    ;
    static updateInvestorProfileInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_id = parseInt(req.params.user_id);
            const { name, phone_number, company_name, company_description } = req.body;
            try {
                const updatedProfile = yield investor_service_1.InvestorService.updateInvestorProfileInfo(user_id, {
                    name,
                    phone_number,
                    company_name,
                    company_description,
                });
                res.status(200).json({
                    message: 'Profile updated successfully',
                    profile: updatedProfile,
                });
            }
            catch (error) {
                console.error('Error updating investor profile:', error);
                res.status(500).json({
                    message: 'Failed to update profile',
                    error: error.message,
                });
            }
        });
    }
    ;
    static getRankedInvestors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            try {
                const rankedInvestors = yield investor_service_1.InvestorService.getRankedInvestors(Number(userId));
                res.status(200).json(rankedInvestors);
            }
            catch (error) {
                console.error("Error fetching ranked investors:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static getInvestorInterestCampaigns(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user_id = parseInt(req.params.user_id);
                const campaigns = yield investor_service_1.InvestorService.getInvestorInterestCampaigns(user_id);
                res.status(200).json(campaigns);
            }
            catch (error) {
                console.error("Error fetching interest-based campaigns:", error);
                res.status(500).json({ message: "Failed to load investor feed" });
            }
        });
    }
    static getMonthlyInvestments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.userId);
                const monthlyData = yield investor_service_1.InvestorService.getInvestorStats(userId);
                res.status(200).json({ success: true, Mdata: monthlyData });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Failed to fetch investment data", error });
            }
        });
    }
    static getInvestorCampaignInvestments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                res.status(400).json({ message: "Invalid user ID" });
            }
            try {
                const data = yield investor_service_1.InvestorService.getInvestorCampaignInvestments(userId);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                console.error("Error in getInvestorCampaignInvestments:", error.message || error);
                res.status(500).json({ success: false, message: "Internal server error", error: error.message || error });
            }
        });
    }
}
exports.InvestorController = InvestorController;
