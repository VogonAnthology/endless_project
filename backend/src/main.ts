import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:4200', // Specify the frontend origin
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, // Allow cookies to be sent if needed
  });
  await app.listen(3000);
}
bootstrap();
