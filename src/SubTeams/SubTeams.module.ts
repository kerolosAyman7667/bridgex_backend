import { forwardRef, Module } from "@nestjs/common";
import { DatabaseModule } from "src/Infrastructure/Database/Database.module";
import { SubTeams } from "./Models/SubTeams.entity";
import { SubTeamsMedia } from "./Models/SubTeamsMedia.entity";
import { SubTeamImages } from "./Models/SubTeamImages.entity";
import { SubTeamChannelChats } from "./Models/SubTeamChannelChats.entity";
import { SubTeamChannels } from "./Models/SubTeamChannels.entity";
import { ISubTeamsServiceProvider } from "./Services/SubTeams/ISubTeams.service";
import { UsersModule } from "src/Users/Users.module";
import { SubTeamMembers } from "./Models/SubTeamMembers.entity";
import { ISubTeamsMembersServiceProvider } from "./Services/Members/ISubTeamMembers.service";
import { SubTeamsController } from "./Controllers/SubTeams.controller";
import { TeamsModule } from "src/Teams/Teams.module";
import { SubTeamsProfile } from "./Controllers/SubTeams.profile";
import { SubTeamImagesGet } from "./Controllers/SubTeamImagesGet.controller";
import { SubTeamMembersController } from "./Controllers/SubTeamMembers.controller";
import { LearningPhaseResources } from "./Models/LearningPhase/LearningPhaseResources.entity";
import { LearningPhaseSections } from "./Models/LearningPhase/LearningPhaseSections.entity";
import { LearningPhaseVideos } from "./Models/LearningPhase/LearningPhaseVideos.entity";
import { UserProgress } from "./Models/LearningPhase/UserProgress.entity";
import { ILearningPhaseServiceProvider } from "./Services/LearningPhase/ILearningPhase.service";
import { LearningPhaseController } from "./Controllers/LearningPhase.controller";
import { AIModule } from "src/AIModule/AI.module";
import { ISubTeamsChannelServiceProvider } from "./Services/Channels/ISubTeamsChannel.service";
import { SubTeamChannelController } from "./Controllers/SubTeamChannel.controller";
import { SubTeamChannelChatsController } from "./Controllers/SubTeamChannelChats.controller";
import { EventsModule } from "src/Infrastructure/Events/Events.module";
import { NotificationModule } from "src/Infrastructure/Notification/NotificationModule";
import { LearningPhaseChat } from "./Models/LearningPhase/LearningPhaseChat.entity";

@Module({
    imports:[
       DatabaseModule.forFeature([SubTeams,SubTeamsMedia,SubTeamImages,SubTeamMembers,SubTeamChannelChats,SubTeamChannels,
        LearningPhaseSections,LearningPhaseResources,LearningPhaseVideos,UserProgress,LearningPhaseChat
       ]),
       UsersModule,TeamsModule,AIModule,EventsModule,NotificationModule
    ],
    controllers:[SubTeamsController, SubTeamImagesGet, SubTeamMembersController, LearningPhaseController,SubTeamChannelController,SubTeamChannelChatsController],
    providers:[ISubTeamsServiceProvider,ISubTeamsMembersServiceProvider,ILearningPhaseServiceProvider,SubTeamsProfile,ISubTeamsChannelServiceProvider],
    exports:[ISubTeamsMembersServiceProvider]
})
export class SubTeamsModule{}