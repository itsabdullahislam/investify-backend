import { RequestHandler } from 'express';
import { createCampaignService } from '../services/campaign.service';
import { upload } from '../middleware/upload.middleware';

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

    

    // Extract uploaded file paths if available
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const image = files?.['image']?.[0]?.path || null;
    const video = (files?.['video']?.[0]?.path) || null;

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
      category
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
