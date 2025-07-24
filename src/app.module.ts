import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';

import { ServiceModule } from './service/service.module';
import { ServiceCategoryModule } from './service-category/service-category.module';
import { RequestModule } from './request/request.module';
import { ComplaintModule } from './complaint/complaint.module';
import { ImageModule } from './image/image.module';
import { PostModule } from './post/post.module';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/typeorm';
import { HomeModule } from './home/home.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UserModule,
    ServiceModule,
    ServiceCategoryModule,
    RequestModule,
    ComplaintModule,
    ImageModule,
    PostModule,
    HomeModule,
    NotificationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
