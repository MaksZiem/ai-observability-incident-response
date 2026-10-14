import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/log.entity.js';
import { LogsService } from './logs.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
