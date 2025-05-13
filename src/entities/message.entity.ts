// src/entities/message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "./user";


export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  SEEN = "seen"
}
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "senderUserId" })
  sender!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "receiverUserId" })
  receiver!: User;

  @Column()
  content!: string;

  @Column({ type: "enum", enum: MessageStatus, default: MessageStatus.SENT })
  status!: MessageStatus;

  @CreateDateColumn()
  createdAt!: Date;
  static senderId: any;
  static receiverId: any;
}
