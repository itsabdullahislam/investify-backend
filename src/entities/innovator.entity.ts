import {
    Entity,
    PrimaryColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
  import { User } from './user';
import { Campaign } from './campaign.entity';
  
  @Entity()
  export class Innovator {
    @PrimaryColumn()
    innovator_id!: number;
  
    @OneToOne(() => User)
    @JoinColumn({ name: 'innovator_id' })
    user!: User;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    company_name!: string;
  
    @Column({ type: 'text', nullable: true })
    company_description!: string;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    industry!: string;
  
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    funds_raised!: number;
   
    @Column({ type: 'integer',  default: 0 })
    campaigns_count!: number;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    profile_picture?: string | null;
  
    @OneToMany(() => Campaign, (campaign) => campaign.innovator)
    campaigns!: Campaign[];
  }
  