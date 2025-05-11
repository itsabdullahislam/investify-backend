import { Router } from 'express';
import { InvestorController } from '../controllers/investor.controller';
import { upload } from '../middleware/upload.middleware';
import { In } from 'typeorm';

const router = Router();


router.post("/investor/interests",  InvestorController.setInterest);
router.get("/investor/:user_id/profile", InvestorController.getInvestorProfile);
router.put("/investor/:id/profile-picture", upload.single("profile_picture"), InvestorController.updateProfilePicture);
router.put('/investor/:user_id/profile/update', InvestorController.updateInvestorProfileInfo);
router.get("/investor/ranked", InvestorController.getRankedInvestors);
router.get("/investor/:user_id/feed",  InvestorController.getInvestorInterestCampaigns);

export default router;
