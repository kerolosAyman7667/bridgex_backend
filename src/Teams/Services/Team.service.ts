import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { IGenericRepo } from "src/Common/Generic/Contracts/IGenericRepo";
import { IFileService } from "src/Common/FileUpload/IFile.service";
import { Teams } from "../Models/Teams.entity";
import { Injectable, Scope, Inject, NotFoundException, InternalServerErrorException, BadRequestException, ConflictException } from "@nestjs/common";
import { ITeamsService } from "./ITeams.service";
import { ImageCreateDto } from "src/Common/DTOs/ImageCreate.dto";
import { ImagesDto } from "src/Common/DTOs/Images.dto";
import { LogoDto } from "src/Common/DTOs/Logo.dto";
import { TeamDto } from "../Dtos/Team.dto";
import { TeamCardDto } from "../Dtos/TeamCard.dto";
import { TeamCreateDto } from "../Dtos/TeamCreate.dto";
import { TeamUpdateDto } from "../Dtos/TeamUpdate.dto";
import { TeamImages } from "../Models/TeamImages.entity";
import { TeamsMedia } from "../Models/TeamsMedia.entity";
import { UsersService } from "src/Users/Services/Users.service";
import { ICommunitiesService } from "src/Communities/Services/ICommunities.service";
import { TeamLogoFileOptions } from "src/Common/FileUpload/FileTypes/TeamLogo.file";
import { TeamsConstants } from "../TeamsConstants";
import { TeamImagesFileOptions } from "src/Common/FileUpload/FileTypes/TeamImages.file";
import { TeamLeaders } from "../Models/TeamLeaders.entity";
import { Users } from "src/Users/Models/Users.entity";
import { IsNull, Raw } from "typeorm";
import { INotification } from "src/Common/Generic/Contracts/INotificationService";

//TODO verify the the team leader is not the Community leader
/**
 * @implements {ITeamsService}
 */
@Injectable({ scope: Scope.REQUEST })
export class TeamService implements ITeamsService {

    constructor(
        @Inject("REPO_TEAMS")
        private readonly teamRepo: IGenericRepo<Teams>,
        @Inject("REPO_TEAMIMAGES")
        private readonly imagesRepo: IGenericRepo<TeamImages>,
        @Inject("REPO_TEAMSMEDIA")
        private readonly mediaRepo: IGenericRepo<TeamsMedia>,
        @Inject("REPO_TEAMLEADERS")
        private readonly leadersRepo: IGenericRepo<TeamLeaders>,
        @Inject(IFileService)
        private readonly fileService: IFileService,
        private readonly userService: UsersService,
        @InjectMapper()
        private readonly mapper: Mapper,
        @Inject(ICommunitiesService)
        private readonly communityService: ICommunitiesService,
        @Inject(INotification)
        private readonly notiService: INotification,
    ) {
    }

    async Insert(dataToInsert: TeamCreateDto, communityId: string, leaderId: string): Promise<TeamCardDto> {
        //check if he is the leader of community 
        const community = await this.communityService.VerifyLeaderId(communityId, leaderId)
        //check if the leader email is existing user and is valid
        const user = await this.userService.FindOne({Email:dataToInsert.LeaderEmail},true,{CommunityLeaders:true,SubTeams:{SubTeam:true}});
        if (user.IsSuperAdmin)
            throw new BadRequestException("Super admin can't be team leader")
        if(user.CommunityLeaders.length > 0)
        {
            throw new BadRequestException("Community admins can't be team leader")
        }
        if(user.SubTeams.filter(x=> !x.LeaveDate && x.SubTeam.CommunityId === communityId).length > 0)
        {
            throw new BadRequestException("Members can't be team leader")
        }

        const teams: Teams[] = await this.teamRepo.FindAll(
            [
                { Name: Raw(alias => `LOWER(${alias}) = LOWER(:name)`, { name: dataToInsert.Name.toLowerCase() }) ,CommunityId:communityId},
                { LeaderId: user.Id,CommunityId:communityId }
            ]
        );
        for (const team of teams) {
            if (team.Name.toLowerCase() === dataToInsert.Name.toLowerCase()) {
                throw new ConflictException(`Team ${team.Name} already exist`)
            } else if (team.LeaderId === user.Id) {
                throw new ConflictException("Team leaders can only lead one team at maximum")
            }
        }

        const team = new Teams()
        team.Name = dataToInsert.Name;
        team.LeaderId = user.Id;
        team.CommunityId = community.Id;

        const addedTeam = await this.teamRepo.Insert(team);
        //add the leader to the leader history
        try {
            this.leadersRepo.Insert(new TeamLeaders(null, addedTeam.LeaderId, addedTeam.Id))
            this.notiService.SendLeaderTeamEmail(user.Email,user.FirstName,community.Name,team.Name)
        } catch (err) {
            //TODO add logger
            console.log(err)
        }

        return await this.mapper.mapAsync(addedTeam, Teams, TeamCardDto)
    }

    //TODO paginate the leaders with separate endpoint
    //TODO paginate the Achievements with separate endpoint
    async GetTeam(id: string, communityId: string, includeChannels: boolean = true): Promise<TeamDto> {
        const team = await this.teamRepo.FindOne(
            {CommunityId:communityId,Id:id},
            { Channels: includeChannels, Images: true, MediaLinks: true, Achievements: true, Leaders: { Leader: true }, Leader:true,SubTeams:{Members:true} }
        );

        if (team === null) {
            throw new NotFoundException("Team Not Found")
        }

        return await this.mapper.mapAsync(team, Teams, TeamDto)
    }

    async GetTeams(communityId: string): Promise<TeamCardDto[]> {
        //First checks if the community already exist
        const community = await this.communityService.GetCommunity(communityId);

        const team: Teams[] = await this.teamRepo.FindAll({ CommunityId: community.Id },{Leader:true,Members:true})

        return await this.mapper.mapArrayAsync(team, Teams, TeamCardDto)
    }

    async UpdateTeam(id: string, dto: TeamUpdateDto, leaderId: string): Promise<void> {
        const team: Teams = await this.VerifyLeaderId(id, leaderId);
        team.Desc = dto.Desc
        team.DescShort = dto.DescShort
        team.Vision = dto.Vision

        try {
            //TODO add Transaction
            await this.mediaRepo.Repo.delete({TeamId:team.Id});
            await this.mediaRepo.Repo.insert(dto.MediaLinks.map(x => new TeamsMedia(x.Name, x.Link, team.Id)))
            await this.teamRepo.Update(team.Id,team);
        } catch (err) {
            throw new InternalServerErrorException(`Error happened when trying to update team ${team.Name}`)
        }
    }

    async Update(id: string, dto: TeamCreateDto, leaderId: string): Promise<void> {
        //check if the team exist and the Community leader Only can update it
        const team: Teams = await this.teamRepo.FindOne({ Id: id, Community: { LeaderId: leaderId } }, { Community: true })
        const oldLeaderId = team.LeaderId;
        if (team === null) {
            throw new NotFoundException("Team Not Found")
        }
        //search for the user id by the provided email
        const user = await this.userService.FindOne({Email:dto.LeaderEmail},true,{CommunityLeaders:true,SubTeams:{SubTeam:true}});
        if (user.IsSuperAdmin)
            throw new BadRequestException("Super admin can't be team leader")
        if(user.CommunityLeaders.length > 0)
        {
            throw new BadRequestException("Community admins can't be team leader")
        }
        if(user.SubTeams.filter(x=> !x.LeaveDate && x.SubTeam.CommunityId === team.CommunityId).length > 0)
        {
            throw new BadRequestException("Members can't be team leader")
        }

        //TODO add transaction
        //if the user id doesnt match this means that there is a new leader assigned to the team
        if (team.LeaderId !== user.Id) {
            //check if the newly added user is leader in other team in the community or not
            const isLeaderExist = await this.teamRepo.FindOne({LeaderId:user.Id,CommunityId:team.CommunityId})
            if(isLeaderExist)
            {
                throw new ConflictException(`This user is already leader in team ${team.Name}`)
            }

            //update the end date of the leatest active leader
            const lastActiveLeader: TeamLeaders = await this.leadersRepo.FindOne({ TeamId: team.Id, LeaderId: team.LeaderId, EndDate:IsNull() })
            if (lastActiveLeader) {
                lastActiveLeader.EndDate = new Date();

                await this.leadersRepo.Update(lastActiveLeader.Id, lastActiveLeader)
            }

            //insert the new leader
            await this.leadersRepo.Insert(new TeamLeaders(null, user.Id, team.Id))
            team.LeaderId = user.Id
        }

        //Validate the name
        if(team.Name !== dto.Name)
        {
            const teamWithSameName: Teams = await this.teamRepo.FindOne(
                { Name: Raw(alias => `LOWER(${alias}) = LOWER(:name)`, { name: dto.Name.toLowerCase() }) },
            );
            if(teamWithSameName && teamWithSameName.Id != team.Id)
            {
                throw new ConflictException(`Team ${teamWithSameName.Name} already exist`)
            }
            team.Name = dto.Name
        }
        //update the team with new leader id and name
        await this.teamRepo.Update(team.Id, team);
        if(oldLeaderId !== team.LeaderId)
            this.notiService.SendLeaderTeamEmail(user.Email,user.FirstName,team.Community.Name,team.Name)
    }

    async AddLogo(id: string, files: Express.Multer.File, leaderId: string): Promise<LogoDto> {
        const team = await this.VerifyLeaderId(id, leaderId);

        const fileUpload = await this.fileService.Update(
            files, TeamLogoFileOptions,
            TeamsConstants.DefaultLogo === team.Logo ? null : team.Logo,
            true
        )

        team.Logo = `/teams/logo/${fileUpload.FileName}`
        await this.teamRepo.Repo.update(id, team);

        return new LogoDto(`Team ${team.Name} Logo`, team.Logo)
    }

    async AddImages(id: string, files: Express.Multer.File[], dto: ImageCreateDto, leaderId: string): Promise<ImagesDto[]> {
        const team = await this.VerifyLeaderId(id, leaderId);

        const teamImagesCount: number = await this.imagesRepo.Repo.countBy({ TeamId: id });
        if (teamImagesCount >= 10 || teamImagesCount + files.length > 10) {
            throw new BadRequestException("Maximum photos is 10")
        }

        return await Promise.all(
            files.map(async (x, i) => {
                const fileUpload = await this.fileService.Upload([x], TeamImagesFileOptions)

                const communityImage = new TeamImages()
                communityImage.Name = dto.Name
                communityImage.File = `/teams/images/${fileUpload[0].FileName}`
                communityImage.TeamId = team.Id

                const imageDb: TeamImages = await this.imagesRepo.Insert(communityImage);
                return await this.mapper.mapAsync(imageDb, TeamImages, ImagesDto)
            })
        );
    }

    async DeleteImage(teamId: string, imageId: string, leaderId: string): Promise<void> {
        const team = await this.VerifyLeaderId(teamId, leaderId);

        const image = await this.imagesRepo.FindOne({
            TeamId: team.Id,
            Id: imageId
        })

        if (!image) {
            throw new NotFoundException("Image not found")
        }

        //TODO add Transaction
        await this.imagesRepo.Delete(image.Id);
        await this.fileService.Remove(image.File, TeamImagesFileOptions, false)
    }

    async VerifyLeaderId(teamId: string, leaderId: string): Promise<Teams> {
        const team: Teams = await this.teamRepo.FindById(teamId, { Community: true })
        if (team === null) 
        {
            throw new NotFoundException("Team Not Found")
        }
        if (team.LeaderId !== leaderId && team.Community.LeaderId !== leaderId) 
        {
            throw new NotFoundException("Team Not Found")
        }

        return team;
    }
}