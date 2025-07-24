import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    private notificationService: NotificationService,
  ) {}

  async create(
    createComplaintDto: CreateComplaintDto,
    userId?: number,
    isAdmin?: boolean,
  ): Promise<Complaint> {
    const complaint = this.complaintRepository.create(createComplaintDto);
    const savedComplaint = await this.complaintRepository.save(complaint);

    // Send notification to admins when non-admin user creates a complaint
    if (!isAdmin) {
      await this.notificationService.notifyComplaintCreated(
        savedComplaint.id,
        savedComplaint.title || 'New Complaint',
      );
    }

    return savedComplaint;
  }

  async findAll(): Promise<Complaint[]> {
    return this.complaintRepository.find({
      relations: ['user'],
    });
  }

  async findByUser(userId: number): Promise<Complaint[]> {
    return this.complaintRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Complaint> {
    const complaint = await this.complaintRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async update(
    id: number,
    updateComplaintDto: UpdateComplaintDto,
    userId?: number,
    isAdmin?: boolean,
  ): Promise<Complaint> {
    const complaint = await this.findOne(id);

    // Only the owner or admin can update the complaint
    if (!isAdmin && complaint.userId !== userId) {
      throw new ForbiddenException('You can only update your own complaints');
    }

    const oldStatus = complaint.status;
    await this.complaintRepository.update(id, updateComplaintDto);
    const updatedComplaint = await this.findOne(id);

    // Send notification to user when admin updates the status
    if (
      isAdmin &&
      updateComplaintDto.status &&
      oldStatus !== updateComplaintDto.status
    ) {
      const statusNames = {
        1: 'جاري التنفيذ',
        2: 'يتم المراجعة',
        3: 'مقبول',
        4: 'مرفوض',
      };

      await this.notificationService.notifyComplaintStatusUpdated(
        complaint.userId,
        complaint.id,
        complaint.title,
        statusNames[updateComplaintDto.status] || 'Unknown',
        updateComplaintDto.status,
        updatedComplaint.instructions,
        updatedComplaint.link,
      );
    }

    return updatedComplaint;
  }

  async remove(id: number, userId?: number, isAdmin?: boolean): Promise<void> {
    const complaint = await this.findOne(id);

    // Only the owner or admin can delete the complaint
    if (!isAdmin && complaint.userId !== userId) {
      throw new ForbiddenException('You can only delete your own complaints');
    }

    await this.complaintRepository.remove(complaint);
  }
}
