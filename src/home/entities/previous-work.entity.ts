import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { DeputyInfo } from './deputy-info.entity';

@Entity('previous_works')
export class PreviousWork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json' })
  attachments: string[]; // Array of image and video file paths

  @ManyToOne(() => DeputyInfo, { onDelete: 'CASCADE' })
  deputyInfo: DeputyInfo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}