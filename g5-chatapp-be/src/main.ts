import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
<<<<<<< HEAD
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser'; // Import cookie-parser
import * as passport from 'passport';
=======
import { ResponseInterceptor } from './common/intercepters/response.intercepter';

>>>>>>> f923f0924b0d2a5e09debdfd3517d52621174a8d
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  app.use(cookieParser()); // Middleware để đọc cookies
  const config = new DocumentBuilder()
    .setTitle('API G5-ChatApp Documentation')
    .setDescription('The API description for G5-ChatApp project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.use(helmet());

  app.enableCors({
<<<<<<< HEAD
    origin: 'http://localhost:${port}',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credential: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(port ?? 3000);
=======
    origin: 'http://localhost:5173', // Chỉ chấp nhận từ frontend này
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép gửi cookie & header xác thực
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(process.env.PORT ?? 3000);
>>>>>>> f923f0924b0d2a5e09debdfd3517d52621174a8d
}
bootstrap();
