import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum NotificationType {
  SERVICE_CREATED = 'service_created',
  REQUEST_CREATED = 'request_created',
  REQUEST_STATUS_UPDATED = 'request_status_updated',
  COMPLAINT_CREATED = 'complaint_created',
  COMPLAINT_STATUS_UPDATED = 'complaint_status_updated',
  POST_CREATED = 'post_created',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ nullable: true })
  relatedEntityId?: number;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ default: false })
  isPublic: boolean; // True for public notifications (visible to all users)

  @Column({ type: 'json', nullable: true })
  readByUsers?: number[]; // Array of user IDs who have read this public notification

  @Column({ nullable: true })
  fcmToken?: string;

  @Column({ default: false })
  sent: boolean;

  @Column({ type: 'json', nullable: true })
  data?: any; // Additional data for notifications (instructions, link, etc.)

  @CreateDateColumn()
  createdAt: Date;
}
