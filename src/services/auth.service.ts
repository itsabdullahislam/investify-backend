import { AppDataSource } from '../config/data-source'; // we'll set this up later
import { User } from '../entities/user';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

const userRepo = AppDataSource.getRepository(User);

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

    await userRepo.save(newUser);

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
