import {
    Entity,
    PrimaryColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
  import { User } from './user';
import { Investment } from './investment';
  
  @Entity()
  export class Investor {
    @PrimaryColumn()
    investor_id!: number;
  
    @OneToOne(() => User)
    @JoinColumn({ name: 'investor_id' })
    user!: User;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    company_name!: string;
    
    @Column({ type: 'varchar', length: 100, nullable: true })
    company_description!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    profile_picture?: string | null;
  
    @Column("text", { array: true, nullable: true })
    interest!: string[];
    
  
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    total_investment!: number;

    @OneToMany(() => Investment, (investment) => investment.investor)
  investments!: Investment[];
  }
  