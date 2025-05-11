import { AppDataSource } from '../config/data-source';
import { Innovator } from '../entities/innovator.entity';
import { User } from '../entities/user';


export const getInnovatorProfile = async (user_id: number) => {
    const userRepo = AppDataSource.getRepository(User);
  
    const user = await userRepo
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.innovator', 'innovator')
  .where('user.user_id = :user_id', { user_id })
  .getOne();

  
    if (!user || !user.innovator) {
      throw new Error('Innovator profile not found');
    }
  
    return { user};
  };
  
  interface UpdateProfileData {
    name?: string;
    phone_number?: string;
    company_name?: string;
    company_description?: string;
  }
  
  export const updateInnovatorProfileService = async (
    user_id: number,
    updates: UpdateProfileData
  ) => {
    const userRepo = AppDataSource.getRepository(User);
    const innovatorRepo = AppDataSource.getRepository(Innovator);
  
    const user = await userRepo.findOne({
      where: { user_id },
      relations: ['innovator'],
    });
  
    if (!user || user.role !== 'innovator') {
      throw new Error('User not found or is not an innovator.');
    }
  
    // Update user table fields
    if (updates.name) user.name = updates.name;
    if (updates.phone_number) user.phone_number = updates.phone_number;
    await userRepo.save(user);
  
    // Update innovator table fields
    const innovator = user.innovator;
  
    if (innovator) {
      if (updates.company_name) innovator.company_name = updates.company_name;
      if (updates.company_description) innovator.company_description = updates.company_description;
      await innovatorRepo.save(innovator);
    }
  
    return { user };
  };