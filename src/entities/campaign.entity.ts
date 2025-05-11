import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user'; // Import User entity
import { Investment } from './investment';
import { Innovator } from './innovator.entity';
import { Like } from './like.entity';


@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn()
  campaign_id!: number;

  @ManyToOne(() => Innovator, (innovator) => innovator.campaigns)
  @JoinColumn({ name: 'innovator_id' })
  innovator!: Innovator;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  target_funding_goal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  current_funding_raised!: number;


  @Column({ type: 'timestamp' })
  published_date!: Date;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @Column({ type: 'varchar', length: 50, default: 'crowdfunding equity' })
  funding_type!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  demo_url?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  video?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string | null;
  
  @Column("text", { array: true, nullable: true })
  docs?: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  equity_offered?: number | null; 

  @OneToMany(() => Like, like => like.campaign)
  likes!: Like[];


  @OneToMany(() => Investment, (investment) => investment.campaign)
  investments!: Investment[];
  campaign!: User;
    id: any;
}
