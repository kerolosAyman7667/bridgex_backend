import { IChannelService } from "src/Common/Channels/IChannel.service";
import { SubTeamSearchId } from "src/SubTeams/Dtos/SubTeamSearchId";
import { SubTeamsChannelService } from "./SubTeamsChannel.service";
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";
import { SubTeamChannels } from "src/SubTeams/Models/SubTeamChannels.entity";

export interface ISubTeamsChannelService extends IChannelService<SubTeamSearchId> 
{
    GetChannelsBySubTeam(searchId:SubTeamSearchId) : Promise<ChannelDto[]>

    GetChannelById(channelId: string): Promise<SubTeamChannels>;
} 

export const ISubTeamsChannelService = Symbol("ISubTeamsChannelService")


export const ISubTeamsChannelServiceProvider = {
    provide:ISubTeamsChannelService,
    useClass:SubTeamsChannelService
}