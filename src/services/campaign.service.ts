import { AppDataSource } from '../config/data-source';
import { Campaign } from '../entities/campaign.entity';
import { User } from '../entities/user';
import axios from 'axios';

export const createCampaignService = async (
  user_id: number, 
  title: string, 
  description: string, 
  target_funding_goal: number, 
  published_date: Date, 
  funding_type: string | null, 
  demo_url: string | null, 
  video: string | null, 
  image: string | null, 
  equity_offered: number | null, 
  category: string | null
) => {
  const campaignRepo = AppDataSource.getRepository(Campaign);
  const userRepo = AppDataSource.getRepository(User);
 


  try {
    // 1. Find user
    const user = await userRepo.findOne({
      where: { user_id },
    });

    if (!user || user.role !== 'innovator') {
      throw new Error('Only innovators can create campaigns.');
    }

    // 2. Create campaign
    const campaign = new Campaign();
    campaign.innovator = user;
    campaign.title = title;
    campaign.description = description;
    campaign.target_funding_goal = target_funding_goal;
    campaign.current_funding_raised = 0;
    campaign.published_date = published_date;
    campaign.status = 'pending'; // Initially pending
    campaign.funding_type = funding_type || 'equity';
    campaign.demo_url = demo_url || null;
    campaign.video = video || null;
    campaign.image = image || null;
    campaign.equity_offered = equity_offered || null;
    campaign.category = category || null;
    campaign.likes = 0;

    // 3. Save campaign initially
    const savedCampaign = await campaignRepo.save(campaign);

    // 4. Call novelty API
    try {
      const noveltyResponse = await axios.post('http://localhost:8000/check-novelty', {
        title: savedCampaign.title,
        description: savedCampaign.description,
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Novelty API Response:', noveltyResponse.data);

      if (!noveltyResponse.data.is_novel) {
        savedCampaign.status = 'accepted';
      } else {
        savedCampaign.status = 'rejected';
      }

      // 5. Save updated campaign status
      await campaignRepo.save(savedCampaign);

    } catch (noveltyError) {
      console.error('Error calling novelty AI model:', noveltyError);
      // Optionally leave status as 'pending'
    }

    // 6. Return saved campaign (with final status)
    return savedCampaign;

  } catch (error) {
    console.error('Service Error creating campaign:', (error as Error).message);
    throw error; // throw original error, not custom string
  }
};


export const getAllCampaignsService = async () => {
  const campaignRepo = AppDataSource.getRepository(Campaign);

  try {
    const campaigns = await campaignRepo.find({
      relations: ['innovator'], // include user data if needed
      order: { published_date: 'DESC' },
    });

    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', (error as Error).message);
    throw error;
  }
};
