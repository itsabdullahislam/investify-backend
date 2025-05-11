import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user';
import { Campaign } from './campaign.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
    id!: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
    user!: User;

  @ManyToOne(() => Campaign, (campaign) => campaign.likes, { onDelete: 'CASCADE' })
    campaign!: Campaign;
}
