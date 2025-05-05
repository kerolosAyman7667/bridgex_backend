import { AutoMap } from "@automapper/classes";
import { EntityBase } from "src/Common/EntityBase";
import { SubTeams } from "../SubTeams.entity";
import { ChatResponseDto } from "src/AIModule/Dtos/ChatResponse.dto";
import { Users } from "src/Users/Models/Users.entity";

export class LearningPhaseChat extends EntityBase {
    @AutoMap()
    message!: string

    @AutoMap()
    response!: ChatResponseDto

    @AutoMap()
    SubTeamId!: string

    @AutoMap(() => SubTeams)
    SubTeam?: SubTeams

    @AutoMap()
    UserId: string

    @AutoMap(() => Users)
    User?: Users
}