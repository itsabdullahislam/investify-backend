import { RequestHandler } from 'express';
import { createCampaignService } from '../services/campaign.service';

export const createCampaignController: RequestHandler = async (req, res, next) => {
  const { 
    user_id, 
    title, 
    description, 
    target_funding_goal, 
    start_date, 
    end_date, 
    funding_type, 
    demo_url, 
    video, 
    image, 
    equity_offered, 
    category 
  } = req.body;

  try {
    const campaign = await createCampaignService(
      user_id, 
      title, 
      description, 
      target_funding_goal, 
      start_date, 
      end_date, 
      funding_type, 
      demo_url, 
      video, 
      image, 
      equity_offered, 
      category
    );

    // Remove the 'return' - just send the response
    res.status(201).json({
      message: 'Campaign created successfully, awaiting approval.',
      campaign,
    });
  } catch (error: unknown) {
    const err = error as Error;
    // Remove the 'return' here as well
    res.status(500).json({
      message: err.message || 'controller Error creating campaign.',
    });
  }
};