import { EntityBase } from "src/Common/EntityBase";
import { AutoMap } from "@automapper/classes";
import { SubTeamImages } from "./SubTeamImages.entity";
import { SubTeamsMedia } from "./SubTeamsMedia.entity";
import { SubTeamsConstants } from "../SubTeamsConstants";
import { Communities } from "src/Communities/Models/Communities.entity";
import { Users } from "src/Users/Models/Users.entity";
import { SubTeamChannels } from "./SubTeamChannels.entity";
import { Teams } from "src/Teams/Models/Teams.entity";
import { SubTeamMembers } from "./SubTeamMembers.entity";
import { LearningPhaseSections } from "./LearningPhase/LearningPhaseSections.entity";

export class SubTeams extends EntityBase {

    @AutoMap()
    Name!: string

    @AutoMap()
    Desc: string

    @AutoMap()
    DescShort: string

    @AutoMap()
    Vision: string

    @AutoMap()
    Logo: string = SubTeamsConstants.DefaultLogo

    @AutoMap()
    JoinLink?: string

    @AutoMap()
    LearningPhaseTitle: string

    @AutoMap()
    LearningPhaseDesc?: string

    @AutoMap()
    CommunityId!:string

    @AutoMap(()=> Communities)
    Community?: Communities

    @AutoMap()
    TeamId!:string

    KnowledgeBaseId:string

    @AutoMap(()=> Teams)
    Team?: Teams

    @AutoMap(() => [SubTeamImages])
    Images?: SubTeamImages[]

    @AutoMap(() => [SubTeamsMedia])
    MediaLinks?: SubTeamsMedia[]

    @AutoMap(() => [SubTeamChannels])
    Channels?: SubTeamChannels[]
    
    @AutoMap(() => [SubTeamMembers])
    Members?: SubTeamMembers[]

    @AutoMap(() => [LearningPhaseSections])
    LearningPhaseSections?: LearningPhaseSections[]
}