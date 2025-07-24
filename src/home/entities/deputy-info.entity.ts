import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Biography } from './biography.entity';
import { Certificate } from './certificate.entity';
import { PreviousWork } from './previous-work.entity';

@Entity('deputy_info')
export class DeputyInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  imageUrl: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @OneToOne(() => Biography, (biography) => biography.deputyInfo, {
    cascade: true,
  })
  @JoinColumn()
  biography: Biography;

  @OneToMany(() => Certificate, (certificate) => certificate.deputyInfo, {
    cascade: true,
  })
  certificates: Certificate[];

  @OneToMany(() => PreviousWork, (previousWork) => previousWork.deputyInfo, {
    cascade: true,
  })
  previousWorks: PreviousWork[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
