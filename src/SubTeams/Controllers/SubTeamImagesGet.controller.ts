import { Controller, Get, Header, Inject, NotFoundException, Param, Query, StreamableFile } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LearningPhaseResourcesFileOptions } from "src/Common/FileUpload/FileTypes/LearningPhaseResources.file";
import { SubTeamImagesFileOptions } from "src/Common/FileUpload/FileTypes/SubTeamImages.file";
import { SubTeamLogoFileOptions } from "src/Common/FileUpload/FileTypes/SubTeamLogo.file";
import { IFileService } from "src/Common/FileUpload/IFile.service";
import { SubTeamSearchIdWithSectionResource } from "../Dtos/SubTeamSearchId";
import { SubTeamParamDecorator, SubTeamParamWithSectionPipe } from "./SubTeamParam";
import { ICacheService } from "src/Common/Generic/Contracts/ICacheService";
import { ISubTeamsMembersService } from "../Services/Members/ISubTeamMembers.service";
import { ILearningPhaseService } from "../Services/LearningPhase/ILearningPhase.service";
import { LearningPhaseResourceDto } from "../Dtos/LearningPhase/LearningPhaseResourceDto.dto";

@ApiTags('sub teams')
@Controller('subteams')
export class SubTeamImagesGet
{
    constructor(
        @Inject(IFileService)
        private readonly fileService:IFileService,
        @Inject(ICacheService)
        private readonly cacheService:ICacheService,  
        @Inject(ISubTeamsMembersService)
        private readonly memberService:ISubTeamsMembersService,
        @Inject(ILearningPhaseService)
        private readonly learningPhaseService:ILearningPhaseService
    ) { }

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
        return await this.fileService.Get(`${SubTeamLogoFileOptions.Dest}${imagename}`, SubTeamLogoFileOptions)
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
        return await this.fileService.Get(`${SubTeamImagesFileOptions.Dest}${imagename}`, SubTeamImagesFileOptions)
    }

    
    @Get('learning/resources/:resourcefile')
    @Header('Content-Type', 'application/octet-stream')
    @ApiOperation({ summary: 'Get Resource' })
    @ApiResponse({status:200,type:StreamableFile})
    @ApiParam({name:"resourceId" , type:"string"})
    @ApiQuery({name:"token",required:true})
    @ApiQuery({name:"subTeamId",required:true})
    async handleGetResource(
        @Param("resourcefile") resourcefile:string,
        @Query("token") token:string,
        @Query("subTeamId") subTeamId:string
    ): Promise<StreamableFile> {
        const userId = await this.cacheService.GetSet({Key:`learning:${subTeamId}:${token}`})
        if(!userId)
        {
            throw new NotFoundException("Resource not found")
        }

        const isMemberExits = await this.memberService.IsMemberExist(subTeamId,userId);
        if(!isMemberExits.IsLeader && !isMemberExits.IsMember)
        {
            throw new NotFoundException("Resource not found")
        }
        return await this.fileService.Get(`${LearningPhaseResourcesFileOptions.Dest}${resourcefile}`, LearningPhaseResourcesFileOptions)
    }
}