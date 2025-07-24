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
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import config from '../config';

@ApiTags('Requests')
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new request' })
  @ApiResponse({ status: 201, description: 'Request created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Request data with optional file attachments',
    type: CreateRequestDto,
  })
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/requests`,
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
    @Body() createRequestDto: CreateRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    // Ensure the request is created for the authenticated user
    createRequestDto.userId = req.user.userId;

    if (files && files.length > 0) {
      createRequestDto.attachments = files.map(
        (file) => `/uploads/requests/${file.filename}`,
      );
    }

    return this.requestService.create(createRequestDto, req.user.userId, req.user.isAdmin);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req, @Query('userId') userId?: string) {
    const isAdmin = req.user.isAdmin;

    if (isAdmin) {
      // Admins can see all requests or filter by userId
      if (userId) {
        return this.requestService.findByUser(+userId);
      }
      return this.requestService.findAll();
    } else {
      // Users can only see their own requests
      return this.requestService.findByUser(req.user.userId);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    const request = await this.requestService.findOne(+id);
    const isAdmin = req.user.isAdmin;

    // Users can only view their own requests, admins can view any
    if (!isAdmin && request.userId !== req.user.userId) {
      throw new Error('Unauthorized');
    }

    return request;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a request' })
  @ApiResponse({ status: 200, description: 'Request updated successfully.' })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated request data with optional file attachments',
    type: UpdateRequestDto,
  })
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/requests`,
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
    @Body() updateRequestDto: UpdateRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    const isAdmin = req.user.isAdmin;

    if (files && files.length > 0) {
      updateRequestDto.attachments = files.map(
        (file) => `/uploads/requests/${file.filename}`,
      );
    }

    return this.requestService.update(
      +id,
      updateRequestDto,
      req.user.userId,
      isAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    const isAdmin = req.user.isAdmin;
    return this.requestService.remove(+id, req.user.userId, isAdmin);
  }
}
