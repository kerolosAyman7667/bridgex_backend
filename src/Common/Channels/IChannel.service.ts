import { ChannelDto } from "./Dtos/Channel.dto";
import { ChannelCreateDto } from "./Dtos/ChannelCreate.dto";
import { PaginationResponce } from "../Pagination/PaginationResponce.dto";
import { MessagesDto } from "./Dtos/Messages.dto";
import { CreateMessageDto } from "./Dtos/CreateMessage.dto";
import { ThreadDto } from "./Dtos/Thread.dto";

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
     * Add Channel
     * @param {T} searchId - The IDs
     * @param {string} channelId - The ID the channel
     * @param {ChannelCreateDto} dto
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<void>} 
     * @throws {NotFoundException}
    */
    UpdateChannel(searchId: T,channelId:string, dto: ChannelCreateDto, leaderId: string): Promise<void>;

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
     * 
     * @param channelIds 
     */
    GetChannels(channelIds:string[]) : Promise<ChannelDto[]>

    
    /**
     * @param {string} channelId
     * @param {string} threadId
     * @param {number} page
     * @returns {Promise<TeamChannelDto[]>} all team channel
     * @throws {NotFoundException} if team is not found 
     */
    GetChats(channelId: string,userId:string,page:number,threadId?:string,afterDate?:Date,beforeDare?:Date): Promise<PaginationResponce<MessagesDto>>;

    /**
     * 
     * @param channelId 
     * @param searchId 
     * @param userId 
     * @param message 
     */
    AddMessage(channelId: string,userId:string,dto:CreateMessageDto):Promise<MessagesDto>

    /**
     * 
     * @param channelId 
     * @param userId 
     * @param messageId 
     */
    CreateThread(channelId: string,userId:string,messageId:string):Promise<ThreadDto>

    /**
     * 
     * @param channelId 
     * @param userId 
     * @param page
     */
    GetThreads(channelId: string,userId:string,page:number):Promise<PaginationResponce<ThreadDto>>
    
    /**
     * 
     * @param channelId 
     * @param messageId 
     * @param userId 
     */
    DeleteMessage(channelId: string,messageId:string,userId:string):Promise<MessagesDto>

    /**
     * 
     * @param channelId 
     * @param searchId 
     */
    IsChannelExist(channelId: string,searchId: T) : Promise<boolean>

    /**
     * 
     * @param channelId 
     * @param searchId 
     * @param userId 
     */
    CanAccess(channelId: string,searchId: T,userId:string): Promise<boolean>
} 