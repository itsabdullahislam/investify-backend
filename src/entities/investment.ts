import {
    Entity,
    PrimaryColumn,
    Column,
    OneToOne,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Investor } from './investor.entity';
import { Campaign } from './campaign.entity';

@Entity('investments')
 export class Investment {
  @PrimaryGeneratedColumn()
  investment_id!: number;

  @ManyToOne(() => Investor, (investor) => investor.investments)
  @JoinColumn({ name: 'investor_id' })
  investor!: Investor;

  @ManyToOne(() => Campaign, (campaign) => campaign.investments)
  @JoinColumn({ name: 'campaign_id' })
  campaign!: Campaign;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  investment_date!: Date;
}
