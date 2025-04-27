import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './Infrastructure/Database/Database.module';
import { UsersModule } from './Users/Users.module';
import { CacheModule } from './Infrastructure/Cache/Cache.module';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { NotificationModule } from './Infrastructure/Notification/NotificationModule';
import { EventsModule } from './Infrastructure/Events/Events.module';
import { FileModule } from './Common/FileUpload/File.Module';
import { CommunitiesModule } from './Communities/Communities.module';
import { TeamsModule } from './Teams/Teams.module';
import { AppController } from './App.controller';
import { SubTeamsModule } from './SubTeams/SubTeams.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import {join} from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files'),
      exclude: ['/api/assets/learning/*','/api/profile/images/*'], 
      serveRoot:"/api/assets"
    }),
    FileModule,
    LoggerModule,
    DatabaseModule,
    CacheModule,
    UsersModule,
    NotificationModule,
    EventsModule,
    CommunitiesModule,
    TeamsModule,
    SubTeamsModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
