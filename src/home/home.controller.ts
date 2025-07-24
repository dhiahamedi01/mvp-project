import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { HomeService } from './home.service';
import { CreateDeputyInfoDto } from './dto/create-deputy-info.dto';
import { UpdateDeputyInfoDto } from './dto/update-deputy-info.dto';
import { CreateBiographyDto } from './dto/create-biography.dto';
import { UpdateBiographyDto } from './dto/update-biography.dto';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { CreatePreviousWorkDto } from './dto/create-previous-work.dto';
import { UpdatePreviousWorkDto } from './dto/update-previous-work.dto';
import { DeputyInfo } from './entities/deputy-info.entity';
import { Biography } from './entities/biography.entity';
import { Certificate } from './entities/certificate.entity';
import { PreviousWork } from './entities/previous-work.entity';
import config from '../config';

@ApiTags('Home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Post('deputy-info')
  @ApiOperation({ summary: 'Create deputy information' })
  @ApiResponse({
    status: 201,
    description: 'Deputy information created successfully.',
    type: DeputyInfo,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Deputy information with file uploads',
    type: CreateDeputyInfoDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageUrl', maxCount: 1 },
        { name: 'biography.imageUrl', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/home`,
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
      },
    ),
  )
  create(
    @Body() createDeputyInfoDto: CreateDeputyInfoDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<DeputyInfo> {
    // Process uploaded files and update DTO paths
    if (files['imageUrl']?.[0]) {
      createDeputyInfoDto.imageUrl = `/uploads/home/${files['imageUrl'][0].filename}`;
    }

    return this.homeService.create(createDeputyInfoDto);
  }

  @Get('deputy-info')
  @ApiOperation({ summary: 'Get all deputy information' })
  @ApiResponse({
    status: 200,
    description: 'List of all deputy information.',
    type: [DeputyInfo],
  })
  findAll(): Promise<DeputyInfo[]> {
    return this.homeService.findAll();
  }

  @Get('deputy-profile')
  @ApiOperation({ summary: 'Get deputy profile for homepage' })
  @ApiResponse({
    status: 200,
    description: 'Deputy profile information.',
    type: DeputyInfo,
  })
  @ApiResponse({ status: 404, description: 'No deputy profile found.' })
  getDeputyProfile(): Promise<DeputyInfo> {
    return this.homeService.getDeputyProfile();
  }

  @Get('deputy-info/:id')
  @ApiOperation({ summary: 'Get deputy information by ID' })
  @ApiParam({ name: 'id', description: 'Deputy info ID' })
  @ApiResponse({
    status: 200,
    description: 'Deputy information found.',
    type: DeputyInfo,
  })
  @ApiResponse({ status: 404, description: 'Deputy information not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<DeputyInfo> {
    return this.homeService.findOne(id);
  }

  @Patch('deputy-info/:id')
  @ApiOperation({ summary: 'Update deputy information' })
  @ApiParam({ name: 'id', description: 'Deputy info ID' })
  @ApiResponse({
    status: 200,
    description: 'Deputy information updated successfully.',
    type: DeputyInfo,
  })
  @ApiResponse({ status: 404, description: 'Deputy information not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated deputy information with file uploads',
    type: UpdateDeputyInfoDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageUrl', maxCount: 1 },
        { name: 'biography.imageUrl', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/home`,
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
      },
    ),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeputyInfoDto: UpdateDeputyInfoDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<DeputyInfo> {
    // Process uploaded files and update DTO paths
    if (files['imageUrl']?.[0]) {
      updateDeputyInfoDto.imageUrl = `/uploads/home/${files['imageUrl'][0].filename}`;
    }

    return this.homeService.update(id, updateDeputyInfoDto);
  }

  @Delete('deputy-info/:id')
  @ApiOperation({ summary: 'Delete deputy information' })
  @ApiParam({ name: 'id', description: 'Deputy info ID' })
  @ApiResponse({
    status: 200,
    description: 'Deputy information deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Deputy information not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.homeService.remove(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed sample deputy data (for development)' })
  @ApiResponse({
    status: 201,
    description: 'Sample data seeded successfully.',
    type: DeputyInfo,
  })
  @ApiResponse({
    status: 200,
    description: 'Sample data already exists.',
    type: DeputyInfo,
  })
  seedSampleData(): Promise<DeputyInfo> {
    return this.homeService.seedSampleData();
  }

  // Biography endpoints
  @Post('biography/create')
  @ApiOperation({ summary: 'Create biography' })
  @ApiResponse({
    status: 201,
    description: 'Biography created successfully.',
    type: Biography,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Biography information with file upload',
    type: CreateBiographyDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imageUrl', maxCount: 1 }], {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/home`,
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
  createBiography(
    @Body() createBiographyDto: CreateBiographyDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<Biography> {
    if (files['imageUrl']?.[0]) {
      createBiographyDto.imageUrl = `/uploads/home/${files['imageUrl'][0].filename}`;
    }
    return this.homeService.createBiography(createBiographyDto);
  }

  @Get('biography')
  @ApiOperation({ summary: 'Get all biographies' })
  @ApiResponse({
    status: 200,
    description: 'List of all biographies.',
    type: [Biography],
  })
  findAllBiographies(): Promise<Biography[]> {
    return this.homeService.findAllBiographies();
  }

  @Get('biography/:id')
  @ApiOperation({ summary: 'Get biography by ID' })
  @ApiParam({ name: 'id', description: 'Biography ID' })
  @ApiResponse({
    status: 200,
    description: 'Biography found.',
    type: Biography,
  })
  @ApiResponse({ status: 404, description: 'Biography not found.' })
  findOneBiography(@Param('id', ParseIntPipe) id: number): Promise<Biography> {
    return this.homeService.findOneBiography(id);
  }

  @Patch('biography/:id')
  @ApiOperation({ summary: 'Update biography' })
  @ApiParam({ name: 'id', description: 'Biography ID' })
  @ApiResponse({
    status: 200,
    description: 'Biography updated successfully.',
    type: Biography,
  })
  @ApiResponse({ status: 404, description: 'Biography not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated biography information with file upload',
    type: UpdateBiographyDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imageUrl', maxCount: 1 }], {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/home`,
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
  updateBiography(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBiographyDto: UpdateBiographyDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<Biography> {
    if (files['imageUrl']?.[0]) {
      updateBiographyDto.imageUrl = `/uploads/home/${files['imageUrl'][0].filename}`;
    }
    return this.homeService.updateBiography(id, updateBiographyDto);
  }

  @Delete('biography/:id')
  @ApiOperation({ summary: 'Delete biography' })
  @ApiParam({ name: 'id', description: 'Biography ID' })
  @ApiResponse({ status: 200, description: 'Biography deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Biography not found.' })
  removeBiography(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.homeService.removeBiography(id);
  }

  // Certificate endpoints
  @Post('certificate/create')
  @ApiOperation({ summary: 'Create certificate' })
  @ApiResponse({
    status: 201,
    description: 'Certificate created successfully.',
    type: Certificate,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Certificate information with file upload',
    type: CreateCertificateDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/home`,
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
  createCertificate(
    @Body() createCertificateDto: CreateCertificateDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<Certificate> {
    if (files['image']?.[0]) {
      createCertificateDto.image = `/uploads/home/${files['image'][0].filename}`;
    }
    return this.homeService.createCertificate(createCertificateDto);
  }

  @Get('certificate')
  @ApiOperation({ summary: 'Get all certificates' })
  @ApiResponse({
    status: 200,
    description: 'List of all certificates.',
    type: [Certificate],
  })
  findAllCertificates(): Promise<Certificate[]> {
    return this.homeService.findAllCertificates();
  }

  @Get('certificate/:id')
  @ApiOperation({ summary: 'Get certificate by ID' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiResponse({
    status: 200,
    description: 'Certificate found.',
    type: Certificate,
  })
  @ApiResponse({ status: 404, description: 'Certificate not found.' })
  findOneCertificate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Certificate> {
    return this.homeService.findOneCertificate(id);
  }

  @Patch('certificate/:id')
  @ApiOperation({ summary: 'Update certificate' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiResponse({
    status: 200,
    description: 'Certificate updated successfully.',
    type: Certificate,
  })
  @ApiResponse({ status: 404, description: 'Certificate not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated certificate information with file upload',
    type: UpdateCertificateDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/home`,
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
  updateCertificate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCertificateDto: UpdateCertificateDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<Certificate> {
    if (files['image']?.[0]) {
      updateCertificateDto.image = `/uploads/home/${files['image'][0].filename}`;
    }
    return this.homeService.updateCertificate(id, updateCertificateDto);
  }

  @Delete('certificate/:id')
  @ApiOperation({ summary: 'Delete certificate' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiResponse({
    status: 200,
    description: 'Certificate deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Certificate not found.' })
  removeCertificate(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.homeService.removeCertificate(id);
  }

  // Previous Work endpoints
  @Post('previous-work/create')
  @ApiOperation({ summary: 'Create previous work' })
  @ApiResponse({
    status: 201,
    description: 'Previous work created successfully.',
    type: PreviousWork,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Previous work information with file uploads',
    type: CreatePreviousWorkDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 100 }], {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/home`,
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
  createPreviousWork(
    @Body() createPreviousWorkDto: CreatePreviousWorkDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<PreviousWork> {
    if (files['attachments']) {
      createPreviousWorkDto.attachments = files['attachments'].map(
        (file) => `/uploads/home/${file.filename}`,
      );
    }
    return this.homeService.createPreviousWork(createPreviousWorkDto);
  }

  @Get('previous-work')
  @ApiOperation({ summary: 'Get all previous works' })
  @ApiResponse({
    status: 200,
    description: 'List of all previous works.',
    type: [PreviousWork],
  })
  findAllPreviousWorks(): Promise<PreviousWork[]> {
    return this.homeService.findAllPreviousWorks();
  }

  @Get('previous-work/:id')
  @ApiOperation({ summary: 'Get previous work by ID' })
  @ApiParam({ name: 'id', description: 'Previous work ID' })
  @ApiResponse({
    status: 200,
    description: 'Previous work found.',
    type: PreviousWork,
  })
  @ApiResponse({ status: 404, description: 'Previous work not found.' })
  findOnePreviousWork(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PreviousWork> {
    return this.homeService.findOnePreviousWork(id);
  }

  @Patch('previous-work/:id')
  @ApiOperation({ summary: 'Update previous work' })
  @ApiParam({ name: 'id', description: 'Previous work ID' })
  @ApiResponse({
    status: 200,
    description: 'Previous work updated successfully.',
    type: PreviousWork,
  })
  @ApiResponse({ status: 404, description: 'Previous work not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated previous work information with file uploads',
    type: UpdatePreviousWorkDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 100 }], {
      storage: diskStorage({
        destination: `${config[process.env.NODE_ENV ?? 'development'].uploadPath}/home`,
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
  updatePreviousWork(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePreviousWorkDto: UpdatePreviousWorkDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<PreviousWork> {
    if (files['attachments']) {
      updatePreviousWorkDto.attachments = files['attachments'].map(
        (file) => `/uploads/home/${file.filename}`,
      );
    }
    return this.homeService.updatePreviousWork(id, updatePreviousWorkDto);
  }

  @Delete('previous-work/:id')
  @ApiOperation({ summary: 'Delete previous work' })
  @ApiParam({ name: 'id', description: 'Previous work ID' })
  @ApiResponse({
    status: 200,
    description: 'Previous work deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Previous work not found.' })
  removePreviousWork(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.homeService.removePreviousWork(id);
  }
}
