import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.use(helmet());
    app.setGlobalPrefix('api');

    const frontendUrl = configService.get<string>('FRONTEND_URL');
    if (frontendUrl) {
        app.enableCors({ origin: frontendUrl });
    } else {
        console.warn('FRONTEND_URL is not set - CORS will be disabled');
    }

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const swaggerConfig = new DocumentBuilder()
        .setTitle('R U Who, Man?')
        .setDescription('Check if someone is a human or not with a one time test')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(configService.get<number>('PORT', 3001));
}
void bootstrap();
