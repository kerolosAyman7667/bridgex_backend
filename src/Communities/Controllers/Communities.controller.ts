import { JWTGaurd } from "src/AuthModule/Gaurds/JWT.gaurd";
import { IFileService } from "src/Common/FileUpload/IFile.service";
import { Controller, UseGuards, Inject, Get, Post, Body, Query, Param, UseInterceptors, UploadedFiles, Delete, BadRequestException, Patch, Header, StreamableFile } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiConsumes, ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";
import { SuperAdminGaurd } from "src/AuthModule/Gaurds/SuperAdmin.gaurd";
import { CommunityCardDto } from "../Dtos/CommunityCard.dto";
import { CommunityCreateDto } from "../Dtos/CommunityCreate.dto";
import { ResponseType } from "src/Common/ResponseType";
import { CommunitySearchDto } from "../Dtos/CommunitySearch.dto";
import { PaginationResponce } from "src/Common/Pagination/PaginationResponce.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CommunityDto, CommunityWithCanModifyDto } from "../Dtos/Community.dto";
import { CommunityUpdateDto } from "../Dtos/CommunityUpdate.dto";
import { CurrentUserDecorator } from "src/AuthModule/CurrentUser.decorator";
import { TokenPayLoad } from "src/AuthModule/Dtos/TokenPayload";
import { ICommunitiesService } from "../Services/ICommunities.service";
import { CommunityLogoFileOptions } from "src/Common/FileUpload/FileTypes/CommunityLogo.file";
import { CommunityImagesFileOptions } from "src/Common/FileUpload/FileTypes/CommunityImages.file";
import { ImagesDto } from "src/Common/DTOs/Images.dto";
import { ImageCreateDto } from "src/Common/DTOs/ImageCreate.dto";
import { LogoDto } from "src/Common/DTOs/Logo.dto";
import { OptionalGuard } from "src/AuthModule/Gaurds/OptionalGuard";

@ApiTags('Communities')
@Controller("communities")
export class CommunitiesController {

    constructor(
        @Inject(ICommunitiesService)
        private readonly service: ICommunitiesService,
        @Inject(IFileService)
        private readonly fileService:IFileService
    ) { }

    /**
     * Creates a new community
     */
    @Post()
    @UseGuards(JWTGaurd, SuperAdminGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new community' })
    @ApiResponse({ status: 201, description: 'Community created successfully', type: CommunityCardDto })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 409, description: 'Conflict - Community name exists or leader conflict' })
    async AddCommunity(
        @Body() dto: CommunityCreateDto
    ): Promise<ResponseType<CommunityCardDto>> {
        const insertedCard = await this.service.Insert(dto);
        return new ResponseType<CommunityCardDto>(201, "Added community successfully", insertedCard)
    }

    /**
     * Retrieves paginated list of communities
     */
    @Get()
    @ApiOperation({ summary: 'Get paginated list of communities' })
    @ApiResponse({ status: 200, description: 'THIS IS Pagination Responce', type: CommunityCardDto })
    async GetCommunities(
        @Query() dto: CommunitySearchDto
    ): Promise<ResponseType<PaginationResponce<CommunityCardDto>>> {
        const cards = await this.service.GetCards(dto);
        return new ResponseType<PaginationResponce<CommunityCardDto>>(200, "Get Communities cards successfully", cards)
    }

    // /**
    //  * Retrieves paginated list of user communities
    // */
    // @Get("user")
    // @ApiBearerAuth()
    // @ApiOperation({ summary: 'Get paginated list of user communities' })
    // @ApiResponse({ status: 200, description: 'THIS IS Pagination Responce', type: CommunityCardDto })
    // @UseGuards(JWTGaurd)
    // async GetUserCommunities(
    //     @Query() dto: CommunitySearchDto,
    //     @CurrentUserDecorator() user:TokenPayLoad
    // ): Promise<ResponseType<PaginationResponce<CommunityCardDto>>> {
    //     const cards = await this.service.GetUserCommunities(user.UserId,dto);
    //     return new ResponseType<PaginationResponce<CommunityCardDto>>(200, "Get user communities cards successfully", cards)
    // }

    /**
     * Retrieves a specific community by ID
     */
    @Get(":id")
    @ApiOperation({ summary: 'Get community by ID' })
    @ApiParam({ name: 'id', description: 'Community ID' })
    @ApiResponse({ status: 200, description: 'Community retrieved successfully', type: CommunityWithCanModifyDto })
    @ApiResponse({ status: 404, description: 'Community not found' })
    @UseGuards(OptionalGuard)
    async GetCommunity(
        @Param("id") id: string,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<CommunityWithCanModifyDto>> {
        const c = (await this.service.GetCommunity(id))as CommunityWithCanModifyDto;
        c.CanModify = false;
        try
        {
            await this.service.VerifyLeaderId(id,payload?.UserId)
            c.CanModify = true;
        }catch(ex){}

        return new ResponseType<CommunityWithCanModifyDto>(200, "Get community successfully", c)
    }

    /**
     * Updates a community
     */
    @Patch(":id")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update community' })
    @ApiParam({ name: 'id', description: 'Community ID' })
    @ApiResponse({ status: 200, description: 'Community updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not community leader' })
    @ApiResponse({ status: 404, description: 'Not Found Community - Not community leader' })
    async UpdateCommunity(
        @Param("id") id: string,
        @Body() dto: CommunityUpdateDto,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<void>> {
        await this.service.UpdateCommunities(id, dto, payload.UserId);
        return new ResponseType<void>(200, "Community updated successfully")
    }

    /**
     * Updates a community
     */
    @Patch(":id/core")
    @UseGuards(JWTGaurd,SuperAdminGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update community Name or leader' })
    @ApiParam({ name: 'id', description: 'Community ID' })
    @ApiResponse({ status: 200, description: 'Community updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not Super admin' })
    @ApiResponse({ status: 404, description: 'Not Found Community' })
    async UpdateCommunityNameOrLeader(
        @Param("id") id: string,
        @Body() dto: CommunityCreateDto,
    ): Promise<ResponseType<void>> {
        await this.service.UpdateCommunityNameAndLeaderEmail(id, dto);
        return new ResponseType<void>(200, "Community updated successfully")
    }
    
    /**
     * Uploads community logo
     */
    @Post(":id/logo")
    @UseInterceptors(FilesInterceptor("file", 1))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload community logo' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'id', description: 'Community ID' })
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
    @ApiResponse({ status: 404, description: 'Not Found Community - Not community leader' })
    @UseGuards(JWTGaurd)
    async UploadLogo(
        @Param("id") id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<LogoDto>> {
        if (!files || files?.length === 0) {
            throw new BadRequestException("Upload valid file")
        }
        const logo = await this.service.AddLogo(id, files[0], payload.UserId);
        return new ResponseType<LogoDto>(200, "Add community logo successfully", logo)
    }

    /**
     * Uploads community images
     */
    @Post(":id/images")
    @UseInterceptors(FilesInterceptor("file", 10))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload community images' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'id', description: 'Community ID' })
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
    @ApiResponse({ status: 404, description: 'Not Found Community - Not community leader' })
    @UseGuards(JWTGaurd)
    async UploadImages(
        @Param("id") id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<ImagesDto[]>> {
        if (!files || files?.length === 0) {
            throw new BadRequestException("Upload valid file")
        }
        const imagesAdded = await this.service.AddImage(id, files, new ImageCreateDto(), payload.UserId);
        return new ResponseType<ImagesDto[]>(200, "Add community images successfully", imagesAdded)
    }

    /**
     * Deletes a community image
     */
    @Delete(":id/:imageid")
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete community image' })
    @ApiParam({ name: 'id', description: 'Community ID' })
    @ApiParam({ name: 'imageid', description: 'Image ID' })
    @ApiResponse({ status: 200, description: 'Image deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not community leader' })
    @ApiResponse({ status: 404, description: 'Image not found' })
    async DeleteImage(
        @Param("id") id: string,
        @Param("imageid") imageId: string,
        @CurrentUserDecorator() payload: TokenPayLoad
    ): Promise<ResponseType<void>> {
        await this.service.DeleteImage(id, imageId, payload.UserId);
        return new ResponseType<void>(200, `Deleted community image Id:${imageId} successfully`)
    }

    @Get('logo/:imagename')
    @Header('Content-Type', 'application/octet-stream')
    @ApiOkResponse({
        description: 'Returns a file as an octet-stream',
        content: {
            'application/octet-stream': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiNotFoundResponse()
    async handleGetLogo(
        @Param("imagename") imagename: string
    ): Promise<StreamableFile> {
        return await this.fileService.Get(`${CommunityLogoFileOptions.Dest}${imagename}`, CommunityLogoFileOptions)
    }

    @Get('images/:imagename')
    @Header('Content-Type', 'application/octet-stream')
    @ApiOkResponse({
        description: 'Returns a file as an octet-stream',
        content: {
            'application/octet-stream': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiNotFoundResponse()
    async handleGetImages(
        @Param("imagename") imagename: string
    ): Promise<StreamableFile> {
        return await this.fileService.Get(`${CommunityImagesFileOptions.Dest}${imagename}`, CommunityImagesFileOptions)
    }
}