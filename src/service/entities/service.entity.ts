import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ServiceCategory } from '../../service-category/entities/service-category.entity';
import { Request as RequestEntity } from '../../request/entities/request.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  requestFormType: string;

  @Column({ default: false })
  canHaveAttachment?: boolean;

  @Column('json', { nullable: true })
  fields: Array<{
    id: number;
    label: string;
    placeholder: string;
    type: string;
    required: boolean;
  }>;

  @Column()
  serviceCategoryId: number;

  @ManyToOne(
    () => ServiceCategory,
    (serviceCategory) => serviceCategory.services,
  )
  @JoinColumn({ name: 'serviceCategoryId' })
  serviceCategory: ServiceCategory;

  @OneToMany(() => RequestEntity, (request) => request.service, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  requests: RequestEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
