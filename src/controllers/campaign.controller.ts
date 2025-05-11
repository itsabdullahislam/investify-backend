import { RequestHandler } from 'express';
import { createCampaignService, getTrendingCampaigns } from '../services/campaign.service';
import { upload } from '../middleware/upload.middleware';
import { getCampaignsByInnovatorId } from '../services/campaign.service';



upload.fields([{ name: 'image' }, { name: 'video' }])

export const createCampaignController: RequestHandler = async (req, res, next) => {
  try {
    const {
      user_id,
      title,
      description,
      target_funding_goal,
      published_date,
      funding_type,
      demo_url,
      equity_offered,
      category,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const image = files?.['image']?.[0]?.path || null;
    const video = files?.['video']?.[0]?.path || null;

    // Handle docs (can be multiple)
    const docs = files?.['docs']?.map(file => file.path) || [];

    const campaign = await createCampaignService(
      Number(user_id),
      title,
      description,
      Number(target_funding_goal),
      new Date(published_date),
      funding_type,
      demo_url,
      video,
      image,
      equity_offered ? Number(equity_offered) : null,
      category,
      docs // Pass to service
    );

    res.status(201).json({
      message: 'Campaign created successfully, awaiting approval.',
      campaign,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      message: err.message || 'Controller Error creating campaign.',
    });
  }
};



import { Request, Response } from 'express';
import { getAllCampaignsService } from '../services/campaign.service';

export const getAllCampaignsController = async (req: Request, res: Response) => {
  try {
    const campaigns = await getAllCampaignsService();
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch campaigns', error: (error as Error).message });
  }
};



export const getInnovatorCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
       res.status(400).json({ message: 'Invalid user ID' });
    }

    const campaigns = await getCampaignsByInnovatorId(userId);
     res.status(200).json(campaigns);
  } catch (error) {
    console.error(error);
   res.status(500).json({ message: 'Server error' });
  }
};


export const getTrendingCampaignsController = async (req: Request, res: Response) => {
  try {
    const campaigns = await getTrendingCampaigns();
    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trending campaigns", error: err });
  }
};
