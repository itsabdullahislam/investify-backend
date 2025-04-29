import { Router } from 'express';
import { createCampaignController } from '../controllers/campaign.controller';

const router = Router();

router.post('/create', createCampaignController);

export default router;
