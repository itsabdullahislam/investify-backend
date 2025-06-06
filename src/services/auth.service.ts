import { AppDataSource } from '../config/data-source'; 
import { User, UserRole } from '../entities/user';

import { generateToken } from '../utils/jwt';
import { Innovator } from '../entities/innovator.entity';
import { Investor } from '../entities/investor.entity';

const userRepo = AppDataSource.getRepository(User);
const investorRepo = AppDataSource.getRepository(Investor);
const innovatorRepo = AppDataSource.getRepository(Innovator);

export class AuthService {
  static async register(data: { name: string; email: string; password: string; role: UserRole; phoneNumber: string; }) {
    const { name, email, password, role, phoneNumber } = data;

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) throw new Error('Email already in use');

    

    const newUser = userRepo.create({
      name,
      email,
      password,
      role,
      phone_number: phoneNumber,
    });

    const savedUser = await userRepo.save(newUser);
    if (role === 'investor') {
      const investor = investorRepo.create({
        investor_id: savedUser.user_id,
        company_name: '',
        company_description: '',
        profile_picture: null,
        interest: [],
        total_investment: 0,
      });
      await investorRepo.save(investor);
      newUser.investor = investor;
      await userRepo.save(newUser);
    } else if (role === 'innovator') {
      const newinnovator = innovatorRepo.create({
        innovator_id: savedUser.user_id,
        company_name: '',
        company_description: '',
        profile_picture: null,
        industry: '',
        funds_raised: 0,
      });
      const savedInnovator = await innovatorRepo.save(newinnovator);
     newUser.innovator = savedInnovator;
     await userRepo.save(newUser);
    }

    
    return generateToken({ id: newUser.user_id, role: newUser.role });
  }

  static async login(email: string, password: string) {
    const user = await userRepo.findOne({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    // Compare plain password directly
    if (password !== user.password) throw new Error('Invalid credentials')

    let isFirstTime = false;

    if( user.role == "investor" ) {
    const investor = await investorRepo.findOne({ where: { investor_id: user.user_id } });
    if (investor && (!investor.interest || investor.interest.length === 0)) {
      isFirstTime = true;
    }
    }
    return {
        token: generateToken({ id: user.user_id, role: user.role }),
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          isFirstTime,
        }
      }
      ;
  }
}
