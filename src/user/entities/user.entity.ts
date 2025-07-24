import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Request } from '../../request/entities/request.entity';
import { Complaint } from '../../complaint/entities/complaint.entity';
import { Post } from '../../post/entities/post.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  password: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  fcmToken?: string;

  @OneToMany(() => Request, (request) => request.user, {
    onDelete: 'CASCADE',
  })
  requests: Request[];

  @OneToMany(() => Complaint, (complaint) => complaint.user, {
    onDelete: 'CASCADE',
  })
  complaints: Complaint[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    onDelete: 'CASCADE',
  })
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
