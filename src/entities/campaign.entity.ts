import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user'; // Import User entity

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn()
  campaign_id!: number;

  @ManyToOne(() => User, (user) => user.campaigns) // Link to the innovator
  @JoinColumn({ name: 'innovator_id' })
  innovator!: User;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  target_funding_goal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  current_funding_raised!: number;

  @Column({ type: 'timestamp' })
  start_date!: Date;

  @Column({ type: 'timestamp' })
  end_date!: Date;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @Column({ type: 'varchar', length: 50, default: 'crowdfunding equity' })
  funding_type!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  demo_url?: string;
}
