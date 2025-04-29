import { Router } from 'express';
import { InvestorController } from '../controllers/investor.controller';

const router = Router();

// Route to get investor stats
router.get('/investor/:id/stats', InvestorController.getInvestorStats);

export default router;
