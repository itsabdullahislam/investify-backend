import { AppDataSource } from '../config/data-source'; 
import { User } from '../entities/user';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { Innovator } from '../entities/innovator.entity';
import { Investor } from '../entities/investor.entity';

const userRepo = AppDataSource.getRepository(User);
const investorRepo = AppDataSource.getRepository(Investor);
const innovatorRepo = AppDataSource.getRepository(Innovator);

export class AuthService {
  static async register(data: Partial<User>) {
    const { name, email, password, role, phone_number } = data;

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) throw new Error('Email already in use');

    const hashedPassword = await bcrypt.hash(password!, 10);

    const newUser = userRepo.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone_number,
    });

    const savedUser = await userRepo.save(newUser);
    if (role === 'investor') {
      const investor = investorRepo.create({
        investor_id: savedUser.user_id,
        company_name: '',
        company_description: '',
        profile_picture: null,
        interest: '',
        total_investment: 0,
      });
      await investorRepo.save(investor);
    } else if (role === 'innovator') {
      const innovator = innovatorRepo.create({
        innovator_id: savedUser.user_id,
        company_name: '',
        company_description: '',
        profile_picture: null,
        industry: '',
        funds_raised: 0,
      });
      await innovatorRepo.save(innovator);
    }

    return generateToken({ id: newUser.user_id, role: newUser.role });
  }

  static async login(email: string, password: string) {
    const user = await userRepo.findOne({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    return {
        token: generateToken({ id: user.user_id, role: user.role }),
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
      ;
  }
}
