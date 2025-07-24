import { config } from 'dotenv';
import configM from './config';

config({
  path: configM[process.env.NODE_ENV ?? 'development'].envFilePath,
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(cookieParser());

  // Enable global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  const maxRequestSize = process.env.MAX_REQUEST_SIZE
    ? `${process.env.MAX_REQUEST_SIZE}mb`
    : '100mb';

  app.use(bodyParser.urlencoded({ limit: maxRequestSize, extended: true }));
  app.use(bodyParser.json({ limit: maxRequestSize }));

  const config = new DocumentBuilder()
    .setTitle('MVP Project')
    .setDescription('The MVP Project API description')
    .setVersion('1.0')
    .addTag('MVP')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
