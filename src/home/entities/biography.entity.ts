import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { DeputyInfo } from './deputy-info.entity';

@Entity('biography')
export class Biography {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  imageUrl: string;

  @OneToOne(() => DeputyInfo, deputyInfo => deputyInfo.biography)
  deputyInfo: DeputyInfo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}