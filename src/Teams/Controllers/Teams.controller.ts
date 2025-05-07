import { JWTGaurd } from "src/AuthModule/Gaurds/JWT.gaurd";
import { Controller, UseGuards, Inject, Get, Post, Body, Param, UseInterceptors, UploadedFiles, Delete, BadRequestException, Patch, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { ResponseType } from "src/Common/ResponseType";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CurrentUserDecorator } from "src/AuthModule/CurrentUser.decorator";
import { TokenPayLoad } from "src/AuthModule/Dtos/TokenPayload";
import { TeamCardDto } from "../Dtos/TeamCard.dto";
import { TeamCreateDto } from "../Dtos/TeamCreate.dto";
import { ITeamsService } from "../Services/ITeams.service";
import { TeamDto, TeamWithCanModifyDto } from "../Dtos/Team.dto";
import { TeamUpdateDto } from "../Dtos/TeamUpdate.dto";
import { LogoDto } from "src/Common/DTOs/Logo.dto";
import { ImagesDto } from "src/Common/DTOs/Images.dto";
import { ImageCreateDto } from "src/Common/DTOs/ImageCreate.dto";
import { OptionalGuard } from "src/AuthModule/Gaurds/OptionalGuard";
import { IsMemberExistDto } from "src/Common/DTOs/IsMemberExist.dto";

@ApiTags('teams')
@Controller('communities/:communityId/teams')
export class TeamsController {

    constructor(
        @Inject(ITeamsService)
        private readonly service: ITeamsService,
    ) { }

    /**
     * Creates a new Team in the community
     */
    @Post()
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiBody({type:TeamCreateDto})
    @ApiParam({name:"communityId" , type:"string", description: "Community id where the team will br added to"})
    @ApiOperation({ summary: 'Creates a new Team in the community' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Team created successfully', type: TeamCardDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request or super admin tries to be the leader' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'The community doesn`t exist or the user is not authorized' })
    async AddTeam(
        @Body() dto: TeamCreateDto,
        @Param("communityId") communityId:string,
        @CurrentUserDecorator() user:TokenPayLoad
    ): Promise<ResponseType<TeamCardDto>> {
        const insertedCard = await this.service.Insert(dto,communityId,user.UserId);
        return new ResponseType<TeamCardDto>(201, "Added team successfully", insertedCard)
    }

    /**
    * Is  leader Or member
    */
    @Get(":id/auth")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiParam({name:"communityId" , type:"string", description: "Community id"})
    @ApiParam({ name: 'id', description: 'Team Id' , type:"string"})
    @ApiOperation({ summary: 'Get Can modify as IsLeader and if he is member or not' })
    @ApiResponse({ status: HttpStatus.OK, type: IsMemberExistDto })
    async IsLeaderOrMember(
        @Param("communityId") communityId:string,
        @Param("id") id: string,
        @CurrentUserDecorator() user: TokenPayLoad
    ): Promise<ResponseType<IsMemberExistDto>> 
    {
        const dto = await this.service.IsMemberExist(id,user.UserId);
        return new ResponseType<IsMemberExistDto>(HttpStatus.OK, "success", dto)
    }
    /**
     * Retrieves all teams in community 
     */
    @Get()
    @ApiOperation({ summary: 'Retrieves all teams in community' })
    @ApiParam({name:"communityId" , type:"string", description: "Community id"})
    @ApiResponse({ status: 200, type: [TeamCardDto] })
    async GetCommunities(
        @Param("communityId") communityId:string,
    ): Promise<ResponseType<TeamCardDto[]>> {
        const cards = await this.service.GetTeams(communityId);
        return new ResponseType<TeamCardDto[]>(200, `Community ${communityId} Teams cards`, cards)
    }

    /**
     * Retrieves a specific team by ID
     */
    @Get(":id")
    @ApiOperation({ summary: 'Get team by ID' })
    @ApiParam({name:"communityId" , type:"string", description: "Community id"})
    @ApiParam({ name: 'id', description: 'Team Id' , type:"string"})
    @ApiResponse({ status: 200, description: 'team retrieved successfully', type: TeamWithCanModifyDto })
    @ApiResponse({ status: 404, description: 'team not found' })
    @UseGuards(OptionalGuard)
    async GetCommunity(
        @Param("communityId") communityId:string,
        @Param("id") id: string,
        @CurrentUserDecorator() payload:TokenPayLoad
    ): Promise<ResponseType<TeamWithCanModifyDto>> {
        const c = (await this.service.GetTeam(id,communityId)) as TeamWithCanModifyDto;
        if(payload)
        {
            const isMember = await this.service.IsMemberExist(c.Id,payload.UserId)
            c.CanModify = isMember.IsLeader 
            c.IsMember =  isMember.IsMember
            // if(!isMember.IsMember && !isMember.IsLeader)
            // {
            //     delete c.Channels;
            // }
        }
        else
        {
            delete c.Channels; 
        }

        return new ResponseType<TeamWithCanModifyDto>(200, "Get team successfully", c)
    }

    /**
     * Updates a Team
     */
    @Patch(":id")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update team' })
    @ApiParam({name:"communityId" , type:"string", description: "Community id"})
    @ApiParam({ name: 'id', description: 'Team Id' , type:"string"})
    @ApiResponse({ status: 200, description: 'team updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Not Found team - Not team leader or community leader' })
    async UpdateTeam(
        @Param("id") id: string,
        @Body() dto: TeamUpdateDto,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<void>> {
        await this.service.UpdateTeam(id, dto, payload.UserId);
        return new ResponseType<void>(200, "update team successfully")
    }

    /**
     * Updates a Team Core
     */
    @Patch(":id/core")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update team name or leader' })
    @ApiParam({name:"communityId" , type:"string", description: "Community id"})
    @ApiParam({ name: 'id', description: 'Team Id' , type:"string"})
    @ApiResponse({ status: 200, description: 'team updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Not Found team - Not community leader' })
    async UpdateTeamCore(
        @Param("id") id: string,
        @Body() dto: TeamCreateDto,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<void>> {
        await this.service.Update(id, dto, payload.UserId);
        return new ResponseType<void>(200, "update team successfully")
    }

    /**
     * Uploads team logo
     */
    @Post(":id/logo")
    @UseGuards(JWTGaurd)
    @UseInterceptors(FilesInterceptor("file", 1))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload team logo' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({name:"communityId" , type:"string", description: "Community id"})
    @ApiParam({ name: 'id', description: 'Team Id' , type:"string"})    
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
    @ApiResponse({ status: 404, description: 'Not Found team - Not community/team leader' })
    async UploadLogo(
        @Param("id") id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<LogoDto>> {
        if (!files || files?.length === 0) {
            throw new BadRequestException("Upload valid file")
        }
        const logo = await this.service.AddLogo(id, files[0], payload.UserId);
        return new ResponseType<LogoDto>(200, "Add team logo successfully", logo)
    }

    /**
     * Uploads community images
     */
    @Post(":id/images")
    @UseGuards(JWTGaurd)
    @UseInterceptors(FilesInterceptor("file", 10))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload team images' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({name:"communityId" , type:"string", description: "Community id"})
    @ApiParam({ name: 'id', description: 'Team Id' , type:"string"})  
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
    @ApiResponse({ status: 404, description: 'Not Found team - Not community/team leader' })
    async UploadImages(
        @Param("id") id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<ImagesDto[]>> {
        if (!files || files?.length === 0) {
            throw new BadRequestException("Upload valid file")
        }
        const imagesAdded = await this.service.AddImages(id, files, new ImageCreateDto(), payload.UserId);
        return new ResponseType<ImagesDto[]>(200, "Add team images successfully", imagesAdded)
    }

    /**
     * Deletes a team image
     */
    @Delete(":id/:imageid")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete team image' })
    @ApiParam({name:"communityId" , type:"string", description: "Community id"})
    @ApiParam({ name: 'id', description: 'Team Id' , type:"string"})  
    @ApiParam({ name: 'imageid', description: 'Image ID' , type:"string"})
    @ApiResponse({ status: 200, description: 'Image deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Image not found - Not community/team leader' })
    async DeleteImage(
        @Param("id") id: string,
        @Param("imageid") imageId: string,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<void>> {
        await this.service.DeleteImage(id, imageId, payload.UserId);
        return new ResponseType<void>(200, `Deleted team image Id:${imageId} successfully`)
    }
}