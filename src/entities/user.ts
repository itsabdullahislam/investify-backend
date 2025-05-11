import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToOne,
    OneToMany,
    JoinColumn,
  } from 'typeorm';
import { Investor } from './investor.entity';
import { Innovator } from './innovator.entity';
import { Like } from './like.entity';
  
  export type UserRole = 'innovator' | 'investor' | 'admin';
  export type UserStatus = 'Active' | 'Inactive' | 'Suspended'; // can be extended later
  
  @Entity({ name: 'users' })
  export class User {
    @PrimaryGeneratedColumn()
      user_id!: number;
  
    @Column({ type: 'varchar', length: 100 })
      name!: string;
  
    @Column({ type: 'varchar', length: 100, unique: true })
      email!: string;
  
    @Column({ type: 'varchar', length: 255 })
      password!: string;
  
    @Column({ type: 'varchar', length: 50 })
      role!: UserRole;
  
    @Column({ type: 'varchar', length: 15, nullable: true })
      phone_number!: string;
  
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registration_date!: Date;

  
    @Column({ type: 'varchar', length: 20, default: 'Active' })
      status!: UserStatus;

    @OneToMany(() => Like, (like: { user: any; }) => like.user)
    likes!: Like[];


    @OneToOne(() => Innovator, (innovator) => innovator.user)
    @JoinColumn({ name: 'innovator_id'})
      innovator!: Innovator;
    
     
    @OneToOne(() => Investor, (investor: { user: any; }) => investor.user)
      investor?: Investor;
  }
  