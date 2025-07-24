import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    private notificationService: NotificationService,
  ) {}

  async create(
    createRequestDto: CreateRequestDto,
    userId?: number,
    isAdmin?: boolean,
  ): Promise<Request> {
    const request = this.requestRepository.create(createRequestDto);
    const savedRequest = await this.requestRepository.save(request);

    // Send notification to admins when non-admin user creates a request
    if (!isAdmin) {
      await this.notificationService.notifyRequestCreated(
        savedRequest.id,
        `Request #${savedRequest.id}`,
      );
    }

    return savedRequest;
  }

  async findAll(): Promise<Request[]> {
    return this.requestRepository.find({
      relations: ['user'],
    });
  }

  async findByUser(userId: number): Promise<Request[]> {
    return this.requestRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async update(
    id: number,
    updateRequestDto: UpdateRequestDto,
    userId?: number,
    isAdmin?: boolean,
  ): Promise<Request> {
    const request = await this.findOne(id);

    // Only the owner or admin can update the request
    if (!isAdmin && request.userId !== userId) {
      throw new ForbiddenException('You can only update your own requests');
    }

    const oldStatus = request.status;
    await this.requestRepository.update(id, updateRequestDto);
    const updatedRequest = await this.findOne(id);

    // Send notification to user when admin updates the status
    if (
      isAdmin &&
      updateRequestDto.status &&
      oldStatus !== updateRequestDto.status
    ) {
      const statusNames = {
        1: 'جاري التنفيذ',
        2: 'يتم المراجعة',
        3: 'مقبول',
        4: 'مرفوض',
      };

      await this.notificationService.notifyRequestStatusUpdated(
        request.userId,
        request.id,
        request.service?.title || 'Request',
        statusNames[updateRequestDto.status] || 'Unknown',
        updateRequestDto.status,
        updatedRequest.instructions,
        updatedRequest.link,
      );
    }

    return updatedRequest;
  }

  async remove(id: number, userId?: number, isAdmin?: boolean): Promise<void> {
    const request = await this.findOne(id);

    // Only the owner or admin can delete the request
    if (!isAdmin && request.userId !== userId) {
      throw new ForbiddenException('You can only delete your own requests');
    }

    await this.requestRepository.remove(request);
  }
}
