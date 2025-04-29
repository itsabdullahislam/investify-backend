import { Router } from 'express';
import { createCampaignController } from '../controllers/campaign.controller';
import { upload } from '../middleware/upload.middleware';
import { getAllCampaignsController } from '../controllers/campaign.controller';

const router = Router();
router.post(
    '/create',
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
    createCampaignController
  );

router.get('/all', getAllCampaignsController);


export default router;
