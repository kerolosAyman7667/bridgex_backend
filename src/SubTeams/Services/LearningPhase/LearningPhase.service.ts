import { CreateVideoDto } from "src/SubTeams/Dtos/LearningPhase/CreateVideo.dto";
import { CreateResourceDto } from "src/SubTeams/Dtos/LearningPhase/CreateResource.dto";
import { LearningPhaseResourceDto } from "src/SubTeams/Dtos/LearningPhase/LearningPhaseResourceDto.dto";
import { LearningPhaseSectionDto } from "src/SubTeams/Dtos/LearningPhase/LearningPhaseSection.dto";
import { LearningPhaseVideoDto } from "src/SubTeams/Dtos/LearningPhase/LearningPhaseVideo.dto";
import { SubTeamSearchId, SubTeamSearchIdWithSection } from "src/SubTeams/Dtos/SubTeamSearchId";
import { ILearningPhaseService } from "./ILearningPhase.service";
import { ISubTeamsService } from "../SubTeams/ISubTeams.service";
import { GenericRepo } from "src/Infrastructure/Database/Repos/GenericRepo";
import { LearningPhaseSections } from "src/SubTeams/Models/LearningPhase/LearningPhaseSections.entity";
import { ConflictException, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { CreateSectionDto } from "src/SubTeams/Dtos/LearningPhase/CreateSection.dto";
import { IFileService } from "src/Common/FileUpload/IFile.service";
import { LearningPhaseResourcesFileOptions } from "src/Common/FileUpload/FileTypes/LearningPhaseResources.file";
import { LearningPhaseResources } from "src/SubTeams/Models/LearningPhase/LearningPhaseResources.entity";
import { LearningPhaseVideos } from "src/SubTeams/Models/LearningPhase/LearningPhaseVideos.entity";
import { LearningPhaseVideosConvertedFileOptions, LearningPhaseVideosFileOptions } from "src/Common/FileUpload/FileTypes/LearningPhaseVideos.file";
import { getVideoDurationInSeconds } from 'get-video-duration';
import { UserProgress } from "src/SubTeams/Models/LearningPhase/UserProgress.entity";
import { ISubTeamsMembersService } from "../Members/ISubTeamMembers.service";
import { UsersService } from "src/Users/Services/Users.service";
import { join } from "path";
import { IAIUrlService } from "src/AIModule/IAIUrl.service";
import { FileReturn } from "src/Common/FileUpload/FileReturn";
import { SubTeams } from "src/SubTeams/Models/SubTeams.entity";
import { CreateAssetResponseDto } from "src/AIModule/Dtos/CreateAssetResponse.dto";
import { writeFileSync } from "fs";
import { VideoTranscodingService } from "src/Common/FileUpload/VideoTranscoding.service";

@Injectable({scope:Scope.REQUEST})
export class LearningPhaseService implements ILearningPhaseService {
    @Inject(ISubTeamsService)
    private readonly subTeamService: ISubTeamsService

    @Inject(`REPO_${LearningPhaseSections.name.toUpperCase()}`)
    private readonly sectionRepo: GenericRepo<LearningPhaseSections>;

    @Inject(`REPO_${LearningPhaseResources.name.toUpperCase()}`)
    private readonly resourcesRepo: GenericRepo<LearningPhaseResources>;

    @Inject(`REPO_${LearningPhaseVideos.name.toUpperCase()}`)
    private readonly videosRepo: GenericRepo<LearningPhaseVideos>;

    @Inject(`REPO_${UserProgress.name.toUpperCase()}`)
    private readonly userProgressRepo: GenericRepo<UserProgress>;

    @Inject(ISubTeamsMembersService)
    private readonly membersService: ISubTeamsMembersService;

    @Inject(IFileService)
    private readonly fileService: IFileService;

    @Inject(UsersService)
    private readonly userService: UsersService;

    @Inject(IAIUrlService)
    private readonly aiService:IAIUrlService

    @Inject(VideoTranscodingService)
    private readonly transService:VideoTranscodingService


    async GetVideo(videoId: string, searchIds: SubTeamSearchIdWithSection): Promise<LearningPhaseVideoDto> {
        const video = await this.videosRepo.FindOne({ Id: videoId, SectionId: searchIds.sectionId, Section: { SubTeamId: searchIds.subTeamId } }, { Section: true });
        if (!video) {
            throw new NotFoundException("Video not found");
        }

        const returnDto = new LearningPhaseVideoDto()
        returnDto.File = video.File;
        returnDto.Name = video.Name;
        returnDto.Id = video.Id;
        returnDto.Duration = video.Duration;
        returnDto.Desc = video.Desc;

        return returnDto;
    }

    async GetResource(resourceId: string, searchIds: SubTeamSearchIdWithSection): Promise<LearningPhaseResourceDto> {
        const resource = await this.resourcesRepo.FindOne({ Id: resourceId, SectionId: searchIds.sectionId, Section: { SubTeamId: searchIds.subTeamId } }, { Section: true });
        if (!resource) {
            throw new NotFoundException("Resource not found");
        }

        const returnDto = new LearningPhaseResourceDto()
        returnDto.File = resource.File;
        returnDto.Name = resource.Name;
        returnDto.Id = resource.Id;

        return returnDto
    }

    async AddSection(dto: CreateSectionDto, searchIds: SubTeamSearchId, leaderId: string): Promise<LearningPhaseSectionDto> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchIds.subTeamId, leaderId);
        const newSection = new LearningPhaseSections();
        newSection.Name = dto.Name;
        newSection.SubTeamId = subTeam.Id;

        if (!dto.Number || dto.Number === 0) {
            const sectionCount: number = await this.sectionRepo.Repo.maximum("Number", { SubTeamId: subTeam.Id });
            newSection.Number = sectionCount + 1;
        }
        else {
            const sectionWithSameNumber = await this.sectionRepo.FindOne({ Number: dto.Number, SubTeamId: subTeam.Id });
            if (sectionWithSameNumber) {
                throw new ConflictException(`Section ${sectionWithSameNumber.Name} already has the number ${sectionWithSameNumber.Number}`);
            }
            newSection.Number = dto.Number;
        }

        await this.sectionRepo.Insert(newSection);
        const returnDto = new LearningPhaseSectionDto();
        returnDto.Id = newSection.Id
        returnDto.Name = newSection.Name
        returnDto.Number = newSection.Number

        return returnDto;
    }

    async UpdateSection(dto: CreateSectionDto, searchIds: SubTeamSearchIdWithSection, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchIds.subTeamId, leaderId);
        const section = await this.sectionRepo.FindOne({ Id: searchIds.sectionId, SubTeamId: subTeam.Id });
        if (!section) {
            throw new NotFoundException("There is no section with this id")
        }
        section.Name = dto.Name;
        if (dto.Number && dto.Number > 0 && dto.Number !== section.Number) {
            const sectionWithSameNumber = await this.sectionRepo.FindOne({ Number: dto.Number, SubTeamId: subTeam.Id });
            if (sectionWithSameNumber) {
                throw new ConflictException(`Section ${sectionWithSameNumber.Name} already has the number ${sectionWithSameNumber.Number}`);
            }
            section.Number = dto.Number;
        }

        await this.sectionRepo.Update(section.Id, section);
    }

    async DeleteSection(searchIds: SubTeamSearchIdWithSection, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchIds.subTeamId, leaderId);
        const section = await this.sectionRepo.FindOne({ SubTeamId: subTeam.Id, Id: searchIds.sectionId }, { Resources: true, Videos: true })
        if(!section)
        {
            throw new NotFoundException("Section not found")
        }
        for (const resource of section?.Resources) {
            this.aiService.DeleteAsset(subTeam.KnowledgeBaseId,resource.AIAssetId,true);
            await this.fileService.Remove(resource.File, LearningPhaseResourcesFileOptions, false);
            await this.resourcesRepo.Delete(resource.Id);
        }

        for (const video of section?.Videos) {
            await this.fileService.Remove(video.File, LearningPhaseVideosFileOptions, false);
            await this.videosRepo.Delete(video.Id);
        }

        await this.sectionRepo.Delete(section.Id);
    }

    async UploadVideo(dto: CreateVideoDto, file: Express.Multer.File, searchIds: SubTeamSearchIdWithSection, leaderId: string): Promise<LearningPhaseVideoDto> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchIds.subTeamId, leaderId);
        const section = await this.sectionRepo.FindOne({ Id: searchIds.sectionId, SubTeamId: subTeam.Id });
        if(!section)
        {
            throw new NotFoundException("Section not found")
        }

        const fileUpload = await this.fileService.Upload
            (
                [file],
                LearningPhaseVideosFileOptions
            )

        const fullFilePath = `${LearningPhaseVideosFileOptions.Dest}${fileUpload[0].FileName}`
        // const fullOutputPath = `${LearningPhaseVideosConvertedFileOptions.Dest}${fileUpload[0].FileName}`
        // await this.transService.transcodeToSupportedFormat(fullFilePath,fullOutputPath)


        const video = new LearningPhaseVideos();
        video.Name = dto.Name;
        video.File = fullFilePath
        video.SectionId = section.Id;
        video.Desc = dto.Desc;

        try {
            const duration = await getVideoDurationInSeconds(join(__dirname, "..", "..", "..", "..", "files", fileUpload[0].FilePath))
            video.Duration = duration;
        } catch (err) {
            console.log(err)
        }
        await this.videosRepo.Insert(video)

        const returnDto = new LearningPhaseVideoDto()
        returnDto.File = video.File;
        returnDto.Name = video.Name;
        returnDto.Id = video.Id;
        returnDto.Duration = video.Duration;
        returnDto.Desc = video.Desc;

        return returnDto;
    }

    async UpdateVideo(dto: CreateVideoDto, videoId: string, searchIds: SubTeamSearchIdWithSection, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchIds.subTeamId, leaderId);
        const video = await this.videosRepo.FindOne({ SectionId: searchIds.sectionId, Id: videoId, Section: { SubTeamId: subTeam.Id } }, { Section: true })
        if (!video) {
            throw new NotFoundException("Video is not found");
        }
        video.Name = dto.Name;
        video.Desc = dto.Desc;

        await this.videosRepo.Update(video.Id, video);
    }

    async DeleteVideo(videoId: string, searchIds: SubTeamSearchIdWithSection, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchIds.subTeamId, leaderId);
        const video = await this.videosRepo.FindOne({ SectionId: searchIds.sectionId, Id: videoId, Section: { SubTeamId: subTeam.Id } }, { Section: true })
        if (!video) {
            throw new NotFoundException("Video is not found");
        }

        await this.fileService.Remove(video.File, LearningPhaseVideosFileOptions, false)
        await this.videosRepo.Delete(video.Id)
    }

    async UploadResource(dto: CreateResourceDto, file: Express.Multer.File, searchIds: SubTeamSearchIdWithSection, leaderId: string): Promise<LearningPhaseResourceDto> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchIds.subTeamId, leaderId);
        const section = await this.sectionRepo.FindOne({ Id: searchIds.sectionId, SubTeamId: subTeam.Id });
        if(!section)
        {
            throw new NotFoundException("Section not found")
        }
        const fileUpload = await this.fileService.Upload
            (
                [file],
                LearningPhaseResourcesFileOptions
            )

        const resource = new LearningPhaseResources();
        resource.Name = dto.Name;
        resource.File = `${LearningPhaseResourcesFileOptions.Dest}${fileUpload[0].FileName}`
        resource.SectionId = section.Id;

        // try
        // {
        //     const aiData:CreateAssetResponseDto = await ;
        //     resource.AIAssetId = aiData.asset_id;
        // }catch(ex)
        // {
        //     this.fileService.Remove(fileUpload[0].FilePath,LearningPhaseResourcesFileOptions,true);
        //     throw ex;
        // }

        await this.resourcesRepo.Insert(resource)
        if(["pdf","doc","docx","txt"].includes(fileUpload[0].Extension))
        {
            this.UploadFileToAi(fileUpload[0],subTeam,resource).catch(console.log);
        }
        
        const returnDto = new LearningPhaseResourceDto()
        returnDto.File = resource.File;
        returnDto.Name = resource.Name;
        returnDto.Id = resource.Id;

        return returnDto;
    }

    async UpdateResource(dto: CreateResourceDto, resourceId: string, searchIds: SubTeamSearchIdWithSection, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchIds.subTeamId, leaderId);
        const resource = await this.resourcesRepo.FindOne({ SectionId: searchIds.sectionId, Id: resourceId, Section: { SubTeamId: subTeam.Id } }, { Section: true })
        if (!resource) {
            throw new NotFoundException("Resource is not found");
        }
        resource.Name = dto.Name;

        await this.resourcesRepo.Update(resource.Id, resource);
    }

    async DeleteResources(resourceId: string, searchIds: SubTeamSearchIdWithSection, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(searchIds.subTeamId, leaderId);
        const resource = await this.resourcesRepo.FindOne({ SectionId: searchIds.sectionId, Id: resourceId, Section: { SubTeamId: subTeam.Id } }, { Section: true })
        if (!resource) {
            throw new NotFoundException("Resource is not found");
        }

        this.aiService.DeleteAsset(subTeam.KnowledgeBaseId,resource.AIAssetId,true);
        await this.fileService.Remove(resource.File, LearningPhaseResourcesFileOptions, false)
        await this.resourcesRepo.Delete(resource.Id)
    }

    async CompleteVideo(videoId:string,userId:string,searchIds:SubTeamSearchIdWithSection,checkOnTheUser?:boolean) : Promise<void>    {
        const video = await this.videosRepo.FindOne({ Id: videoId,SectionId:searchIds.sectionId,Section:{SubTeamId:searchIds.subTeamId} }, { Section: true })
        if(!video)
        {
            throw new NotFoundException("Video not found")
        }
        if (checkOnTheUser) {
            const isExist = await this.membersService.IsMemberExist(video.Section.SubTeamId, userId)
            if (!isExist.IsMember && !isExist.IsLeader)
                throw new NotFoundException("Video not found")
        }

        const isUserProgressExist = await this.userProgressRepo.FindOne({ UserId: userId, VideoId: video.Id });
        if (isUserProgressExist) {
            isUserProgressExist.IsCompleted = true
            await this.userProgressRepo.Update(isUserProgressExist.Id, isUserProgressExist);
        } else {
            const userExist = await this.userService.FindById(userId, true)
            const userProgress = new UserProgress();
            userProgress.UserId = userExist.Id;
            userProgress.VideoId = video.Id;
            userProgress.IsCompleted = true;

            await this.userProgressRepo.Insert(userProgress)
        }
    }

    async AddWatchDuration(videoId:string,userId:string,duration:number,searchIds:SubTeamSearchIdWithSection,checkOnTheUser?:boolean) : Promise<void>{
        const video = await this.videosRepo.FindOne({ Id: videoId,SectionId:searchIds.sectionId,Section:{SubTeamId:searchIds.subTeamId} }, { Section: true })
        if(!video)
        {
            throw new NotFoundException("Video not found")
        }
        if (checkOnTheUser) {
            const isExist = await this.membersService.IsMemberExist(video.Section.SubTeamId, userId)
            if (!isExist.IsMember && !isExist.IsLeader)
                throw new NotFoundException("Video not found")
        }

        const isUserProgressExist = await this.userProgressRepo.FindOne({ UserId: userId, VideoId: video.Id });
        if (isUserProgressExist) {
            if (video.Duration && duration >= (video.Duration - 30)) {
                isUserProgressExist.WatchDuration = video.Duration
                isUserProgressExist.IsCompleted = true
            }
            else if(isUserProgressExist.WatchDuration > duration)
            {
                return;
            }else
            {
                isUserProgressExist.WatchDuration = duration;
            }

            await this.userProgressRepo.Update(isUserProgressExist.Id, isUserProgressExist);
        } else {
            const userExist = await this.userService.FindById(userId, true)
            const userProgress = new UserProgress();
            userProgress.UserId = userExist.Id;
            userProgress.VideoId = video.Id;
            if (video.Duration && duration >= video.Duration) {
                userProgress.WatchDuration = video.Duration
                userProgress.IsCompleted = true
            }
            else {
                userProgress.WatchDuration = duration;
            }

            await this.userProgressRepo.Insert(userProgress)
        }
    }

    private async UploadFileToAi(fileUpload:FileReturn,subTeam:SubTeams,resource:LearningPhaseResources)
    {
        let aiResponse:CreateAssetResponseDto;
        if(["pdf","txt"].includes(fileUpload.Extension))
        {
            aiResponse = await this.aiService.AddAsset(subTeam.KnowledgeBaseId,fileUpload.FilePath,fileUpload.OriginalName)
        }
        else if(["doc","docx"].includes(fileUpload.Extension))
        {
            let fileToSend:Buffer = await this.fileService.ConvertToPdf(fileUpload.FilePath);
            aiResponse = await this.aiService.AddAsset(subTeam.KnowledgeBaseId,fileToSend,fileUpload.OriginalName)
        }

        const addedResource = await this.resourcesRepo.FindById(resource.Id);
        addedResource.AIAssetId = aiResponse.asset_id;
        await this.resourcesRepo.Update(resource.Id,addedResource)
    }
}