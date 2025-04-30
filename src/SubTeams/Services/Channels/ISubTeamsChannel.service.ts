import { IChannelService } from "src/Common/Channels/IChannel.service";
import { SubTeamSearchId } from "src/SubTeams/Dtos/SubTeamSearchId";
import { SubTeamsChannelService } from "./SubTeamsChannel.service";
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";

export interface ISubTeamsChannelService extends IChannelService<SubTeamSearchId> 
{
    GetChannelsBySubTeam(searchId:SubTeamSearchId) : Promise<ChannelDto[]>
} 

export const ISubTeamsChannelService = Symbol("ISubTeamsChannelService")


export const ISubTeamsChannelServiceProvider = {
    provide:ISubTeamsChannelService,
    useClass:SubTeamsChannelService
}