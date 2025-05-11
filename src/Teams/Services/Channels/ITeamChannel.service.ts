import { TeamSearchId } from "src/Teams/Dtos/TeamSearchId";
import { IChannelService } from "src/Common/Channels/IChannel.service";
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";
import { TeamsChannelService } from "./TeamChannel.service";
import { ChannelCreateDtoWithPublic } from "src/Common/Channels/Dtos/ChannelCreate.dto";

export interface ITeamsChannelService extends IChannelService<TeamSearchId>{
    /**
     * Return all Achievements by team id
     * @param {string} teamId - The ID of the team
     * @returns {Promise<ChannelDto[]>} all team channel
     * @throws {NotFoundException} if team is not found 
     */
    GetByTeam(teamId: TeamSearchId): Promise<ChannelDto[]>;

    /**
     * Add Channel
     * @param {TeamSearchId} searchId - The IDs
     * @param {ChannelCreateDtoWithPublic} dto
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<TeamChannelDto>} the created channel
     * @throws {NotFoundException}
    */
    AddChannel(searchId: TeamSearchId, dto: ChannelCreateDtoWithPublic, leaderId: string): Promise<ChannelDto>;


    /**
     * Add Channel
     * @param {TeamSearchId} searchId - The IDs
     * @param {string} channelId - The ID the channel
     * @param {ChannelCreateDtoWithPublic} dto
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise} 
     * @throws {NotFoundException}
    */
    UpdateChannel(searchId: TeamSearchId,channelId:string, dto: ChannelCreateDtoWithPublic, leaderId: string): Promise<void>;
} 

export const ITeamsChannelService = Symbol("ITeamsChannelService")


export const ITeamsChannelServiceProvider = {
    provide:ITeamsChannelService,
    useClass:TeamsChannelService
}