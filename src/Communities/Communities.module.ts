import { Module } from "@nestjs/common";
import { AuthModule } from "src/AuthModule/Auth.module";
import { DatabaseModule } from "src/Infrastructure/Database/Database.module";
import { UsersModule } from "src/Users/Users.module";
import { Communities } from "./Models/Communities.entity";
import { CommunitiesImages } from "./Models/CommunitiesImages.entity";
import { CommunitiesMedia } from "./Models/CommunitiesMedia.entity";
import { CommunitiesController } from "./Controllers/Communities.controller";
import { CommunitiesProfile } from "./Controllers/Communities.profile";
import { ICommunitiesServiceProvider } from "./Services/ICommunities.service";
import { NotificationModule } from "src/Infrastructure/Notification/NotificationModule";

@Module({
    imports:[
        DatabaseModule.forFeature([Communities,CommunitiesImages,CommunitiesMedia]),
        AuthModule,
        UsersModule,NotificationModule
    ],
    controllers:[CommunitiesController],
    providers:[ICommunitiesServiceProvider,CommunitiesProfile],
    exports: [ICommunitiesServiceProvider]
})
export class CommunitiesModule{}