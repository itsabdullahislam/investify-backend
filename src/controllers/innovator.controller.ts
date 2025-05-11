import { Request, Response } from 'express';
import { getInnovatorProfile } from '../services/innovator.service';
import { updateInnovatorProfileService } from '../services/innovator.service';
import { AppDataSource } from '../config/data-source';
import { Innovator } from '../entities/innovator.entity';


export const getInnovatorProfileController = async (req: Request, res: Response) => {
    const user_id = parseInt(req.params.user_id);
  
    try {
      const innovator = await getInnovatorProfile(user_id);
      res.status(200).json(innovator);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch innovator profile",
        error: (error as Error).message,
      });
    }
  };
    
export const updateInnovatorProfileController = async (req: Request, res: Response): Promise<void> => {
    const user_id = parseInt(req.params.user_id);
    const { name, phone_number, company_name, company_description } = req.body;
  
    try {
      const updatedProfile = await updateInnovatorProfileService(user_id, {
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
      console.error('Error updating innovator profile:', error);
      res.status(500).json({
        message: 'Failed to update profile',
        error: (error as Error).message,
      });
    }
  };
  


  export const updateProfilePictureController = async (req: Request, res: Response): Promise<void> => {
    const user_id = parseInt(req.params.user_id);
    const file = req.file;
  
    if (!file) {
       res.status(400).json({ message: 'No file uploaded' });
       return;
    }
  
    try {
      const innovatorRepo = AppDataSource.getRepository(Innovator);
      const innovator = await innovatorRepo.findOne({
         where: { user: { user_id } }, 
        relations: ['user'], 
      });
  
      if (!innovator) {
         res.status(404).json({ message: 'Innovator not found' });
         return;
      }
  
      innovator.profile_picture = file.path; // e.g., "uploads/12345-profile.png"
      await innovatorRepo.save(innovator);
  
      res.status(200).json({
        message: 'Profile picture updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      next(error);
    }
  };

function next(error: unknown) {
  throw new Error('Function not implemented.');
}
