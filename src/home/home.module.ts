import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { DeputyInfo } from './entities/deputy-info.entity';
import { Biography } from './entities/biography.entity';
import { Certificate } from './entities/certificate.entity';
import { PreviousWork } from './entities/previous-work.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeputyInfo,
      Biography,
      Certificate,
      PreviousWork,
    ]),
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
