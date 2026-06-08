import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from '../challenges/challenge.entity';
import { MonitorController } from './monitor.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Challenge])],
    controllers: [MonitorController],
})

export class MonitorModule { }
