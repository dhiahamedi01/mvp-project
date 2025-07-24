import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeputyInfo } from './entities/deputy-info.entity';
import { Biography } from './entities/biography.entity';
import { Certificate } from './entities/certificate.entity';
import { PreviousWork } from './entities/previous-work.entity';
import { CreateDeputyInfoDto } from './dto/create-deputy-info.dto';
import { UpdateDeputyInfoDto } from './dto/update-deputy-info.dto';
import { CreateBiographyDto } from './dto/create-biography.dto';
import { UpdateBiographyDto } from './dto/update-biography.dto';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { CreatePreviousWorkDto } from './dto/create-previous-work.dto';
import { UpdatePreviousWorkDto } from './dto/update-previous-work.dto';
import { sampleDeputyData } from './dto/seed-data.dto';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(DeputyInfo)
    private deputyInfoRepository: Repository<DeputyInfo>,
    @InjectRepository(Biography)
    private biographyRepository: Repository<Biography>,
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(PreviousWork)
    private previousWorkRepository: Repository<PreviousWork>,
  ) {}

  async create(createDeputyInfoDto: CreateDeputyInfoDto): Promise<DeputyInfo> {
    const { ...deputyData } = createDeputyInfoDto;

    // Create deputy info
    const deputyInfo = this.deputyInfoRepository.create({
      ...deputyData,
    });
    const savedDeputyInfo = await this.deputyInfoRepository.save(deputyInfo);

    return this.findOne(savedDeputyInfo.id);
  }

  async findAll(): Promise<DeputyInfo[]> {
    return this.deputyInfoRepository.find({
      relations: ['biography', 'certificates', 'previousWorks'],
    });
  }

  async findOne(id: number): Promise<DeputyInfo> {
    const deputyInfo = await this.deputyInfoRepository.findOne({
      where: { id },
      relations: ['biography', 'certificates', 'previousWorks'],
    });

    if (!deputyInfo) {
      throw new NotFoundException(`Deputy info with ID ${id} not found`);
    }

    return deputyInfo;
  }

  async update(
    id: number,
    updateDeputyInfoDto: UpdateDeputyInfoDto,
  ): Promise<DeputyInfo> {
    const deputyInfo = await this.findOne(id);
    const { ...deputyData } = updateDeputyInfoDto;

    // Update deputy info basic data
    if (Object.keys(deputyData).length > 0) {
      await this.deputyInfoRepository.update(id, deputyData);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const deputyInfo = await this.findOne(id);
    await this.deputyInfoRepository.remove(deputyInfo);
  }

  async getDeputyProfile(): Promise<DeputyInfo> {
    const deputyInfos = await this.findAll();
    if (deputyInfos.length === 0) {
      throw new NotFoundException('No deputy profile found');
    }
    return deputyInfos[0]; // Return the first (and presumably only) deputy profile
  }

  async seedSampleData(): Promise<DeputyInfo> {
    // Check if data already exists
    const existingData = await this.findAll();
    if (existingData.length > 0) {
      return existingData[0];
    }

    // Create sample data
    return this.create(sampleDeputyData);
  }

  // Biography CRUD operations
  async createBiography(
    createBiographyDto: CreateBiographyDto,
  ): Promise<Biography> {
    const { deputyInfoId, ...biographyData } = createBiographyDto;

    if (deputyInfoId) {
      const deputyInfo = await this.findOne(deputyInfoId);
      const biography = this.biographyRepository.create({
        ...biographyData,
        deputyInfo,
      });
      return this.biographyRepository.save(biography);
    }

    const biography = this.biographyRepository.create(biographyData);
    return this.biographyRepository.save(biography);
  }

  async findAllBiographies(): Promise<Biography[]> {
    return this.biographyRepository.find({ relations: ['deputyInfo'] });
  }

  async findOneBiography(id: number): Promise<Biography> {
    const biography = await this.biographyRepository.findOne({
      where: { id },
      relations: ['deputyInfo'],
    });

    if (!biography) {
      throw new NotFoundException(`Biography with ID ${id} not found`);
    }

    return biography;
  }

  async updateBiography(
    id: number,
    updateBiographyDto: UpdateBiographyDto,
  ): Promise<Biography> {
    await this.findOneBiography(id);
    await this.biographyRepository.update(id, updateBiographyDto);
    return this.findOneBiography(id);
  }

  async removeBiography(id: number): Promise<void> {
    const biography = await this.findOneBiography(id);
    await this.biographyRepository.remove(biography);
  }

  // Certificate CRUD operations
  async createCertificate(
    createCertificateDto: CreateCertificateDto,
  ): Promise<Certificate> {
    const { deputyInfoId, ...certificateData } = createCertificateDto;

    if (deputyInfoId) {
      const deputyInfo = await this.findOne(deputyInfoId);
      const certificate = this.certificateRepository.create({
        ...certificateData,
        deputyInfo,
      });
      return this.certificateRepository.save(certificate);
    }

    const certificate = this.certificateRepository.create(certificateData);
    return this.certificateRepository.save(certificate);
  }

  async findAllCertificates(): Promise<Certificate[]> {
    return this.certificateRepository.find({ relations: ['deputyInfo'] });
  }

  async findOneCertificate(id: number): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: ['deputyInfo'],
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    return certificate;
  }

  async updateCertificate(
    id: number,
    updateCertificateDto: UpdateCertificateDto,
  ): Promise<Certificate> {
    await this.findOneCertificate(id);
    await this.certificateRepository.update(id, updateCertificateDto);
    return this.findOneCertificate(id);
  }

  async removeCertificate(id: number): Promise<void> {
    const certificate = await this.findOneCertificate(id);
    await this.certificateRepository.remove(certificate);
  }

  // PreviousWork CRUD operations
  async createPreviousWork(
    createPreviousWorkDto: CreatePreviousWorkDto,
  ): Promise<PreviousWork> {
    const { deputyInfoId, ...previousWorkData } = createPreviousWorkDto;

    if (deputyInfoId) {
      const deputyInfo = await this.findOne(deputyInfoId);
      const previousWork = this.previousWorkRepository.create({
        ...previousWorkData,
        deputyInfo,
      });
      return this.previousWorkRepository.save(previousWork);
    }

    const previousWork = this.previousWorkRepository.create(previousWorkData);
    return this.previousWorkRepository.save(previousWork);
  }

  async findAllPreviousWorks(): Promise<PreviousWork[]> {
    return this.previousWorkRepository.find({ relations: ['deputyInfo'] });
  }

  async findOnePreviousWork(id: number): Promise<PreviousWork> {
    const previousWork = await this.previousWorkRepository.findOne({
      where: { id },
      relations: ['deputyInfo'],
    });

    if (!previousWork) {
      throw new NotFoundException(`Previous work with ID ${id} not found`);
    }

    return previousWork;
  }

  async updatePreviousWork(
    id: number,
    updatePreviousWorkDto: UpdatePreviousWorkDto,
  ): Promise<PreviousWork> {
    await this.findOnePreviousWork(id);
    await this.previousWorkRepository.update(id, updatePreviousWorkDto);
    return this.findOnePreviousWork(id);
  }

  async removePreviousWork(id: number): Promise<void> {
    const previousWork = await this.findOnePreviousWork(id);
    await this.previousWorkRepository.remove(previousWork);
  }
}
