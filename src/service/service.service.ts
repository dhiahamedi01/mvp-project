import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    private notificationService: NotificationService,
  ) {}

  async create(createServiceDto: CreateServiceDto, userId?: number, isAdmin?: boolean): Promise<Service> {
    let parsedFields: Array<{
      id: number;
      label: string;
      placeholder: string;
      type: string;
      required: boolean;
    }> | null = null;

    if (createServiceDto.fields) {
      if (typeof createServiceDto.fields === 'string') {
        try {
          // Try to fix common JSON formatting issues
          let fieldsString = createServiceDto.fields
            .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*):/g, '$1"$2"$3:') // Add quotes around property names
            .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_\s]*?)([,}])/g, ': "$1"$2'); // Add quotes around string values

          parsedFields = JSON.parse(fieldsString);
        } catch (error) {
          throw new Error(`Invalid fields JSON format: ${error.message}`);
        }
      } else {
        parsedFields = createServiceDto.fields;
      }
    }

    const service = this.serviceRepository.create({
      ...createServiceDto,
      canHaveAttachment: createServiceDto.canHaveAttachment === 'true',
      fields: parsedFields || undefined,
    });
    
    const savedService = await this.serviceRepository.save(service);
    
    // Send notification to non-admin users when admin creates a service
    if (isAdmin) {
      await this.notificationService.notifyServiceCreated(
        savedService.id,
        savedService.title,
      );
    }
    
    return savedService;
  }

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({
      relations: ['serviceCategory'],
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['serviceCategory'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async findByCategory(categoryId: number): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { serviceCategoryId: categoryId },
      relations: ['serviceCategory'],
    });
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(id);

    let parsedFields: Array<{
      id: number;
      label: string;
      placeholder: string;
      type: string;
      required: boolean;
    }> | null = null;

    if (updateServiceDto.fields) {
      if (typeof updateServiceDto.fields === 'string') {
        try {
          // Try to fix common JSON formatting issues
          let fieldsString = updateServiceDto.fields
            .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*):/g, '$1"$2"$3:') // Add quotes around property names
            .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_\s]*?)([,}])/g, ': "$1"$2'); // Add quotes around string values

          parsedFields = JSON.parse(fieldsString);
        } catch (error) {
          throw new Error(`Invalid fields JSON format: ${error.message}`);
        }
      } else {
        parsedFields = updateServiceDto.fields;
      }
    }

    Object.assign(service, {
      ...updateServiceDto,
      canHaveAttachment: updateServiceDto.canHaveAttachment === 'true',
      fields: parsedFields !== null ? parsedFields : updateServiceDto.fields,
    });

    return await this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<{ status: string; message: string }> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['requests'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.serviceRepository.remove(service);

    return { status: 'success', message: 'Service deleted!' };
  }
}
