/* eslint-disable @typescript-eslint/no-unused-vars */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigModule } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { RolesGuard } from './auth/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  ConfigModule.forRoot();
  const app = await NestFactory.create(AppModule);
  const port = 3000;

  // app.useGlobalGuards(new JwtAuthGuard());

  // Apply RolesGuard globally
  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new RolesGuard(reflector));

  // Configure Swagger options
  const config = new DocumentBuilder()
    .setTitle('PlagiarismAI API Documentation')
    .setDescription('The API description for PlagiarismAI')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI
  SwaggerModule.setup('api-docs', app, document);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      'https://assessment-system-frontend.onrender.com',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(port, () => console.log(`running on port ${port}`));
}
bootstrap();
