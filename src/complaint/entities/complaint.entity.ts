import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ComplaintType {
  COMPLAINT = 'complaint',
  SUGGESTION = 'suggestion',
}

export enum ComplaintStatus {
  PENDING = 1,
  UNDER_REVIEW = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: ComplaintType,
    default: ComplaintType.COMPLAINT,
  })
  complaintType: ComplaintType;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column('simple-array', { nullable: true })
  attachments: string[]; // Array of file paths

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  status: ComplaintStatus;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.complaints)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  instructions: string;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
