import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { IGenericRepo } from "src/Common/Generic/Contracts/IGenericRepo";
import { IFileService } from "src/Common/FileUpload/IFile.service";
import { Injectable, Scope, Inject, NotFoundException, } from "@nestjs/common";
import { ITeamsAchievementService } from "./ITeamAchievement.service";
import { TeamAchievements } from "../Models/TeamAchievements.entity";
import { ITeamsService } from "./ITeams.service";
import { TeamAchievementCreateDto, TeamAchievementDto } from "../Dtos/TeamAchievement";
import { Teams } from "../Models/Teams.entity";
import { TeamAchievementImagesFileOptions } from "src/Common/FileUpload/FileTypes/TeamAchievement.file";
import { FileReturn } from "src/Common/FileUpload/FileReturn";

/**
 * @implements {ITeamsAchievementService}
 */
@Injectable({ scope: Scope.REQUEST })
export class TeamAchievementService implements ITeamsAchievementService{

    constructor(
        @Inject("REPO_TEAMACHIEVEMENTS")
        private readonly achRepo: IGenericRepo<TeamAchievements>,
        @Inject(IFileService)
        private readonly fileService: IFileService,
        @InjectMapper()
        private readonly mapper: Mapper,
        @Inject(ITeamsService)
        private readonly teamService:ITeamsService
    ) {
    }

    async Add(teamId: string, imageFile: Express.Multer.File, data: TeamAchievementCreateDto, leaderId: string): Promise<TeamAchievementDto> {
        const team:Teams = await this.teamService.VerifyLeaderId(teamId,leaderId);
                
        const fileUpload:FileReturn[] = await this.fileService.Upload([imageFile],TeamAchievementImagesFileOptions)
        const link:string = `/teams/achievements/${fileUpload[0].FileName}`

        const addedAch = await this.achRepo.Insert(new TeamAchievements(data.Title,data.Desc,link,team.Id));

        return await this.mapper.mapAsync(addedAch,TeamAchievements,TeamAchievementDto)
    }
    
    async Delete(teamId: string, achievementId: string, leaderId: string): Promise<void> {
        const team:Teams = await this.teamService.VerifyLeaderId(teamId,leaderId);
        const achievement = await this.achRepo.FindOne({
            TeamId: team.Id,
            Id: achievementId
        })

        if(!achievement)
        {
            throw new NotFoundException()
        }

        //TODO add Transaction
        await this.achRepo.Delete(achievement.Id);
        await this.fileService.Remove(achievement.ImageLink,TeamAchievementImagesFileOptions,false)
    }

    async GetById(teamId: string,achievementId: string): Promise<TeamAchievementDto> {
        const achievement = await this.achRepo.FindOne({
            TeamId: teamId,
            Id: achievementId
        })

        if(achievement)
        {
            throw new NotFoundException()
        }

        return await this.mapper.mapAsync(achievement,TeamAchievements,TeamAchievementDto)
    }

    async GetByTeam(teamId: string): Promise<TeamAchievementDto[]> {
        const achievement = await this.achRepo.Repo.find({where:{
            TeamId: teamId,
        },order:{CreatedAt:"desc"}})

        return await this.mapper.mapArrayAsync(achievement,TeamAchievements,TeamAchievementDto)
    }
}