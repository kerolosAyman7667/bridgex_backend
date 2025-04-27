import { ChannelDto } from "./Dtos/Channel.dto";
import { ChannelCreateDto } from "./Dtos/ChannelCreate.dto";
import { PaginationResponce } from "../Pagination/PaginationResponce.dto";
import { MessagesDto } from "./Dtos/Messages.dto";

export interface IChannelService<T> {
    /**
     * Add Channel
     * @param {T} searchId - The IDs
     * @param {ChannelCreateDto} dto
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<TeamChannelDto>} the created channel
     * @throws {NotFoundException}
    */
    AddChannel(searchId: T, dto: ChannelCreateDto, leaderId: string): Promise<ChannelDto>;


    /**
     * Delete Channel
     * @param {T} searchId - The ID
     * @param {string} channelId - The ID of the channel to delete
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<void>} 
     * @throws {NotFoundException} if image is not found or if user is not the community leader
    */
    DeleteChannel(searchId: T, channelId: string, leaderId: string): Promise<void>;

    
    /**
     * @param {T} searchId - The ID
     * @param {string} channelId
     * @returns {Promise<TeamChannelDto[]>} all team channel
     * @throws {NotFoundException} if team is not found 
     */
    GetChats(channelId: string,searchId: T): Promise<PaginationResponce<ChannelDto>>;

    /**
     * 
     * @param channelId 
     * @param searchId 
     * @param userId 
     * @param message 
     */
    AddMessage(channelId: string,searchId: T,userId:string,message:string):Promise<MessagesDto>
} 