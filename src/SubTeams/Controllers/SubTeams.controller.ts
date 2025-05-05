import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Inject, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ISubTeamsService } from "../Services/SubTeams/ISubTeams.service";
import { JWTGaurd } from "src/AuthModule/Gaurds/JWT.gaurd";
import { SubTeamCreateDto } from "../Dtos/SubTeamCreate.dto";
import { SubTeamParamDecorator, SubTeamParamPipe } from "./SubTeamParam";
import { SubTeamCardDto } from "../Dtos/SubTeamCard.dto";
import { TeamParamPipe } from "src/Teams/Controllers/TeamParam";
import { TeamSearchId } from "src/Teams/Dtos/TeamSearchId";
import { CurrentUserDecorator } from "src/AuthModule/CurrentUser.decorator";
import { TokenPayLoad } from "src/AuthModule/Dtos/TokenPayload";
import { ResponseType } from "src/Common/ResponseType";
import { SubTeamWithCanModifyDto } from "../Dtos/SubTeam.dto";
import { SubTeamSearchId, SubTeamSearchIdWithImageId } from "../Dtos/SubTeamSearchId";
import { FilesInterceptor } from "@nestjs/platform-express";
import { LogoDto } from "src/Common/DTOs/Logo.dto";
import { ImagesDto } from "src/Common/DTOs/Images.dto";
import { ImageCreateDto } from "src/Common/DTOs/ImageCreate.dto";
import { SubTeamUpdateDto } from "../Dtos/SubTeamUpdate.dto";
import { OptionalGuard } from "src/AuthModule/Gaurds/OptionalGuard";
import { ISubTeamsMembersService } from "../Services/Members/ISubTeamMembers.service";
import { ChatResponseDto, ChatResponseWithMessageDto } from "src/AIModule/Dtos/ChatResponse.dto";
import { SendChat } from "src/AIModule/Dtos/SendChat.dto";
import { PaginationResponce } from "src/Common/Pagination/PaginationResponce.dto";

@ApiTags('sub teams')
@Controller('communities/:communityId/teams/:teamId/subteams')
export class SubTeamsController {

    @Inject(ISubTeamsService)
    private readonly service: ISubTeamsService

    @Inject(ISubTeamsMembersService)
    private readonly memberService: ISubTeamsMembersService

    /**
     * Creates a new sub Team in the community
     */
    @Post()
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiBody({ type: SubTeamCreateDto })
    @SubTeamParamDecorator(false)
    @ApiOperation({ summary: 'Creates a new sub Team in the team' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'sub Team created successfully', type: SubTeamCardDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request or Unauthorize' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'The community/team doesn`t exist' })
    async AddTeam(
        @Body() dto: SubTeamCreateDto,
        @Param(new TeamParamPipe()) searchId: TeamSearchId,
        @CurrentUserDecorator() user: TokenPayLoad
    ): Promise<ResponseType<SubTeamCardDto>> {

        const insertedCard = await this.service.Insert(dto, searchId.teamId, user.UserId);
        return new ResponseType<SubTeamCardDto>(201, "Added sub team successfully", insertedCard)
    }

    /**
     * Retrieves all sub teams in team 
     */
    @Get()
    @ApiOperation({ summary: 'Retrieves all sub teams in team' })
    @SubTeamParamDecorator(false)
    @ApiResponse({ status: 200, type: [SubTeamCardDto] })
    async GetCommunities(
        @Param(new TeamParamPipe()) searchId: TeamSearchId,
    ): Promise<ResponseType<SubTeamCardDto[]>> {
        const cards = await this.service.GetSubTeams(searchId.communityId, searchId.teamId);
        return new ResponseType<SubTeamCardDto[]>(200, `Team ${searchId.teamId} sub teams cards`, cards)
    }

    /**
     * Retrieves a specific sub team by ID
     */
    @Get(":subTeamId")
    @ApiOperation({ summary: 'Get sub team by ID' })
    @SubTeamParamDecorator(true)
    @ApiResponse({ status: 200, description: 'sub team retrieved successfully', type: SubTeamWithCanModifyDto })
    @ApiResponse({ status: 404, description: 'sub team not found' })
    @UseGuards(OptionalGuard)
    async GetSubTeam(
        @Param(new SubTeamParamPipe()) searchId: SubTeamSearchId,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<SubTeamWithCanModifyDto>> {
        const c = await this.service.GetSubTeam(searchId);
        const returnDto = c.dto as SubTeamWithCanModifyDto
        if(!payload)
        {
            returnDto.CanModify = false
        }else
        {
            const subTeam = await this.memberService.IsMemberExist(searchId.subTeamId,payload.UserId)
            if(subTeam.IsLeader)
            {
                returnDto.CanModify = true
                returnDto.JoinLink = returnDto.JoinLink
            }
            returnDto.IsMember = subTeam.IsMember
        }
        return new ResponseType<SubTeamWithCanModifyDto>(200, "Get sub team successfully", returnDto)
    }

    /**
     * Updates a sub team
     */
    @Patch(":subTeamId")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update sub team' })
    @SubTeamParamDecorator(true)
    @ApiResponse({ status: 200, description: 'sub team updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Not Found sub team - Not team leader or community leader or sub team head' })
    async UpdateTeam(
        @Param(new SubTeamParamPipe()) searchId: SubTeamSearchId,
        @Body() dto: SubTeamUpdateDto,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<void>> {
        await this.service.Update(searchId, dto, payload.UserId);
        return new ResponseType<void>(200, "update sub team successfully")
    }

    /**
     * Updates sub Team Core
     */
    @Patch(":subTeamId/core")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update sub team name' })
    @SubTeamParamDecorator(true)
    @ApiResponse({ status: 200, description: 'sub team updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Not Found team - Not community/team leader' })
    async UpdateTeamCore(
        @Param(new SubTeamParamPipe()) searchId: SubTeamSearchId,
        @Body() dto: SubTeamCreateDto,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<void>> {
        await this.service.UpdateCore(searchId, dto, payload.UserId);
        return new ResponseType<void>(200, "updated sub team successfully")
    }

    /**
     * Uploads sub team logo
     */
    @Post(":subTeamId/logo")
    @UseGuards(JWTGaurd)
    @UseInterceptors(FilesInterceptor("file", 1))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload sub team logo' })
    @ApiConsumes('multipart/form-data')
    @SubTeamParamDecorator(true)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Logo uploaded successfully', type: LogoDto })
    @ApiResponse({ status: 400, description: 'Invalid file' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Not Found sub team - Not community/team/sub leader' })
    async UploadLogo(
        @Param(new SubTeamParamPipe()) searchId: SubTeamSearchId,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<LogoDto>> {
        if (!files || files?.length === 0) {
            throw new BadRequestException("Upload valid file")
        }
        const logo = await this.service.AddLogo(searchId, files[0], payload.UserId);
        return new ResponseType<LogoDto>(200, "Added sub team logo successfully", logo)
    }

    /**
     * Uploads sub team images
     */
    @Post(":subTeamId/images")
    @UseGuards(JWTGaurd)
    @UseInterceptors(FilesInterceptor("file", 10))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload sub team images' })
    @ApiConsumes('multipart/form-data')
    @SubTeamParamDecorator(true)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Images uploaded successfully', type: [ImagesDto] })
    @ApiResponse({ status: 400, description: 'Invalid files or maximum limit exceeded' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Not Found team - Not community/team/sub leader' })
    async UploadImages(
        @Param(new SubTeamParamPipe()) searchId: SubTeamSearchId,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<ImagesDto[]>> {
        if (!files || files?.length === 0) {
            throw new BadRequestException("Upload valid file")
        }
        const imagesAdded = await this.service.AddImages(searchId, files, new ImageCreateDto(), payload.UserId);
        return new ResponseType<ImagesDto[]>(200, "Added sub team images successfully", imagesAdded)
    }

    /**
    * Deletes a sub team image
    */
    @Delete(":subTeamId/:imageid")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete sub team image' })
    @SubTeamParamDecorator(true)
    @ApiParam({ name: 'imageid', description: 'Image ID', type: "string" })
    @ApiResponse({ status: 200, description: 'Image deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Image not found - Not community/team/sub leader' })
    async DeleteImage(
        @Param(new SubTeamParamPipe()) searchId: SubTeamSearchIdWithImageId,
        @Param("imageid") imageId: string,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<void>> {
        await this.service.DeleteImage(searchId.subTeamId, imageId, payload.UserId);
        return new ResponseType<void>(200, `Deleted sub team image Id:${imageId} successfully`)
    }

    @Post(":subTeamId/learningphase/chat")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'learning phase chat' })
    @SubTeamParamDecorator(true)
    @ApiResponse({ status: 200,type:ChatResponseDto })
    async LearningPhaseChat(
        @Param(new SubTeamParamPipe()) searchId: SubTeamSearchId,
        @Body() dto: SendChat,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<ChatResponseDto>> 
    {
        const isMember = await this.memberService.IsMemberExist(searchId.subTeamId,payload.UserId)
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Sub team no found")
        }
        const aiResponse = await this.service.LearningPhaseChatAI(searchId,payload.UserId, dto);

        return new ResponseType<ChatResponseDto>(200, "successfully",aiResponse)
    }
    
    @Get(":subTeamId/learningphase/chat")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get learning phase chat history | THIS IS PAGINATED RESPONSE' })
    @SubTeamParamDecorator(true)
    @ApiResponse({ status: 200,type:ChatResponseWithMessageDto})
    @ApiQuery({name:"page",type:Number,required:false})
    async GetLearningPhaseChat(
        @Param(new SubTeamParamPipe()) searchId: SubTeamSearchId,
        @CurrentUserDecorator() payload: TokenPayLoad,
        @Query("page",new ParseIntPipe({ optional: true })) pageNumber:number = 1
    ): Promise<ResponseType<PaginationResponce<ChatResponseWithMessageDto>>> 
    {
        const isMember = await this.memberService.IsMemberExist(searchId.subTeamId,payload.UserId)
        if(!isMember.IsLeader && !isMember.IsMember)
        {
            throw new NotFoundException("Sub team no found")
        }
        const aiResponse = await this.service.LearningPhaseChatAIHistory(searchId,payload.UserId, pageNumber);

        return new ResponseType<PaginationResponce<ChatResponseWithMessageDto>>(200, "successfully",aiResponse)
    }
}