import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";
import { ChannelCreateDto } from "src/Common/Channels/Dtos/ChannelCreate.dto";
import { MessagesDto } from "src/Common/Channels/Dtos/Messages.dto";
import { PaginationResponce } from "src/Common/Pagination/PaginationResponce.dto";
import { SubTeamSearchId } from "src/SubTeams/Dtos/SubTeamSearchId";
import { ISubTeamsChannelService } from "./ISubTeamsChannel.service";
import { SubTeamChannels } from "src/SubTeams/Models/SubTeamChannels.entity";
import { SubTeamChannelChats } from "src/SubTeams/Models/SubTeamChannelChats.entity";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { GenericRepo } from "src/Infrastructure/Database/Repos/GenericRepo";
import { ISubTeamsMembersService } from "../Members/ISubTeamMembers.service";
import { ISubTeamsService } from "../SubTeams/ISubTeams.service";
import { In, IsNull, LessThanOrEqual, MoreThanOrEqual, Raw } from "typeorm";
import { ChatsPaginationDto } from "src/Common/Channels/Dtos/ChatsPagination.dto";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { UsersService } from "src/Users/Services/Users.service";
import { CreateMessageDto } from "src/Common/Channels/Dtos/CreateMessage.dto";
import { randomBytes } from "crypto";
import { ThreadDto } from "src/Common/Channels/Dtos/Thread.dto";
import Redis from "ioredis";
import { RedisProvidersEnum, RedisProvidersSubs } from "src/Infrastructure/Events/EventConfig/RedisProviders";
import { SentMessageChatDto, ThreadChatDto } from "src/Chat/Dtos/SentMessageChat.dto";

@Injectable({scope:Scope.REQUEST})
export class SubTeamsChannelService implements ISubTeamsChannelService {

    @Inject(`REPO_${SubTeamChannels.name.toUpperCase()}`)
    private readonly channelsRepo: GenericRepo<SubTeamChannels>;

    @Inject(`REPO_${SubTeamChannelChats.name.toUpperCase()}`)
    private readonly channelsChatsRepo: GenericRepo<SubTeamChannelChats>;

    @Inject(ISubTeamsMembersService)
    private readonly membersService: ISubTeamsMembersService;

    @Inject(ISubTeamsService)
    private readonly subTeamService: ISubTeamsService;
    
    @InjectMapper()
    private readonly mapper: Mapper

    @Inject(UsersService)
    private readonly userService: UsersService

    @Inject(RedisProvidersEnum.PUB) 
    private readonly redisPubClient: Redis;

    
    async GetChannelsBySubTeam(searchId: SubTeamSearchId): Promise<ChannelDto[]> 
    {
        const subTeam = await this.subTeamService.GetSubTeamById(searchId.subTeamId)
        const data = await this.channelsRepo.FindAll({SubTeamId:subTeam.Id});

        return await this.mapper.mapArrayAsync(data,SubTeamChannels,ChannelDto)
    }

    async GetChannels(channelIds: string[]): Promise<ChannelDto[]> {
        const data = await this.channelsRepo.FindAll({Id:In(channelIds)});
        return await this.mapper.mapArrayAsync(data,SubTeamChannels,ChannelDto);
    }

    async AddChannel(searchId: SubTeamSearchId, dto: ChannelCreateDto, leaderId: string): Promise<ChannelDto> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchId.subTeamId, leaderId);
        const isExistChannel = await this.channelsRepo.FindAll(
            { Name: Raw(alias => `LOWER(${alias}) = LOWER(:name)`, { name: dto.Name.toLowerCase() }), SubTeamId: subTeam.Id },
        );

        if(isExistChannel.length > 0)
        {
            throw new ConflictException("There is a channel exist with same name");
        }
        const channel = new SubTeamChannels();
        channel.Name = dto.Name
        channel.SubTeamId = subTeam.Id
        await this.channelsRepo.Insert(channel)

        const returnChannel = new ChannelDto();
        returnChannel.Name = channel.Name
        returnChannel.Id = channel.Id
        returnChannel.CreatedAt = channel.CreatedAt

        return returnChannel
    }

    async UpdateChannel(searchId: SubTeamSearchId, channelId: string, dto: ChannelCreateDto, leaderId: string): Promise<void> 
    {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchId.subTeamId, leaderId);
        const channel = await this.channelsRepo.FindOne({Id:channelId,SubTeamId:subTeam.Id})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }

        const isExistChannel = await this.channelsRepo.FindAll(
            { Name: Raw(alias => `LOWER(${alias}) = LOWER(:name)`, { name: dto.Name.toLowerCase() }), SubTeamId: subTeam.Id },
        );
        if(isExistChannel.length > 0)
        {
            throw new ConflictException("There is a channel exist with same name");
        }
        channel.Name = dto.Name
        await this.channelsRepo.Update(channel.Id,channel);
    }

    async DeleteChannel(searchId: SubTeamSearchId, channelId: string, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchId.subTeamId, leaderId);
        const channel = await this.channelsRepo.FindOne({Id:channelId,SubTeamId:subTeam.Id})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }
        await this.channelsRepo.Delete(channel.Id);
    }

    async GetChats(channelId: string, userId: string,page:number,threadId?:string,afterDate?:Date,beforeDare?:Date): Promise<PaginationResponce<MessagesDto>> {
        const channel = await this.channelsRepo.FindOne({Id:channelId})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }
        const isMember = await this.membersService.IsMemberExist(channel.SubTeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Channel not found")
        }
        const pagination =  new ChatsPaginationDto()
        pagination.Page = page;

        const timeSearch = {
            ...(afterDate ? {CreatedAt:MoreThanOrEqual(afterDate)} : {}),
            ...(beforeDare ? {CreatedAt:LessThanOrEqual(beforeDare)} : {})
        }
        const chatSearch = threadId ? 
        {
            ChannelId:channel.Id,
            ThreadId:threadId,
            ...timeSearch
        } 
        :
        [
            {
                ChannelId:channel.Id,
                ThreadStart:true,
                ...timeSearch
            },
            {
                ChannelId:channel.Id,
                ThreadId:IsNull(),
                ...timeSearch
            }
        ]

        const chats:PaginationResponce<SubTeamChannelChats> = await this.channelsChatsRepo.FindAllPaginated(
            chatSearch,
            {
                User:true,
                ReplyTo:{User:true}
            },pagination)
        return new PaginationResponce(
            await this.mapper.mapArrayAsync(chats.Data,SubTeamChannelChats,MessagesDto),
            chats.Count
        )
    }

    async CreateThread(channelId: string, userId: string, messageId: string): Promise<ThreadDto> 
    {
        const channel = await this.channelsRepo.FindOne({Id:channelId})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }
        const isMember = await this.membersService.IsMemberExist(channel.SubTeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Channel not found")
        }
        const message:SubTeamChannelChats = await this.channelsChatsRepo.FindOne(
            {
                ChannelId:channel.Id,
                Id:messageId,
                Deleted:false
            }
        )
        if(!message)
        {
            throw new NotFoundException("Message not found");
        }
        if(message.ThreadId)
        {
            throw new BadRequestException("This message already in thread");
        }
        message.ThreadStart = true
        message.ThreadId = randomBytes(16).toString("hex");
        await this.channelsChatsRepo.Update(message.Id, message);
        const returnThread = new ThreadDto(message.Message,message.ThreadId)

        const threadEvent = new ThreadChatDto()
        threadEvent.ChannelId = message.ChannelId
        threadEvent.ThreadId = returnThread.Id
        threadEvent.Thread = returnThread

        this.redisPubClient.publish(RedisProvidersSubs.NEWTHREAD, JSON.stringify(threadEvent));

        return returnThread
    }

    async GetThreads(channelId: string, userId: string,page:number): Promise<PaginationResponce<ThreadDto>> 
    {
        const channel = await this.channelsRepo.FindOne({Id:channelId})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }
        const isMember = await this.membersService.IsMemberExist(channel.SubTeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Channel not found")
        }

        const pagination =  new ChatsPaginationDto()
        pagination.Page = page;
        const data = await this.channelsChatsRepo.FindAllPaginated({ThreadStart:true,ChannelId:channel.Id},{},pagination)
        const dtos = data.Data.map(x=> new ThreadDto(x.Text,x.ThreadId));
        return new PaginationResponce(dtos,data.Count);
    }

    async AddMessage(channelId: string, userId: string, dto: CreateMessageDto): Promise<MessagesDto> {
        const user = await this.userService.FindById(userId,true);
        const channel = await this.channelsRepo.FindOne({Id:channelId})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }
        const isMember = await this.membersService.IsMemberExist(channel.SubTeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Channel not found")
        }

        const chat = new SubTeamChannelChats();
        chat.ChannelId = channel.Id;
        chat.Text = dto.Message;
        chat.UserId = user.Id;
        if(dto.ReplyToId)
        {
            const chatSearch = dto.ThreadId ? 
            {
                ChannelId:channel.Id,
                ThreadId:dto.ThreadId,
                Id:dto.ReplyToId,
                Deleted:false
            } 
            :
            [
                {
                    ChannelId:channel.Id,
                    ThreadStart:true,
                    Id:dto.ReplyToId,
                    Deleted:false
                },
                {
                    ChannelId:channel.Id,
                    ThreadId:IsNull(),
                    Id:dto.ReplyToId,
                    Deleted:false
                }
            ]

            const messageExist = await this.channelsChatsRepo.FindOne(chatSearch,{User:true})
            if(!messageExist)
            {
                throw new NotFoundException("Cant replying to non existing message")
            }
            chat.ReplyToId = messageExist.Id;
            chat.ReplyTo = messageExist
        }
        if(dto.ThreadId)
        {
            const existingThread = await this.channelsChatsRepo.FindOne({ThreadId:dto.ThreadId,ThreadStart:true})
            if(!existingThread)
            {
                throw new NotFoundException("Cant chat to non existing thread")
            }
            chat.ThreadId = dto.ThreadId;
        }

        const chatDb = await this.channelsChatsRepo.Insert(chat)
        chat.User = user;

        const eventMessage = new SentMessageChatDto()
        eventMessage.ChannelId = channel.Id
        eventMessage.ThreadId = chat.ThreadId
        eventMessage.Message = await this.mapper.mapAsync(chat,SubTeamChannelChats,MessagesDto)
        eventMessage.Message.CreatedAt = chatDb.CreatedAt;

        this.redisPubClient.publish(RedisProvidersSubs.CHAT, JSON.stringify(eventMessage));

        return eventMessage.Message
    }

    async DeleteMessage(channelId: string, messageId: string, userId: string): Promise<MessagesDto> {
        const user = await this.userService.FindById(userId,true);
        const channel = await this.channelsRepo.FindOne({Id:channelId})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }
        const isMember = await this.membersService.IsMemberExist(channel.SubTeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Channel not found")
        }
        const message:SubTeamChannelChats = await this.channelsChatsRepo.FindOne(
            {
                ChannelId:channel.Id,
                ...(isMember.IsLeader ? {} : {UserId:user.Id}),
                Id:messageId,
                Deleted:false
            }
        )
        if(!message)
        {
            throw new NotFoundException("Message not found");
        }
        message.Deleted = true
        const updatedMessage = await this.channelsChatsRepo.Update(message.Id,message,{ReplyTo:{User:true}})
        updatedMessage.User = user;

        const eventMessage = new SentMessageChatDto()
        eventMessage.ChannelId = channel.Id
        eventMessage.ThreadId = updatedMessage.ThreadId
        eventMessage.Message = await this.mapper.mapAsync(updatedMessage,SubTeamChannelChats,MessagesDto)
        this.redisPubClient.publish(RedisProvidersSubs.DELETED, JSON.stringify(eventMessage));
        
        return eventMessage.Message
    }

    async IsChannelExist(channelId: string, searchId: SubTeamSearchId): Promise<boolean> {
        const channel = await this.channelsRepo.FindOne({Id:channelId,SubTeamId:searchId.subTeamId})
        if(!channel)
        {
            return false
        }

        return true
    }

    async CanAccess(channelId: string, searchId: SubTeamSearchId, userId: string): Promise<boolean> {
        const isMember = await this.membersService.IsMemberExist(searchId.subTeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            return false
        }
        return await this.IsChannelExist(channelId,searchId);
    }
}