import { Request, Response } from 'express';
import { InvestorService } from '../services/investor.service';

export class InvestorController {
  

  static async setInterest(req: Request, res: Response) {
    try {
    const userId = req.body.user_id;

    if (!userId) {
       res.status(400).json({ message: "User ID is required." });
    }

    const { interests } = req.body;
    if (!Array.isArray(interests)) {
       res.status(400).json({ message: "Interests must be an array." });
    }

    const updatedInvestor = await InvestorService.setInterest(
      userId,
      interests
    );

      res.status(200).json({
        message: "Interests updated successfully",
        interests: updatedInvestor.interest,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }


  static async getInvestorProfile(req: Request, res: Response) {
    try {
     const user_id = parseInt(req.params.user_id);
      const investorProfile = await InvestorService.getInvestorProfile(user_id);
      res.status(200).json(investorProfile);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: 'An error occurred while fetching investor profile', error: errorMessage });
    }
  }

  static async updateProfilePicture(req: Request, res: Response): Promise<void>{
  try {
    const userId = parseInt(req.params.id);
    const filePath = req.file?.path;

    if (!filePath) {
      res.status(400).json({ message: "No file uploaded" });
    }

    if (!filePath) {
       res.status(400).json({ message: "No file uploaded" });
       return;
    }

    const updatedInvestor = await InvestorService.updateInvestorProfile(userId, filePath);
    res.status(200).json({ message: "Profile picture updated", investor: updatedInvestor });
  } catch (err) {
    console.error("Error updating investor profile picture:", err);
    res.status(500).json({ message: "Server error" });
  }
};

 static async updateInvestorProfileInfo(req: Request, res: Response){
 const user_id = parseInt(req.params.user_id);
     const { name, phone_number, company_name, company_description } = req.body;
   
     try {
       const updatedProfile = await InvestorService.updateInvestorProfileInfo(user_id, {
         name,
         phone_number,
         company_name,
         company_description,
       });
   
       res.status(200).json({
         message: 'Profile updated successfully',
         profile: updatedProfile,
       });
     } catch (error) {
       console.error('Error updating investor profile:', error);
       res.status(500).json({
         message: 'Failed to update profile',
         error: (error as Error).message,
       });
     }
};

static async getRankedInvestors(req: Request, res: Response) {
  try {
    const rankedInvestors = await InvestorService.getRankedInvestors();
     res.status(200).json(rankedInvestors);
  } catch (error) {
    console.error("Error fetching ranked investors:", error);
     res.status(500).json({ message: "Internal server error" });
  }
}


static async getInvestorInterestCampaigns(req: Request, res: Response) {
try {
    const user_id = parseInt(req.params.user_id);
    const campaigns = await InvestorService.getInvestorInterestCampaigns(user_id);
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching interest-based campaigns:", error);
    res.status(500).json({ message: "Failed to load investor feed" });
  }


}
}