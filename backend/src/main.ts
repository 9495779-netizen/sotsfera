import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('port') || 3000;
  const env = config.get<string>('nodeEnv');

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: env === 'production' ? config.get<string>('appUrl') : true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger только не в production
  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ОТ-Сервис API')
      .setDescription('API SaaS-платформы автоматизации охраны труда')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Аутентификация')
      .addTag('employees', 'Сотрудники')
      .addTag('briefings', 'Инструктажи')
      .addTag('medical', 'Медосмотры')
      .addTag('training', 'Обучение')
      .addTag('orders', 'Приказы')
      .addTag('documents', 'Документы')
      .addTag('analytics', 'Аналитика')
      .addTag('organizations', 'Организации')
      .addTag('admin', 'Администрирование')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  console.log(`🚀 Server running on port ${port} [${env}]`);
}

bootstrap().catch(console.error);
