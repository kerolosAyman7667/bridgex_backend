import { forwardRef, Module } from "@nestjs/common";
import { DatabaseModule } from "src/Infrastructure/Database/Database.module";
import { Teams } from "./Models/Teams.entity";
import { TeamsMedia } from "./Models/TeamsMedia.entity";
import { TeamImages } from "./Models/TeamImages.entity";
import { TeamLeaders } from "./Models/TeamLeaders.entity";
import { TeamAchievements } from "./Models/TeamAchievements.entity";
import { TeamChannelChats } from "./Models/TeamChannelChats.entity";
import { TeamChannels } from "./Models/TeamChannels.entity";
import { TeamsController } from "./Controllers/Teams.controller";
import { ITeamsServiceProvider } from "./Services/ITeams.service";
import { ITeamsAchievementServiceProvider } from "./Services/ITeamAchievement.service";
import { CommunitiesModule } from "src/Communities/Communities.module";
import { UsersModule } from "src/Users/Users.module";
import { TeamsProfile } from "./Controllers/Team.profile";
import { TeamImagesGet } from "./Controllers/TeamImagesGet.controller";
import { TeamAchievementController } from "./Controllers/TeamAchievement.controller";
import { ITeamsChannelServiceProvider } from "./Services/Channels/ITeamChannel.service";
import { TeamChannelChatsController } from "./Controllers/Channels/TeamChannelChats.controller";
import { TeamChannelController } from "./Controllers/Channels/TeamChannel.controller";
import { SubTeamsModule } from "src/SubTeams/SubTeams.module";
import { EventsModule } from "src/Infrastructure/Events/Events.module";
import { NotificationModule } from "src/Infrastructure/Notification/NotificationModule";

@Module({
    imports:[
       DatabaseModule.forFeature([Teams,TeamsMedia,TeamImages,TeamLeaders,TeamAchievements,TeamChannels,TeamChannelChats]),
       CommunitiesModule,UsersModule,forwardRef(() => SubTeamsModule),EventsModule,NotificationModule
    ],
    controllers:[TeamsController,TeamAchievementController,TeamImagesGet,TeamChannelController,TeamChannelChatsController],
    providers:[ITeamsServiceProvider,ITeamsAchievementServiceProvider,TeamsProfile,ITeamsChannelServiceProvider],
    exports:[ITeamsServiceProvider]
})
export class TeamsModule{}