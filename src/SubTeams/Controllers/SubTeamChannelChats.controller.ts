import { Controller, Inject } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { ISubTeamsChannelService } from "../Services/Channels/ISubTeamsChannel.service"
import { IChannelService } from "src/Common/Channels/IChannel.service"
import { SubTeamSearchId } from "../Dtos/SubTeamSearchId"
import { ChatsController } from "src/Common/Channels/ChatsController"

@ApiTags('subteams/channels/chats')
@Controller('subteams/channels')
export class SubTeamChannelChatsController extends ChatsController<SubTeamSearchId>
{
    constructor
    (
        @Inject(ISubTeamsChannelService)
        protected readonly channelsService:IChannelService<SubTeamSearchId>
    )
    {
        super(channelsService)
    }
    

}