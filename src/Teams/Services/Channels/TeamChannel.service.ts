import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";
import { ChannelCreateDto } from "src/Common/Channels/Dtos/ChannelCreate.dto";
import { MessagesDto } from "src/Common/Channels/Dtos/Messages.dto";
import { PaginationResponce } from "src/Common/Pagination/PaginationResponce.dto";
import { BadRequestException, ConflictException, forwardRef, Inject, NotFoundException } from "@nestjs/common";
import { GenericRepo } from "src/Infrastructure/Database/Repos/GenericRepo";
import { In, IsNull, LessThanOrEqual, MoreThanOrEqual, Raw } from "typeorm";
import { ChatsPaginationDto } from "src/Common/Channels/Dtos/ChatsPagination.dto";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { UsersService } from "src/Users/Services/Users.service";
import { ITeamsChannelService } from "./ITeamChannel.service";
import { ITeamsService } from "../ITeams.service";
import { TeamChannels } from "src/Teams/Models/TeamChannels.entity";
import { TeamSearchId } from "src/Teams/Dtos/TeamSearchId";
import { ISubTeamsMembersService } from "src/SubTeams/Services/Members/ISubTeamMembers.service";
import { randomBytes } from "crypto";
import { CreateMessageDto } from "src/Common/Channels/Dtos/CreateMessage.dto";
import { ThreadDto } from "src/Common/Channels/Dtos/Thread.dto";
import { TeamChannelChats } from "src/Teams/Models/TeamChannelChats.entity";

export class TeamsChannelService implements ITeamsChannelService {

    @Inject(`REPO_${TeamChannels.name.toUpperCase()}`)
    private readonly channelsRepo: GenericRepo<TeamChannels>;

    @Inject(`REPO_${TeamChannelChats.name.toUpperCase()}`)
    private readonly channelsChatsRepo: GenericRepo<TeamChannelChats>;

    @Inject(ITeamsService)
    private readonly teamService: ITeamsService;

    @InjectMapper()
    private readonly mapper: Mapper

    @Inject(UsersService)
    private readonly userService: UsersService

    @Inject(ISubTeamsMembersService)
    private readonly membersService: ISubTeamsMembersService

     async GetByTeam(teamId: TeamSearchId): Promise<ChannelDto[]> 
    {
        const team = await this.teamService.GetTeam(teamId.teamId,teamId.communityId)
        const data = await this.channelsRepo.FindAll({TeamId:team.Id});

        return await this.mapper.mapArrayAsync(data,TeamChannels,ChannelDto)
    }

    async GetChannels(channelIds: string[]): Promise<ChannelDto[]> {
        const data = await this.channelsRepo.FindAll({Id:In(channelIds)});
        return await this.mapper.mapArrayAsync(data,TeamChannels,ChannelDto);
    }

    async AddChannel(searchId: TeamSearchId, dto: ChannelCreateDto, leaderId: string): Promise<ChannelDto> {
        const team = await this.teamService.VerifyLeaderId(searchId.teamId, leaderId);
        const isExistChannel = await this.channelsRepo.FindAll(
            { Name: Raw(alias => `LOWER(${alias}) = LOWER(:name)`, { name: dto.Name.toLowerCase() }), TeamId: team.Id },
        );

        if(isExistChannel.length > 0)
        {
            throw new ConflictException("There is a channel exist with same name");
        }
        const channel = new TeamChannels();
        channel.Name = dto.Name
        channel.TeamId = team.Id
        await this.channelsRepo.Insert(channel)

        const returnChannel = new ChannelDto();
        returnChannel.Name = channel.Name
        returnChannel.Id = channel.Id
        returnChannel.CreatedAt = channel.CreatedAt

        return returnChannel
    }

    async UpdateChannel(searchId: TeamSearchId, channelId: string, dto: ChannelCreateDto, leaderId: string): Promise<void> 
    {
        const team = await this.teamService.VerifyLeaderId(searchId.teamId, leaderId);
        const channel = await this.channelsRepo.FindOne({Id:channelId,TeamId:team.Id})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }

        const isExistChannel = await this.channelsRepo.FindAll(
            { Name: Raw(alias => `LOWER(${alias}) = LOWER(:name)`, { name: dto.Name.toLowerCase() }), TeamId: team.Id },
        );
        if(isExistChannel.length > 0)
        {
            throw new ConflictException("There is a channel exist with same name");
        }
        channel.Name = dto.Name
        await this.channelsRepo.Update(channel.Id,channel);
    }

    async DeleteChannel(searchId: TeamSearchId, channelId: string, leaderId: string): Promise<void> {
        const team = await this.teamService.VerifyLeaderId(searchId.teamId, leaderId);
        const channel = await this.channelsRepo.FindOne({Id:channelId,TeamId:team.Id})
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
        const isMember = await this.membersService.IsMemberExistByTeam(channel.TeamId,userId);
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

        const chats:PaginationResponce<TeamChannelChats> = await this.channelsChatsRepo.FindAllPaginated(
            chatSearch,
            {
                User:true,
                ReplyTo:{User:true}
            },pagination)
        return new PaginationResponce(
            await this.mapper.mapArrayAsync(chats.Data,TeamChannelChats,MessagesDto),
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
        const isMember = await this.membersService.IsMemberExistByTeam(channel.TeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Channel not found")
        }
        const message:TeamChannelChats = await this.channelsChatsRepo.FindOne(
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

        return new ThreadDto(message.Message,message.ThreadId)
    }

    async GetThreads(channelId: string, userId: string,page:number): Promise<PaginationResponce<ThreadDto>> 
    {
        const channel = await this.channelsRepo.FindOne({Id:channelId})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }
        const isMember = await this.membersService.IsMemberExistByTeam(channel.TeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Channel not found")
        }

        const pagination =  new ChatsPaginationDto()
        pagination.Page = page;
        const data = await this.channelsChatsRepo.FindAllPaginated({ThreadStart:true},{},pagination)
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
        const isMember = await this.membersService.IsMemberExistByTeam(channel.TeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Channel not found")
        }

        const chat = new TeamChannelChats();
        chat.ChannelId = channel.Id;
        chat.Text = dto.Message;
        chat.UserId = user.Id;
        if(dto.ReplyToId)
        {
            const chatSearch = dto.ThreadId ? 
            {
                ChannelId:channel.Id,
                ThreadId:dto.ThreadId,
                Id:dto.ReplyToId
            } 
            :
            [
                {
                    ChannelId:channel.Id,
                    ThreadStart:true,
                    Id:dto.ReplyToId
                },
                {
                    ChannelId:channel.Id,
                    ThreadId:IsNull(),
                    Id:dto.ReplyToId
                }
            ]

            const messageExist = await this.channelsChatsRepo.FindOne(chatSearch)
            if(!messageExist)
            {
                throw new NotFoundException("Cant replying to non existing message")
            }
            chat.ReplyToId = messageExist.Id;
        }
        if(dto.ThreadId)
        {
            const existingThread = await this.channelsChatsRepo.FindOne({ThreadId:dto.ThreadId,ThreadStart:true})
            if(!existingThread)
            {
                throw new NotFoundException("Cant chat to non existing thred")
            }
            chat.ThreadId = dto.ThreadId;
        }

        await this.channelsChatsRepo.Insert(chat)
        chat.User = user;

        return await this.mapper.mapAsync(chat,TeamChannelChats,MessagesDto)
    }

    async DeleteMessage(channelId: string, messageId: string, userId: string): Promise<MessagesDto> {
        const user = await this.userService.FindById(userId,true);
        const channel = await this.channelsRepo.FindOne({Id:channelId})
        if(!channel)
        {
            throw new NotFoundException("Channel not found")
        }
        const isMember = await this.membersService.IsMemberExistByTeam(channel.TeamId,userId);
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Channel not found")
        }
        const message:TeamChannelChats = await this.channelsChatsRepo.FindOne(
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
        await this.channelsChatsRepo.Update(message.Id,message)
        message.User = user;
        
        return await this.mapper.mapAsync(message,TeamChannelChats,MessagesDto)
    }

    async IsChannelExist(channelId: string, searchId: TeamSearchId): Promise<boolean> {
        const channel = await this.channelsRepo.FindOne({ Id: channelId, TeamId: searchId.teamId })
        if (!channel) {
            return false
        }

        return true
    }

    async CanAccess(channelId: string, searchId: TeamSearchId, userId: string): Promise<boolean> {
        const isMember = await this.membersService.IsMemberExistByTeam(searchId.teamId, userId);
        if (!isMember.IsLeader && !isMember.IsMember) {
            return false
        }
        return await this.IsChannelExist(channelId, searchId);
    }

}