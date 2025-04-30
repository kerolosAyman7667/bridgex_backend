import { TeamSearchId } from "src/Teams/Dtos/TeamSearchId";
import { IChannelService } from "src/Common/Channels/IChannel.service";
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";
import { TeamsChannelService } from "./TeamChannel.service";

export interface ITeamsChannelService extends IChannelService<TeamSearchId>{
    /**
     * Return all Achievements by team id
     * @param {string} teamId - The ID of the team
     * @returns {Promise<ChannelDto[]>} all team channel
     * @throws {NotFoundException} if team is not found 
     */
    GetByTeam(teamId: TeamSearchId): Promise<ChannelDto[]>;
} 

export const ITeamsChannelService = Symbol("ITeamsChannelService")


export const ITeamsChannelServiceProvider = {
    provide:ITeamsChannelService,
    useClass:TeamsChannelService
}