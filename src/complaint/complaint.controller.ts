import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request as Req,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ComplaintService } from './complaint.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import config from '../config';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new complaint' })
  @ApiResponse({ status: 201, description: 'Complaint created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Complaint data with optional file attachments',
    type: CreateComplaintDto,
  })
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/complaints`,
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file
      },
    }),
  )
  create(
    @Body() createComplaintDto: CreateComplaintDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    // Ensure the complaint is created for the authenticated user
    createComplaintDto.userId = req.user.userId;

    if (files && files.length > 0) {
      createComplaintDto.attachments = files.map(
        (file) => `/uploads/complaints/${file.filename}`,
      );
    }

    return this.complaintService.create(createComplaintDto, req.user.userId, req.user.isAdmin);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req, @Query('userId') userId?: string) {
    const isAdmin = req.user.isAdmin;

    if (isAdmin) {
      // Admins can see all complaints or filter by userId
      if (userId) {
        return this.complaintService.findByUser(+userId);
      }
      return this.complaintService.findAll();
    } else {
      // Users can only see their own complaints
      return this.complaintService.findByUser(req.user.userId);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    const complaint = await this.complaintService.findOne(+id);
    const isAdmin = req.user.isAdmin;

    // Users can only view their own complaints, admins can view any
    if (!isAdmin && complaint.userId !== req.user.userId) {
      throw new Error('Unauthorized');
    }

    return complaint;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a complaint' })
  @ApiResponse({ status: 200, description: 'Complaint updated successfully.' })
  @ApiResponse({ status: 404, description: 'Complaint not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated complaint data with optional file attachments',
    type: UpdateComplaintDto,
  })
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/complaints`,
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    const isAdmin = req.user.isAdmin;

    if (files && files.length > 0) {
      updateComplaintDto.attachments = files.map(
        (file) => `/uploads/complaints/${file.filename}`,
      );
    }

    return this.complaintService.update(
      +id,
      updateComplaintDto,
      req.user.userId,
      isAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    const isAdmin = req.user.isAdmin;
    return this.complaintService.remove(+id, req.user.userId, isAdmin);
  }
}
