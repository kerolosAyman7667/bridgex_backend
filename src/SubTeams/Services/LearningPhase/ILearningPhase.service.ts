import { CreateVideoDto } from "src/SubTeams/Dtos/LearningPhase/CreateVideo.dto"
import { CreateResourceDto } from "src/SubTeams/Dtos/LearningPhase/CreateResource.dto"
import { LearningPhaseResourceDto } from "src/SubTeams/Dtos/LearningPhase/LearningPhaseResourceDto.dto"
import { LearningPhaseSectionDto } from "src/SubTeams/Dtos/LearningPhase/LearningPhaseSection.dto"
import { LearningPhaseVideoDto } from "src/SubTeams/Dtos/LearningPhase/LearningPhaseVideo.dto"
import { SubTeamSearchId, SubTeamSearchIdWithSection } from "src/SubTeams/Dtos/SubTeamSearchId"
import { CreateSectionDto } from "src/SubTeams/Dtos/LearningPhase/CreateSection.dto"
import { LearningPhaseService } from "./LearningPhase.service"

export interface ILearningPhaseService
{
    //#region "Sections"
    AddSection(dto:CreateSectionDto,searchIds:SubTeamSearchId,leaderId:string) : Promise<LearningPhaseSectionDto>

    UpdateSection(dto:CreateSectionDto,searchIds:SubTeamSearchIdWithSection,leaderId:string) : Promise<void>

    DeleteSection(searchIds:SubTeamSearchIdWithSection,leaderId:string) : Promise<void>
    //#endregion "Sections"

    //#region "Videos"
    GetVideo(videoId:string,searchIds:SubTeamSearchIdWithSection) : Promise<LearningPhaseVideoDto>;

    UploadVideo(dto:CreateVideoDto,file:Express.Multer.File,searchIds:SubTeamSearchIdWithSection,leaderId:string) : Promise<LearningPhaseVideoDto>

    UpdateVideo(dto:CreateVideoDto,videoId:string,searchIds:SubTeamSearchIdWithSection,leaderId:string) : Promise<void>

    DeleteVideo(videoId:string,searchIds:SubTeamSearchIdWithSection,leaderId:string) : Promise<void>
    //#endregion "Videos"

    //#region "Resource" 
    GetResource(resourceId:string,searchIds:SubTeamSearchIdWithSection) : Promise<LearningPhaseResourceDto>;

    UploadResource(dto:CreateResourceDto,file:Express.Multer.File,searchIds:SubTeamSearchIdWithSection,leaderId:string) : Promise<LearningPhaseResourceDto>

    UpdateResource(dto:CreateResourceDto,resourceId:string,searchIds:SubTeamSearchIdWithSection,leaderId:string) : Promise<void>

    DeleteResources(resourceId:string,searchIds:SubTeamSearchIdWithSection,leaderId:string) : Promise<void>
    //#endregion "Resource"

    CompleteVideo(videoId:string,userId:string,searchIds:SubTeamSearchIdWithSection,checkOnTheUser?:boolean) : Promise<void>

    AddWatchDuration(videoId:string,userId:string,duration:number,searchIds:SubTeamSearchIdWithSection,checkOnTheUser?:boolean) : Promise<void>
}

export const ILearningPhaseService = Symbol("ILearningPhaseService")


export const ILearningPhaseServiceProvider = {
    provide:ILearningPhaseService,
    useClass:LearningPhaseService
}