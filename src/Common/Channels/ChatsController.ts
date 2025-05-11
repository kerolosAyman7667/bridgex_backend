import { Controller, UseGuards, Inject, Get, Param, Query, ParseIntPipe, HttpStatus, BadRequestException, Body, Post, Delete } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from "@nestjs/swagger"
import { CurrentUserDecorator } from "src/AuthModule/CurrentUser.decorator"
import { TokenPayLoad } from "src/AuthModule/Dtos/TokenPayload"
import { JWTGaurd } from "src/AuthModule/Gaurds/JWT.gaurd"
import { MessagesDto } from "src/Common/Channels/Dtos/Messages.dto"
import { PaginationResponce } from "src/Common/Pagination/PaginationResponce.dto"
import { ResponseType } from "src/Common/ResponseType"
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto"
import { CreateMessageDto } from "src/Common/Channels/Dtos/CreateMessage.dto"
import { ThreadDto } from "src/Common/Channels/Dtos/Thread.dto"
import { IChannelService } from "src/Common/Channels/IChannel.service"

@UseGuards(JWTGaurd)
@ApiBearerAuth()
export class ChatsController<T>
{
    constructor
    (
        protected readonly channelsService:IChannelService<T>
    )
    {

    }
    
    @Get("id")
    @ApiOperation({ summary: 'Get Channels by ids' })
    @ApiResponse({ status: 200,type:[ChannelDto] })
    @UseGuards(JWTGaurd)
    async GetChannelById
    (
        @Query("ids") channelId:string[] = [],
    ) : Promise<ResponseType<ChannelDto[]>>
    {
        if(channelId?.length > 5 &&  channelId?.length < 1)
        {
            throw new BadRequestException("Max array length 5 and Min 1");
        }
        channelId = Array.isArray(channelId) ? channelId : [channelId];
        const channels = await this.channelsService.GetChannels(channelId)
        return new ResponseType<ChannelDto[]>(HttpStatus.OK,"Channel successfully retrieved",channels)
    }

    @Get(":channelId")
    @ApiParam({name:"channelId"})
    @ApiOperation({ summary: 'Get Channel chats paginated' })
    @ApiResponse({ status: 200, type:[MessagesDto] })
    @UseGuards(JWTGaurd)
    @ApiQuery({name:"threadId",required:false})
    @ApiQuery({name:"after",type:Date,required:false})
    @ApiQuery({name:"before",type:Date,required:false})
    @ApiQuery({name:"page",type:Number,required:false})
    async GetChats
    (
        @Param("channelId") channelId:string,
        @CurrentUserDecorator() user:TokenPayLoad ,
        @Query("page",new ParseIntPipe({ optional: true })) pageNumber:number = 1,
        @Query("threadId") threadId?:string,
        @Query("after") afterDate?:string,
        @Query("before") beforeDate?:string
    ): Promise<ResponseType<PaginationResponce<MessagesDto>>>
    {
        const chats = await this.channelsService.GetChats(channelId,user.UserId,pageNumber,threadId,afterDate ? new Date(afterDate) : null,beforeDate ? new Date(beforeDate) : null)
        return new ResponseType<PaginationResponce<MessagesDto>>(HttpStatus.OK,"Get chats successfully",chats)
    }

    @Get(":channelId/threads")
    @ApiParam({name:"channelId"})
    @ApiOperation({ summary: 'Get Channel threads paginated' })
    @ApiResponse({ status: 200, type:[ThreadDto] })
    @UseGuards(JWTGaurd)
    async GetThreads
    (
        @Param("channelId") channelId:string,
        @CurrentUserDecorator() user:TokenPayLoad ,
        @Query("page",ParseIntPipe) pageNumber:number = 1
    ): Promise<ResponseType<PaginationResponce<ThreadDto>>>
    {
        const threads = await this.channelsService.GetThreads(channelId,user.UserId,pageNumber)
        return new ResponseType<PaginationResponce<ThreadDto>>(HttpStatus.OK,"Get threads successfully",threads)
    }

    @Post(":channelId")
    @UseGuards(JWTGaurd)
    @ApiParam({name:"channelId"})
    @ApiOperation({ summary: 'Add Message to channel' })
    @ApiResponse({ status: 200, type:[MessagesDto] })
    @ApiBody({type:CreateMessageDto})
    async CreateMessage
    (
        @Param("channelId") channelId:string,
        @CurrentUserDecorator() user:TokenPayLoad ,
        @Body() dto:CreateMessageDto
    ) : Promise<ResponseType<MessagesDto>>
    {
        const newMessage = await this.channelsService.AddMessage(channelId,user.UserId,dto)
        return new ResponseType<MessagesDto>(HttpStatus.OK,"Add message successfully",newMessage)
    }

    @Post(":channelId/:messageId")
    @UseGuards(JWTGaurd)
    @ApiParam({name:"channelId"})
    @ApiParam({name:"messageId"})
    @ApiOperation({ summary: 'Create thread from a Message' })
    @ApiResponse({ status: 200, type:ThreadDto })
    async CreateThread
    (
        @Param("channelId") channelId:string,
        @Param("messageId") messageId:string,
        @CurrentUserDecorator() user:TokenPayLoad ,
    ) : Promise<ResponseType<ThreadDto>>
    {
        const thread = await this.channelsService.CreateThread(channelId,user.UserId,messageId)
        return new ResponseType<ThreadDto>(HttpStatus.OK,"Add message successfully",thread)
    }

    @Delete(":channelId/:messageId")
    @UseGuards(JWTGaurd)
    @ApiParam({name:"channelId"})
    @ApiParam({name:"messageId"})
    @ApiOperation({ summary: 'Delete a Message' })
    @ApiResponse({ status: 200 })
    async DeleteMessage
    (
        @Param("channelId") channelId:string,
        @Param("messageId") messageId:string,
        @CurrentUserDecorator() user:TokenPayLoad ,
    ) : Promise<ResponseType<MessagesDto>>
    {
        const dto = await this.channelsService.DeleteMessage(channelId,messageId,user.UserId)
        return new ResponseType<MessagesDto>(HttpStatus.OK,"Deleted message successfully",dto)
    }
}