import { BadRequestException, Body, Controller, Delete, Get, Header, HttpStatus, Inject, NotFoundException, Param, Patch, Post, Query, Req, Res, StreamableFile, UnauthorizedException, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from "@nestjs/swagger";
import { JWTGaurd } from "src/AuthModule/Gaurds/JWT.gaurd";
import { SubTeamParamDecorator, SubTeamParamPipe, SubTeamParamWithSectionPipe } from "./SubTeamParam";
import { ISubTeamsService } from "../Services/SubTeams/ISubTeams.service";
import { ISubTeamsMembersService } from "../Services/Members/ISubTeamMembers.service";
import { ILearningPhaseService } from "../Services/LearningPhase/ILearningPhase.service";
import { CreateSectionDto } from "../Dtos/LearningPhase/CreateSection.dto";
import { SubTeamSearchId, SubTeamSearchIdWithSection, SubTeamSearchIdWithSectionResource, SubTeamSearchIdWithSectionVideo } from "../Dtos/SubTeamSearchId";
import { CurrentUserDecorator } from "src/AuthModule/CurrentUser.decorator";
import { TokenPayLoad } from "src/AuthModule/Dtos/TokenPayload";
import { ResponseType } from "src/Common/ResponseType";
import { LearningPhaseSectionDto } from "../Dtos/LearningPhase/LearningPhaseSection.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreateVideoDto } from "../Dtos/LearningPhase/CreateVideo.dto";
import { LearningPhaseVideoDto } from "../Dtos/LearningPhase/LearningPhaseVideo.dto";
import { CreateResourceDto } from "../Dtos/LearningPhase/CreateResource.dto";
import { LearningPhaseResourceDto } from "../Dtos/LearningPhase/LearningPhaseResourceDto.dto";
import { CreateLearningPhaseDto } from "../Dtos/LearningPhase/CreateLearningPhase.dto";
import { LearningPhaseReturnDto } from "../Dtos/LearningPhase/LearningPhaseReturn.dto";
import { IFileService } from "src/Common/FileUpload/IFile.service";
import { LearningPhaseResourcesFileOptions } from "src/Common/FileUpload/FileTypes/LearningPhaseResources.file";
import { createReadStream, promises } from "fs";
import { join } from "path";
import { VideosFileType } from "src/Common/FileUpload/FileTypes/Types/Videos.filetypes";
import { AddUserProgressDto } from "../Dtos/LearningPhase/AddUserProgress.dto";
import { ICacheService } from "src/Common/Generic/Contracts/ICacheService";
import { randomBytes } from "crypto";

@ApiTags('subteams/learningphase')
@Controller('communities/:communityId/teams/:teamId/subteams/:subTeamId/learningphase')
@ApiBearerAuth()
export class LearningPhaseController
{

    @Inject(ISubTeamsService)
    private readonly subTeamService:ISubTeamsService;

    @Inject(ISubTeamsMembersService)
    private readonly memberService:ISubTeamsMembersService;

    @Inject(ILearningPhaseService)
    private readonly learningPhaseService:ILearningPhaseService

    @Inject(IFileService)
    private readonly fileService:IFileService

    @Inject(ICacheService)
    private readonly cacheService:ICacheService

    @Get()
    @ApiOperation({ summary: 'Get sub team learning phase' })
    @ApiResponse({ status: 200, type: [LearningPhaseReturnDto] })
    @SubTeamParamDecorator(true)
    @UseGuards(JWTGaurd)
    async Get
    (
        @Param(new SubTeamParamPipe()) search:SubTeamSearchId,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<LearningPhaseReturnDto>>
    {
        //verify Leaders 
        let canModify = false;
        const isValid = await this.memberService.IsMemberExist(search.subTeamId,user.UserId);
        if(isValid.IsLeader)
        {
            canModify = true
        }
        else if(!isValid.IsMember)
        {
            throw new NotFoundException("Sub team not found")
        }

        const learningPhase:LearningPhaseReturnDto = await this.subTeamService.GetLearningPhase(user.UserId,search.subTeamId);
        learningPhase.CanModify = canModify;
        learningPhase.IsMember = isValid.IsMember
        const token = randomBytes(10).toString("hex");
        await this.cacheService.SetSet({Key:`learning:${search.subTeamId}:${token}`,ObjectToAdd:user.UserId,TimeInSeconds:3600})
        learningPhase.VideosToken = token

        return new ResponseType<LearningPhaseReturnDto>(HttpStatus.OK,"Learning phase successfully retrieved",learningPhase)
    }

    @Post()
    @ApiOperation({ summary: 'update learning phase name and desc' })
    @ApiResponse({ status: 201 })
    @ApiBody({type:CreateLearningPhaseDto})
    @SubTeamParamDecorator(true)
    @UseGuards(JWTGaurd)
    async UpdateLearningData
    (
        @Param(new SubTeamParamPipe()) search:SubTeamSearchId,
        @Body() dto:CreateLearningPhaseDto,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<void>>
    {
        await this.subTeamService.UpdateLearningPhase(dto,search.subTeamId,user.UserId);
        return new ResponseType(HttpStatus.CREATED,"Updates learning phase successfully")
    }

    @Post("section")
    @ApiOperation({ summary: 'add section to learning phase' })
    @ApiResponse({ status: 201 ,type:LearningPhaseSectionDto})
    @ApiBody({type:CreateSectionDto})
    @SubTeamParamDecorator(true)
    @UseGuards(JWTGaurd)
    async AddSection
    (
        @Body() dto:CreateSectionDto,
        @Param(new SubTeamParamPipe()) search:SubTeamSearchId,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<LearningPhaseSectionDto>>
    {
        const returnDto = await this.learningPhaseService.AddSection(dto,search,user.UserId)
        return new ResponseType<LearningPhaseSectionDto>(HttpStatus.CREATED,"Created section successfully",returnDto)
    }

    @Patch("section/:sectionId")
    @ApiOperation({ summary: 'update section name' })
    @ApiResponse({ status: 200 })
    @ApiBody({type:CreateSectionDto})
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @UseGuards(JWTGaurd)
    async UpdateSection
    (
        @Body() dto:CreateSectionDto,
        @Param(new SubTeamParamWithSectionPipe()) search:SubTeamSearchIdWithSection,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<void>>
    {
        await this.learningPhaseService.UpdateSection(dto,search,user.UserId)
        return new ResponseType<void>(HttpStatus.OK,"updated section successfully")
    }

    @Delete("section/:sectionId")
    @ApiOperation({ summary: 'delete section' })
    @ApiResponse({ status: 200 })
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @UseGuards(JWTGaurd)
    async DeleteSection
    (
        @Param(new SubTeamParamWithSectionPipe()) search:SubTeamSearchIdWithSection,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<void>>
    {
        await this.learningPhaseService.DeleteSection(search,user.UserId)
        return new ResponseType<void>(HttpStatus.OK,"delete section successfully")
    }


    @Post("section/:sectionId/video")
    @UseInterceptors(FilesInterceptor("file", 1))
    @ApiOperation({ summary: 'upload video to section !!!! PLEASE SEE POSTMAN FOR THE CORRECT BODY' })
    @ApiResponse({ status: 201,type:LearningPhaseVideoDto })
    @ApiBody({type:CreateVideoDto})
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @UseGuards(JWTGaurd)
    async UploadVideo(
        @UploadedFiles() files: Express.Multer.File[],
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSection,
        @Body() dto:CreateVideoDto,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<LearningPhaseVideoDto>>
    {
        if (!files || files?.length === 0) {
            throw new BadRequestException("Upload valid file")
        }
        const returnDto:LearningPhaseVideoDto = await this.learningPhaseService.UploadVideo(dto,files[0],searchId,user.UserId);
        return new ResponseType<LearningPhaseVideoDto>(HttpStatus.CREATED,"uploaded video successfully",returnDto)
    }

    @Patch("section/:sectionId/video/:videoId")
    @ApiOperation({ summary: 'update video body' })
    @ApiResponse({ status: 200 })
    @ApiBody({type:CreateVideoDto})
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @ApiParam({name:"videoId" , type:"string"})
    @UseGuards(JWTGaurd)
    async UpdateVideo
    (
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionVideo,
        @Param("videoId") videoId:string,
        @Body() dto:CreateVideoDto,
        @CurrentUserDecorator() user:TokenPayLoad
    ): Promise<ResponseType<void>>
    {
        await this.learningPhaseService.UpdateVideo(dto,videoId,searchId,user.UserId);
        return new ResponseType<void>(HttpStatus.OK,"updated video successfully")
    }

    @Post("section/:sectionId/video/:videoId/progress")
    @ApiOperation({ summary: 'Add user progress while user watching video' })
    @ApiResponse({ status: 200 })
    @ApiBody({type:AddUserProgressDto})
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @ApiParam({name:"videoId" , type:"string"})
    @UseGuards(JWTGaurd)
    async ProgressVideo
    (
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionVideo,
        @Param("videoId") videoId:string,
        @Body() data:AddUserProgressDto,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<void>>
    {
        await this.learningPhaseService.AddWatchDuration(videoId,user.UserId,data.Duration,searchId,true);
        return new ResponseType<void>(HttpStatus.OK,"updated successfully")
    }

    @Post("section/:sectionId/video/:videoId/complete")
    @ApiOperation({ summary: 'user completed the video' })
    @ApiResponse({ status: 200 })
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @ApiParam({name:"videoId" , type:"string"})
    @UseGuards(JWTGaurd)
    async CompleteVideo
    (
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionVideo,
        @Param("videoId") videoId:string,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<void>>
    {
        await this.learningPhaseService.CompleteVideo(videoId,user.UserId,searchId,true);
        return new ResponseType<void>(HttpStatus.OK,"Completed successfully")
    }

    @Delete("section/:sectionId/video/:videoId")
    @ApiOperation({ summary: 'delete video' })
    @ApiResponse({ status: 200 })
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @ApiParam({name:"videoId" , type:"string"})
    @UseGuards(JWTGaurd)
    async DeleteVideo
    (
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionVideo,
        @Param("videoId") videoId:string,
        @CurrentUserDecorator() user:TokenPayLoad
    ): Promise<ResponseType<void>>
    {
        await this.learningPhaseService.DeleteVideo(videoId,searchId,user.UserId);
        return new ResponseType<void>(HttpStatus.OK,"deleted video successfully")
    }

    @Post("section/:sectionId/resource")
    @UseInterceptors(FilesInterceptor("file", 1))
    @ApiOperation({ summary: 'upload resource to section !!!! PLEASE SEE POSTMAN FOR THE CORRECT BODY' })
    @ApiResponse({ status: 201,type:LearningPhaseResourceDto })
    @ApiBody({type:CreateResourceDto})
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @UseGuards(JWTGaurd)
    async UploadResources(
        @UploadedFiles() files: Express.Multer.File[],
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSection,
        @Body() dto:CreateResourceDto,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<LearningPhaseResourceDto>>
    {
        if (!files || files?.length === 0) {
            throw new BadRequestException("Upload valid file")
        }
        const returnDto:LearningPhaseResourceDto = await this.learningPhaseService.UploadResource(dto,files[0],searchId,user.UserId);
        return new ResponseType<LearningPhaseResourceDto>(HttpStatus.CREATED,"uploaded resources successfully",returnDto)
    }

    @Patch("section/:sectionId/resource/:resourceId")
    @ApiOperation({ summary: 'update resource body' })
    @ApiResponse({ status: 200 })
    @ApiBody({type:CreateResourceDto})
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @ApiParam({name:"resourceId" , type:"string"})
    @UseGuards(JWTGaurd)
    async UpdateResources
    (
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionResource,
        @Param("resourceId") resourceId:string,
        @Body() dto:CreateResourceDto,
        @CurrentUserDecorator() user:TokenPayLoad
    ): Promise<ResponseType<void>>
    {
        await this.learningPhaseService.UpdateResource(dto,resourceId,searchId,user.UserId);
        return new ResponseType<void>(HttpStatus.OK,"updated resources successfully")
    }

    @Delete("section/:sectionId/resource/:resourceId")
    @ApiOperation({ summary: 'delete resource' })
    @ApiResponse({ status: 200 })
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @ApiParam({name:"resourceId" , type:"string"})
    @UseGuards(JWTGaurd)
    async DeleteResource
    (
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionResource,
        @Param("resourceId") resourceId:string,
        @CurrentUserDecorator() user:TokenPayLoad
    ): Promise<ResponseType<void>>
    {
        await this.learningPhaseService.DeleteResources(resourceId,searchId,user.UserId);
        return new ResponseType<void>(HttpStatus.OK,"deleted resource successfully")
    }

    @Get('section/:sectionId/video/:videoId')
    @ApiOperation({ summary: 'Get video' })
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @ApiParam({name:"videoId" , type:"string"})
    async handleGetVideo(
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionVideo,
        @Param("videoId") videoId:string,
        @Req() req: any,
        @Res() res: any,
        @Query("token") token:string
    ): Promise<void> {
        const video = await this.learningPhaseService.GetVideo(videoId,searchId);

        const userId = await this.cacheService.GetSet({Key:`learning:${searchId.subTeamId}:${token}`})
        if(!userId)
        {
            throw new NotFoundException("Resource not found")
        }

        const isMemberExits = await this.memberService.IsMemberExist(searchId.subTeamId,userId);
        if(!isMemberExits.IsLeader && !isMemberExits.IsMember)
        {
            throw new NotFoundException("Resource not found")
        }
        const filePath = join(__dirname,"..","..","..","files",video.File); // Assuming this is a path to the file
        const stat = await promises.stat(filePath);
        const total = stat.size;
      
        let range = req.headers.range;
        if (!range) {
            const defaultChunkSize = 1024 * 1024; // 1MB
            const defaultStart = 0;
            const defaultEnd = Math.min(defaultStart + defaultChunkSize - 1, total - 1);
            range = `bytes=${defaultStart}-${defaultEnd}`;
        }
      
        // Parse range
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      

        // Validate range
        if (start >= total || end >= total) {
          res.status(416).setHeader('Content-Range', `bytes */${total}`);
          return res.end();
        }
      
        const chunkSize = end - start + 1;
        const file = createReadStream(filePath, { start, end });

        const videoType = new VideosFileType();
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': videoType.MimeTypes[videoType.Extensions.indexOf(video.File.split(".").pop())],
          'Content-Disposition': 'inline',
        });
      
        // const secondsSave = 60;
        // let userWatchedLast = 0;
        // let chunkCount = 0;
        // const CHUNKS_BEFORE_SAVE = 250; 
        // let totalStreamedBytes = 0;

        // file.on('data', (chunk) => {
        //     totalStreamedBytes += chunk.length;
        // });
          
        // file.on('close', () => {
        //     const userWatched = (video.Duration - ((totalStreamedBytes / total) * video.Duration));
        //     const estimatedTimeWatched = (start + totalStreamedBytes) / total * video.Duration;

        //     console.log(userWatched,estimatedTimeWatched)
        // });

        // file.on('data', (chunk) => {
        //     const userWatched = (video.Duration - ((chunkSize / total) * video.Duration));
        //     chunkCount++;
        //     //console.log(userWatched);

        //     if(userWatched > userWatchedLast && chunkCount % CHUNKS_BEFORE_SAVE === 0)
        //     {
        //         try
        //         {
        //             console.log(`Sending chunk of size: ${chunk.length}`,userWatched,userWatchedLast);
        //             this.learningPhaseService.AddWatchDuration(video.Id,userWatched,"a46e32c7cd7160ec25c2f0b7a6decf39",false);
        //             userWatchedLast = userWatched + secondsSave;
        //         }catch(ex)
        //         {
        //             console.log(ex)
        //         }
        //     }
        // });
        file.pipe(res);
    }

    @Get('section/:sectionId/resource/:resourceId')
    @Header('Content-Type', 'application/octet-stream')
    @ApiOperation({ summary: 'Get Resource' })
    @ApiResponse({status:200,type:StreamableFile})
    @SubTeamParamDecorator(true)
    @ApiParam({name:"sectionId" , type:"string"})
    @ApiParam({name:"resourceId" , type:"string"})
    @UseGuards(JWTGaurd)
    async handleGetResource(
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionResource,
        @Param("resourceId") resourceId:string,
        @CurrentUserDecorator() user:TokenPayLoad
    ): Promise<StreamableFile> {
        const resource = await this.learningPhaseService.GetResource(resourceId,searchId);
        const isMemberExits = await this.memberService.IsMemberExist(searchId.subTeamId,user.UserId);
        if(!isMemberExits.IsLeader && !isMemberExits.IsMember)
        {
            throw new NotFoundException("Resource not found")
        }
        return await this.fileService.Get(resource.File, LearningPhaseResourcesFileOptions)
    }
}