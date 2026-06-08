import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { Challenge } from './challenges/challenge.entity';
import { HealthController } from './health.controller';
import { ChallengesModule } from './challenges/challenges.module';
import { MonitorModule } from './monitor/monitor.module';
import { CleanupService } from './tasks/cleanup.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
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
        TypeOrmModule.forFeature([Challenge]),
        ChallengesModule,
        MonitorModule,
    ],
    controllers: [HealthController],
    providers: [
        CleanupService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
