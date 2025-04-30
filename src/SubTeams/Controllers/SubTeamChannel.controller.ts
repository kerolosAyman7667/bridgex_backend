import { Body, Controller, Delete, Get, HttpStatus, Inject, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JWTGaurd } from "src/AuthModule/Gaurds/JWT.gaurd";
import { ISubTeamsChannelService } from "../Services/Channels/ISubTeamsChannel.service";
import { SubTeamParamDecorator, SubTeamParamPipe } from "./SubTeamParam";
import { CurrentUserDecorator } from "src/AuthModule/CurrentUser.decorator";
import { TokenPayLoad } from "src/AuthModule/Dtos/TokenPayload";
import { SubTeamSearchId, SubTeamSearchIdWithChannelId } from "../Dtos/SubTeamSearchId";
import { ChannelCreateDto } from "src/Common/Channels/Dtos/ChannelCreate.dto";
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";
import { ResponseType } from "src/Common/ResponseType";


@ApiTags('subteams/channels')
@Controller('communities/:communityId/teams/:teamId/subteams/:subTeamId/channels')
@SubTeamParamDecorator(true)    
export class SubTeamChannelController
{
    @Inject(ISubTeamsChannelService)
    private readonly channelsService:ISubTeamsChannelService


    @Get()
    @ApiOperation({ summary: 'Get Channels' })
    @ApiResponse({ status: 200, type: [ChannelDto] })
    async GetChannels
    (
        @Param(new SubTeamParamPipe()) search:SubTeamSearchId,
    ): Promise<ResponseType<ChannelDto[]>>
    {
        const data = await this.channelsService.GetChannelsBySubTeam(search)

        return new ResponseType<ChannelDto[]>(HttpStatus.OK,"Channels successfully retrieved",data)
    }

    @Post()
    @ApiOperation({ summary: 'Create Channel' })
    @ApiResponse({ status: 200, type: ChannelDto })
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiBody({type:ChannelCreateDto})
    async CreateChannel
    (
        @Param(new SubTeamParamPipe()) search:SubTeamSearchId,
        @Body() dto:ChannelCreateDto,
        @CurrentUserDecorator() user:TokenPayLoad  
    ): Promise<ResponseType<ChannelDto>>
    {
        const data = await this.channelsService.AddChannel(search,dto,user.UserId)

        return new ResponseType<ChannelDto>(HttpStatus.CREATED,"Channel successfully created",data)
    }

    @Patch(":channelId")
    @ApiOperation({ summary: 'edit Channel' })
    @ApiResponse({ status: 200 })
    @ApiBody({type:ChannelCreateDto})
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiParam({name:"channelId"})
    async UpdateChannel
    (
        @Param(new SubTeamParamPipe()) search:SubTeamSearchIdWithChannelId,
        @Param("channelId") channelId:string,
        @Body() dto:ChannelCreateDto,
        @CurrentUserDecorator() user:TokenPayLoad  
    )
    {
        await this.channelsService.UpdateChannel(search,channelId,dto,user.UserId)
        return new ResponseType<void>(HttpStatus.OK,"Channel successfully updated")
    }

    @Delete(":channelId")
    @ApiOperation({ summary: 'delete Channel' })
    @ApiResponse({ status: 200 })
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiParam({name:"channelId"})
    async DeleteChannel
    (
        @Param(new SubTeamParamPipe()) search:SubTeamSearchIdWithChannelId,
        @Param("channelId") channelId:string,
        @CurrentUserDecorator() user:TokenPayLoad 
    )
    {
        await this.channelsService.DeleteChannel(search,channelId,user.UserId)
        return new ResponseType<void>(HttpStatus.OK,"Channel successfully deleted")
    }
}