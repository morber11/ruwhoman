import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ChallengesModule } from './challenges/challenges.module';
import { MonitorModule } from './monitor/monitor.module';

@Module({
    imports: [
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 10 }] }),
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                url: config.get<string>('DATABASE_URL'),
                autoLoadEntities: true,
                synchronize: false,
            }),
            inject: [ConfigService],
        }),
        ChallengesModule,
        MonitorModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})

export class AppModule { }
