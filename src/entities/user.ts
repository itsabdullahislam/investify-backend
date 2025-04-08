import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
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
  
    @Column({ type: 'varchar', length: 255, nullable: true })
      profile_picture!: string;
  
    @Column({ type: 'varchar', length: 20, default: 'Active' })
      status!: UserStatus;
  }
  