import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips any property not in the DTO
      forbidNonWhitelisted: true, // throws error if extra properties are present
      transform: true, // auto-transform payloads to DTO class instances
      transformOptions: {
        enableImplicitConversion: true, // allow implicit type conversion
      },
    })
  );
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
