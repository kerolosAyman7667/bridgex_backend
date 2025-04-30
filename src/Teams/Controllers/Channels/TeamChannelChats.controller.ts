import { Controller, Inject } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { ChatsController } from "src/Common/Channels/ChatsController"
import { IChannelService } from "src/Common/Channels/IChannel.service"
import { TeamSearchId } from "src/Teams/Dtos/TeamSearchId"
import { ITeamsChannelService } from "src/Teams/Services/Channels/ITeamChannel.service"

@ApiTags('teams/channels/chats')
@Controller('teams/channels')
export class TeamChannelChatsController extends ChatsController<TeamSearchId>
{


    constructor
    (
        @Inject(ITeamsChannelService)
        protected readonly channelsService:IChannelService<TeamSearchId>
    )
    {
        super(channelsService)
    }
}