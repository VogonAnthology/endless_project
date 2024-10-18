import { Module } from '@nestjs/common';
import { OnetubeVideoModule } from './onetube-video/onetube-video.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import dbConfig from './config/db-dev.config';
import dbConfigProduction from './config/db-production.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { TaskSchedulerService } from './task-scheduler/task-scheduler.service';
import { ContestingVideoModule } from './contesting-video/contesting-video.module';
import { ContestsModule } from './contests/contests.module';
import { VoteModule } from './vote/vote.module';

@Module({
  imports: [
    OnetubeVideoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [dbConfig, dbConfigProduction],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get<MysqlConnectionOptions>('dbconfig.dev'),
        autoLoadEntities: true, // Ajoutez cette option ici
      }),
    }),
    AuthModule,
    UserModule,
    ContestingVideoModule,
    ContestsModule,
    VoteModule,
  ],
  providers: [TaskSchedulerService],
})
export class AppModule {}
