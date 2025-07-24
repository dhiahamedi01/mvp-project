import { PartialType } from '@nestjs/swagger';
import { CreateDeputyInfoDto } from './create-deputy-info.dto';

export class UpdateDeputyInfoDto extends PartialType(CreateDeputyInfoDto) {}