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
import { Service } from 'src/service/entities/service.entity';

export enum RequestStatus {
  PENDING = 1,
  UNDER_REVIEW = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

export interface RequestField {
  id: number;
  content: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column('simple-array', { nullable: true })
  attachments: string[]; // Array of file paths

  @Column({ type: 'json', nullable: true })
  fields: RequestField[];

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ nullable: true })
  instructions: string;

  @Column({ nullable: true })
  link: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.requests)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Service, (service) => service.requests, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ default: 1, name: 'serviceId' })
  serviceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
