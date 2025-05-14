import { Router } from 'express';
import { InvestorController } from '../controllers/investor.controller';
import { upload } from '../middleware/upload.middleware';
import { In } from 'typeorm';
import { authenticateUser } from '../middleware/auth';

const router = Router();


router.post("/investor/interests",  InvestorController.setInterest);
router.get("/investor/:user_id/profile", InvestorController.getInvestorProfile);
router.put("/investor/:id/profile-picture", upload.single("profile_picture"), InvestorController.updateProfilePicture);
router.put('/investor/:user_id/profile/update', InvestorController.updateInvestorProfileInfo);
router.get("/investor/ranked", authenticateUser,InvestorController.getRankedInvestors);
router.get("/investor/:user_id/feed",  InvestorController.getInvestorInterestCampaigns);
router.get("/investor/:userId/monthly", InvestorController.getMonthlyInvestments);
router.get("/campaign-investments/:userId", InvestorController.getInvestorCampaignInvestments);

export default router;
