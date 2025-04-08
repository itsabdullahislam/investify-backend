import { AppDataSource } from '../config/data-source';
import { Campaign } from '../entities/campaign.entity';

export class CampaignService {
  private campaignRepository = AppDataSource.getRepository(Campaign);

  async createCampaign(data: any) {
    const newCampaign = this.campaignRepository.create(data);
    return await this.campaignRepository.save(newCampaign);
  }

  async getAllCampaigns() {
    return await this.campaignRepository.find();
  }

  async getCampaignById(id: number) {
    return await this.campaignRepository.findOne({
      where: { campaign_id: id },
    });
  }
}
