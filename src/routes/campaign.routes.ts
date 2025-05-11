import { Router } from 'express';
import { Request, Response } from 'express';
import { createCampaignController, getInnovatorCampaigns, getTrendingCampaignsController } from '../controllers/campaign.controller';
import { upload } from '../middleware/upload.middleware';
import { getAllCampaignsController } from '../controllers/campaign.controller';

const router = Router();
router.post(
    '/create',
    upload.fields([
      { name: 'image', maxCount: 5 },
      { name: 'video', maxCount: 5 },
      { name: 'docs', maxCount: 10 },
    ]),
    createCampaignController
  );

router.get('/all', getAllCampaignsController);
router.get("/innovator/:userId", getInnovatorCampaigns);
router.get("/trending", getTrendingCampaignsController);


export default router;
