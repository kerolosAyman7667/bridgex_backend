import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { IGenericRepo } from "src/Common/Generic/Contracts/IGenericRepo";
import { IFileService } from "src/Common/FileUpload/IFile.service";
import { SubTeams } from "../../Models/SubTeams.entity";
import { Injectable, Scope, Inject, ConflictException, NotFoundException, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { ISubTeamsService } from "./ISubTeams.service";
import { SubTeamImages } from "../../Models/SubTeamImages.entity";
import { SubTeamsMedia } from "../../Models/SubTeamsMedia.entity";
import { ImageCreateDto } from "src/Common/DTOs/ImageCreate.dto";
import { ImagesDto } from "src/Common/DTOs/Images.dto";
import { LogoDto } from "src/Common/DTOs/Logo.dto";
import { SubTeamDto } from "../../Dtos/SubTeam.dto";
import { SubTeamCardDto } from "../../Dtos/SubTeamCard.dto";
import { SubTeamCreateDto } from "../../Dtos/SubTeamCreate.dto";
import { SubTeamSearchId } from "../../Dtos/SubTeamSearchId";
import { SubTeamUpdateDto } from "../../Dtos/SubTeamUpdate.dto";
import { ITeamsService } from "src/Teams/Services/ITeams.service";
import { IsNull, Not, Raw } from "typeorm";
import { SubTeamsConstants } from "../../SubTeamsConstants";
import { SubTeamLogoFileOptions } from "src/Common/FileUpload/FileTypes/SubTeamLogo.file";
import { SubTeamImagesFileOptions } from "src/Common/FileUpload/FileTypes/SubTeamImages.file";
import { SubTeamMembers } from "../../Models/SubTeamMembers.entity";
import { CreateLearningPhaseDto } from "src/SubTeams/Dtos/LearningPhase/CreateLearningPhase.dto";
import { LearningPhaseReturnDto } from "src/SubTeams/Dtos/LearningPhase/LearningPhaseReturn.dto";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { CreateKnowledgeBaseDto, CreateKnowledgeBaseResponseDto } from "src/AIModule/Dtos/CreateKnowledgeBase.dto";
import { AIUrlService } from "src/AIModule/AIUrl.service";
import { IAIUrlService } from "src/AIModule/IAIUrl.service";
import { SendChat } from "src/AIModule/Dtos/SendChat.dto";
import { ChatResponseDto, ChatResponseWithMessageDto } from "src/AIModule/Dtos/ChatResponse.dto";
import { LearningPhaseChat } from "src/SubTeams/Models/LearningPhase/LearningPhaseChat.entity";
import { PaginationResponce } from "src/Common/Pagination/PaginationResponce.dto";
import { SortType } from "src/Common/Pagination/Pagination";


/**
 * @implements {ISubTeamsService}
 */
@Injectable({ scope: Scope.REQUEST })
export class SubTeamService implements ISubTeamsService {

    constructor(
        @Inject(`REPO_${SubTeams.name.toUpperCase()}`)
        private readonly repo: IGenericRepo<SubTeams>,

        @Inject(`REPO_${SubTeamImages.name.toUpperCase()}`)
        private readonly imagesRepo: IGenericRepo<SubTeamImages>,

        @Inject(`REPO_${SubTeamsMedia.name.toUpperCase()}`)
        private readonly mediaRepo: IGenericRepo<SubTeamsMedia>,

        @Inject(`REPO_${SubTeamMembers.name.toUpperCase()}`)
        private readonly membersRepo: IGenericRepo<SubTeamMembers>,

        @Inject(`REPO_${LearningPhaseChat.name.toUpperCase()}`)
        private readonly learningPhaseChatRepo: IGenericRepo<LearningPhaseChat>,

        @Inject(IFileService)
        private readonly fileService: IFileService,
        @InjectMapper()
        private readonly mapper: Mapper,

        @Inject(ITeamsService)
        private readonly teamService: ITeamsService,

        @Inject(IAIUrlService)
        private readonly aiService:IAIUrlService
    ) {
    }

    async GetLearningPhase(userId:string,subTeamId: string): Promise<LearningPhaseReturnDto> {
        const subTeamWithLearningPhase:SubTeams = await this.repo.Repo
        .createQueryBuilder('subTeam')
        .leftJoinAndSelect('subTeam.LearningPhaseSections', 'section')
        .orderBy("section.Number")
        .leftJoinAndSelect('section.Resources', 'resource')
        .leftJoinAndSelect('section.Videos', 'video')
        .leftJoinAndSelect('video.Progress', 'progress', 'progress.UserId = :userId', { userId })
        .where('subTeam.Id = :subTeamId', { subTeamId })
        .getOne();

        return await this.mapper.mapAsync(subTeamWithLearningPhase,SubTeams,LearningPhaseReturnDto)
    }

    async UpdateLearningPhase(dto: CreateLearningPhaseDto, subTeamId: string, leaderId: string): Promise<void> {
        const subTeam: SubTeams = await this.VerifyLeaderId(subTeamId, leaderId);
        subTeam.LearningPhaseDesc = dto.Desc
        subTeam.LearningPhaseTitle = dto.Name

        await this.repo.Update(subTeam.Id, subTeam);
    }

    async Insert(dataToInsert: SubTeamCreateDto, teamId: string, leaderId: string): Promise<SubTeamCardDto> {
        const team = await this.teamService.VerifyLeaderId(teamId, leaderId)
        const subTeams: SubTeams[] = await this.repo.FindAll(
            { Name: Raw(alias => `LOWER(${alias}) = LOWER(:name)`, { name: dataToInsert.Name.toLowerCase() }), TeamId: teamId },
        );

        if (subTeams.length > 0) {
            throw new ConflictException(`Sub team ${dataToInsert.Name} already exist`)
        }
        const newSubTeam: SubTeams = new SubTeams()
        newSubTeam.Name = dataToInsert.Name
        newSubTeam.TeamId = team.Id
        newSubTeam.CommunityId = team.CommunityId
        newSubTeam.JoinLink = dataToInsert.JoinLink
        newSubTeam.LearningPhaseTitle = "Learning Phase"
        
        const aiData:CreateKnowledgeBaseResponseDto = await this.aiService.AddKnowledgeBase(new CreateKnowledgeBaseDto(`${dataToInsert.Name}_${team.Name}_${team.Community.Name}`));
        newSubTeam.KnowledgeBaseId = aiData.knowledge_base_id

        try
        {
            await this.repo.Insert(newSubTeam);
        }catch(ex)
        {
            this.aiService.DeleteKnowledgeBase(newSubTeam.KnowledgeBaseId)
            throw ex;
        }
        return await this.mapper.mapAsync(newSubTeam, SubTeams, SubTeamCardDto)
    }

    async GetSubTeam(dto: SubTeamSearchId): Promise<{dto:SubTeamDto,JoinLink:string}> {
        const subTeam =  await this.repo.FindOne({
            CommunityId: dto.communityId,
            TeamId: dto.teamId,
            Id: dto.subTeamId
        },{
            Images:true,MediaLinks:true,Channels:true,Members:{User:true}
        })
    //  const subTeam =  await this.repo.Repo.createQueryBuilder("subTeam")
    //                 .leftJoinAndSelect(
    //                     "subTeam.Members", 
    //                     "member", 
    //                     "member.IsHead = :isHead AND member.LeaveDate IS NULL", 
    //                     { isHead: true }
    //                 )
    //                 .leftJoinAndSelect("subTeam.Images", "images")
    //                 .leftJoinAndSelect("subTeam.MediaLinks", "mediaLinks")
    //                 .leftJoinAndSelect("subTeam.Channels", "channels")
    //                 .leftJoinAndSelect("member.User", "user")
    //                 .where({
    //                     CommunityId: dto.communityId,
    //                     TeamId: dto.teamId,
    //                     Id: dto.subTeamId
    //                 })
    //                 .getOne()


        if (subTeam === null) {
            throw new NotFoundException("Sub team Not Found")
        }

        const returnDto = await this.mapper.mapAsync(subTeam, SubTeams, SubTeamDto)
        return {dto:returnDto,JoinLink:subTeam.JoinLink}
    }

    async GetSubTeamById(id: string): Promise<SubTeams> {
        const subTeam = await this.repo.FindOne(
            { Id: id },
            { Images: true, MediaLinks: true, Channels: true }
        )

        if (subTeam === null) {
            throw new NotFoundException("Sub team Not Found")
        }

        return subTeam
    }

    async GetSubTeams(communityId: string, teamId: string): Promise<SubTeamCardDto[]> {
        const team = await this.teamService.GetTeam(teamId, communityId);

        const subTeams: SubTeams[] = await this.repo.FindAll({ CommunityId: communityId, TeamId: team.Id },{Members:true})

        return await this.mapper.mapArrayAsync(subTeams, SubTeams, SubTeamCardDto)
    }

    async Update(searchDto: SubTeamSearchId, dto: SubTeamUpdateDto, leaderId: string): Promise<void> {
        const subTeam: SubTeams = await this.VerifyLeaderId(searchDto.subTeamId, leaderId);
        subTeam.Desc = dto.Desc
        subTeam.DescShort = dto.DescShort
        subTeam.Vision = dto.Vision

        try {
            //TODO add Transaction
            await this.mediaRepo.Repo.delete({ SubTeamId: subTeam.Id });
            await this.mediaRepo.Repo.insert(dto.MediaLinks.map(x => new SubTeamsMedia(x.Name, x.Link, subTeam.Id)))
            await this.repo.Update(subTeam.Id, subTeam);
        } catch (err) {
            throw new InternalServerErrorException(`Error happened when trying to update team ${subTeam.Name}`)
        }
    }

    async UpdateCore(searchDto: SubTeamSearchId, dto: SubTeamCreateDto, leaderId: string): Promise<void> {
        const subTeam = await this.repo.FindOne([
            { CommunityId: searchDto.communityId, Community: { LeaderId: leaderId }, TeamId: searchDto.teamId, Id: searchDto.subTeamId },
            { CommunityId: searchDto.communityId, Team: { LeaderId: leaderId }, TeamId: searchDto.teamId, Id: searchDto.subTeamId }
        ], { Team: true, Community: true })

        const subTeamsWithSameName: SubTeams[] = await this.repo.FindAll(
            {
                Name: Raw(alias => `LOWER(${alias}) = LOWER(:name)`, { name: dto.Name.toLowerCase() }),
                TeamId: subTeam.TeamId, Id: Not(subTeam.Id)
            },
        );
        if (subTeamsWithSameName.length > 0) {
            throw new ConflictException(`Sub team ${dto.Name} already exist`)
        }
        subTeam.Name = dto.Name
        subTeam.JoinLink = dto.JoinLink

        await this.repo.Update(subTeam.Id, subTeam);
    }

    async AddLogo(searchDto: SubTeamSearchId, files: Express.Multer.File, leaderId: string): Promise<LogoDto> {
        const subTeam = await this.VerifyLeaderId(searchDto.subTeamId, leaderId);

        const fileUpload = await this.fileService.Update(
            files, SubTeamLogoFileOptions,
            SubTeamsConstants.DefaultLogo === subTeam.Logo ? null : subTeam.Logo,
            true
        )

        subTeam.Logo = `/subTeams/logo/${fileUpload.FileName}`
        await this.repo.Repo.update(subTeam.Id, subTeam);

        return new LogoDto(`Sub team ${subTeam.Name} Logo`, subTeam.Logo)
    }

    async AddImages(searchDto: SubTeamSearchId, files: Express.Multer.File[], dto: ImageCreateDto, leaderId: string): Promise<ImagesDto[]> {
        const subTeams = await this.VerifyLeaderId(searchDto.subTeamId, leaderId);

        const subTeamImagesCount: number = await this.imagesRepo.Repo.countBy({ SubTeamId: subTeams.Id });
        if (subTeamImagesCount >= 10 || subTeamImagesCount + files.length > 10) {
            throw new BadRequestException("Maximum photos is 10")
        }

        return await Promise.all(
            files.map(async (x, i) => {
                const fileUpload = await this.fileService.Upload([x], SubTeamImagesFileOptions)

                const communityImage = new SubTeamImages()
                communityImage.Name = dto.Name
                communityImage.File = `/subTeams/images/${fileUpload[0].FileName}`
                communityImage.SubTeamId = subTeams.Id

                const imageDb: SubTeamImages = await this.imagesRepo.Insert(communityImage);
                return await this.mapper.mapAsync(imageDb, SubTeamImages, ImagesDto)
            })
        );
    }

    async DeleteImage(subTeamId: string, imageId: string, leaderId: string): Promise<void> {
        const subTeam = await this.VerifyLeaderId(subTeamId, leaderId);

        const image = await this.imagesRepo.FindOne({
            SubTeamId: subTeam.Id,
            Id: imageId
        })

        if (!image) {
            throw new NotFoundException("Image not found")
        }

        //TODO add Transaction
        await this.imagesRepo.Delete(image.Id);
        await this.fileService.Remove(image.File, SubTeamImagesFileOptions, false)    
    }

    async VerifyLeaderId(Id: string, userId: string): Promise<SubTeams> {
        const subTeam: SubTeams = await this.repo.FindOne(
            { Id: Id },
            { Community: true, Team: true })
            
        if (subTeam === null) {
            throw new NotFoundException("Sub Team Not Found")
        }

        const headMember:SubTeamMembers = await this.membersRepo.FindOne({SubTeamId:subTeam.Id,IsHead:true,UserId:userId,LeaveDate:IsNull()})

        if (subTeam.Team.LeaderId !== userId && subTeam.Community.LeaderId !== userId && !headMember) {
            throw new NotFoundException("Sub Team Not Found")
        }

        return subTeam;
    }

    async LearningPhaseChatAI(subTeamId:SubTeamSearchId,userId:string,data:SendChat) : Promise<ChatResponseDto>
    {
        const subTeam =await this.GetSubTeamById(subTeamId.subTeamId);
        if(!subTeam.KnowledgeBaseId)
        {
            throw new InternalServerErrorException("This sub team has no contact with ai")
        }
        const aiResponse = await this.aiService.Chat(subTeam.KnowledgeBaseId,data.Message);
        const chat  = new LearningPhaseChat()
        chat.SubTeamId = subTeam.Id;
        chat.UserId = userId;
        chat.message = data.Message
        chat.response = aiResponse

        await this.learningPhaseChatRepo.Insert(chat);
        return aiResponse;
    }

    async LearningPhaseChatAIHistory(subTeamId:SubTeamSearchId,userId:string,page:number) : Promise<PaginationResponce<ChatResponseWithMessageDto>>
    {
        const dbResponse = await this.learningPhaseChatRepo.FindAllPaginated({UserId:userId,SubTeamId:subTeamId.subTeamId},{},{
            Page:page,
            Take:15,
            SortField:"CreatedAt",
            SortType:SortType.DESC
        });


        return new PaginationResponce(
            dbResponse.Data.map(x=> new ChatResponseWithMessageDto(x.response,x.message))
            ,
            dbResponse.Count
        );
    }
}