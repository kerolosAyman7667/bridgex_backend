import { BadRequestException, Body, Controller, Delete, Get, Header, HttpStatus, Inject, NotFoundException, Param, Patch, Post, Req, Res, StreamableFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
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

@ApiTags('subteams/learningphase')
@Controller('communities/:communityId/teams/:teamId/subteams/:subTeamId/learningphase')
@SubTeamParamDecorator(true)
@UseGuards(JWTGaurd)
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

    @Get()
    async Get
    (
        @Param(new SubTeamParamPipe()) search:SubTeamSearchId,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<LearningPhaseReturnDto>>
    {
        //verify Leaders 
        let canModify = false;
        const isValid = await this.isValid(search.subTeamId,user.UserId);
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
        return new ResponseType<LearningPhaseReturnDto>(HttpStatus.OK,"Learning phase successfully retrieved",learningPhase)
    }

    @Post()
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
    async DeleteSection
    (
        @Body() dto:CreateSectionDto,
        @Param(new SubTeamParamWithSectionPipe()) search:SubTeamSearchIdWithSection,
        @CurrentUserDecorator() user:TokenPayLoad
    ) : Promise<ResponseType<void>>
    {
        await this.learningPhaseService.DeleteSection(search,user.UserId)
        return new ResponseType<void>(HttpStatus.OK,"delete section successfully")
    }


    @Post("section/:sectionId/video")
    @UseInterceptors(FilesInterceptor("file", 1))
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
    @Header('Content-Type', 'application/octet-stream')
    async handleGetVideo(
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionVideo,
        @Param("videoId") videoId:string,
        @CurrentUserDecorator() user:TokenPayLoad,
        @Req() req: any,
        @Res() res: any,
    ): Promise<void> {
        const video = await this.learningPhaseService.GetVideo(videoId,searchId);
        const isMemberExits = await this.isValid(searchId.subTeamId,"a46e32c7cd7160ec25c2f0b7a6decf39");
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
    async handleGetResource(
        @Param(new SubTeamParamWithSectionPipe()) searchId: SubTeamSearchIdWithSectionResource,
        @Param("resourceId") resourceId:string,
        @CurrentUserDecorator() user:TokenPayLoad
    ): Promise<StreamableFile> {
        const resource = await this.learningPhaseService.GetResource(resourceId,searchId);
        const isMemberExits = await this.isValid(searchId.subTeamId,user.UserId);
        if(!isMemberExits.IsLeader && !isMemberExits.IsMember)
        {
            throw new NotFoundException("Resource not found")
        }
        return await this.fileService.Get(resource.File, LearningPhaseResourcesFileOptions)
    }

    private async isValid(subTeamId:string,UserId:string) : Promise<{IsLeader:boolean,IsMember:boolean}>
    {
        const dataReturn:{IsLeader:boolean,IsMember:boolean} = {IsLeader:false,IsMember:false};
        try
        {
            await this.subTeamService.VerifyLeaderId(subTeamId,UserId)
            dataReturn.IsLeader = true
        }catch(ex)
        {
            dataReturn.IsMember = await this.memberService.IsMemberExist(subTeamId,UserId)
        }

        return dataReturn;
    }
}