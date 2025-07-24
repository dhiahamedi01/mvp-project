import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Service } from '../../service/entities/service.entity';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => ServiceCategory, category => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: ServiceCategory | null;

  @OneToMany(() => ServiceCategory, category => category.parent)
  children: ServiceCategory[];

  @OneToMany(() => Service, service => service.serviceCategory)
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}