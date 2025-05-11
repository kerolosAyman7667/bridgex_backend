import { Body, Controller, Delete, Get, HttpStatus, Inject, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JWTGaurd } from "src/AuthModule/Gaurds/JWT.gaurd";
import { CurrentUserDecorator } from "src/AuthModule/CurrentUser.decorator";
import { TokenPayLoad } from "src/AuthModule/Dtos/TokenPayload";
import { ChannelCreateDto, ChannelCreateDtoWithPublic } from "src/Common/Channels/Dtos/ChannelCreate.dto";
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";
import { ResponseType } from "src/Common/ResponseType";
import { SubTeamParamDecorator } from "src/SubTeams/Controllers/SubTeamParam";
import { TeamSearchId, TeamSearchIdWithChannelId } from "src/Teams/Dtos/TeamSearchId";
import { ITeamsChannelService } from "src/Teams/Services/Channels/ITeamChannel.service";
import { TeamParamPipe } from "../TeamParam";


@ApiTags('teams/channels')
@Controller('communities/:communityId/teams/:teamId/channels')
@SubTeamParamDecorator(false)
export class TeamChannelController
{
    @Inject(ITeamsChannelService)
    private readonly channelsService:ITeamsChannelService

    
    @Get()
    @ApiOperation({ summary: 'Get Channels' })
    @ApiResponse({ status: 200, type: [ChannelDto] })
    async GetChannels
    (
        @Param(new TeamParamPipe()) search:TeamSearchId,
    ): Promise<ResponseType<ChannelDto[]>>
    {
        const data = await this.channelsService.GetByTeam(search)

        return new ResponseType<ChannelDto[]>(HttpStatus.OK,"Channels successfully retrieved",data)
    }

    @Post()
    @ApiOperation({ summary: 'Create Channel' })
    @ApiResponse({ status: 200, type: ChannelDto })
    @UseGuards(JWTGaurd)
    @ApiBody({type:ChannelCreateDto})
    @ApiBearerAuth()
    async CreateChannel
    (
        @Param(new TeamParamPipe()) search:TeamSearchId,
        @Body() dto:ChannelCreateDtoWithPublic,
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
    @ApiParam({name:"channelId"})
    @ApiBearerAuth()
    async UpdateChannel
    (
        @Param(new TeamParamPipe()) search:TeamSearchIdWithChannelId,
        @Param("channelId") channelId:string,
        @Body() dto:ChannelCreateDtoWithPublic,
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
    @ApiParam({name:"channelId"})
    @ApiBearerAuth()
    async DeleteChannel
    (
        @Param(new TeamParamPipe()) search:TeamSearchIdWithChannelId,
        @Param("channelId") channelId:string,
        @CurrentUserDecorator() user:TokenPayLoad 
    )
    {
        await this.channelsService.DeleteChannel(search,channelId,user.UserId)
        return new ResponseType<void>(HttpStatus.OK,"Channel successfully deleted")
    }
}