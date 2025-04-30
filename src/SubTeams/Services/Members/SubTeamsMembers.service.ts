import { IGenericRepo } from "src/Common/Generic/Contracts/IGenericRepo";
import { SubTeamMembers } from "../../Models/SubTeamMembers.entity";
import { ISubTeamsMembersService } from "./ISubTeamMembers.service";
import { ISubTeamsService } from "../SubTeams/ISubTeams.service";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { UsersService } from "src/Users/Services/Users.service";
import { SubTeams } from "../../Models/SubTeams.entity";
import { PaginationResponce } from "src/Common/Pagination/PaginationResponce.dto";
import { MemberReturnDto } from "../../Dtos/SubTeamMembersDtos/MemberReturn.dto";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { MemberSearchDto } from "../../Dtos/SubTeamMembersDtos/MemberSearch.dto";
import { FindOptionsOrder, FindOptionsWhere, ILike, IsNull, Not } from "typeorm";
import { JoinLinkDto } from "../../Dtos/SubTeamMembersDtos/JoinLink.dto";
import { Users } from "src/Users/Models/Users.entity";
import { ITeamsService } from "src/Teams/Services/ITeams.service";

//TODO make rule for the verify if the member IsHead
/**
 * @implements {ISubTeamsMembersService}
 */
@Injectable({scope:Scope.REQUEST})
export class SubTeamsMembersService implements ISubTeamsMembersService {

    @Inject(ISubTeamsService)
    private readonly subTeamService: ISubTeamsService;

    @Inject(`REPO_${SubTeamMembers.name.toUpperCase()}`)
    private readonly membersRepo: IGenericRepo<SubTeamMembers>;

    @Inject(UsersService)
    private readonly userService: UsersService;
    
    @Inject(ITeamsService)
    private readonly teamService: ITeamsService
        
    @InjectMapper()
    private readonly mapper: Mapper;

    async IsMemberExistByTeam(teamId: string, userId: string): Promise<{ IsLeader: boolean; IsMember: boolean; }> 
    {
        const dataReturn:{IsLeader:boolean,IsMember:boolean} = {IsLeader:false,IsMember:false};
        try
        {
            await this.teamService.VerifyLeaderId(teamId,userId);
            dataReturn.IsLeader = true;
        }catch(ex)
        {
            const user = await this.membersRepo.FindOne({SubTeam:{TeamId:teamId},UserId:userId,LeaveDate:IsNull(),JoinDate:Not(IsNull())},{SubTeam:true});
            if(user)
            {
                dataReturn.IsMember = true;
                dataReturn.IsLeader = user.IsHead;
            }
            else
            {
                dataReturn.IsMember = false;
            }
        }

        return dataReturn;
    }

    async IsMemberExist(subTeamId: string, userId: string): Promise<{IsLeader:boolean,IsMember:boolean}> {
        const dataReturn:{IsLeader:boolean,IsMember:boolean} = {IsLeader:false,IsMember:false};
        const subTeam = await this.subTeamService.GetSubTeamById(subTeamId);

        try
        {
            await this.teamService.VerifyLeaderId(subTeam.TeamId,userId);
            dataReturn.IsLeader = true;
        }catch(ex)
        {
            const user = await this.membersRepo.FindOne({SubTeamId:subTeam.Id,UserId:userId,LeaveDate:IsNull(),JoinDate:Not(IsNull())});
            if(user)
            {
                dataReturn.IsMember = true;
                dataReturn.IsLeader = user.IsHead;
            }
            else
            {
                dataReturn.IsMember = false;
            }
        }

        return dataReturn;
    }

    async Join(subTeamId: string, userId: string): Promise<JoinLinkDto> {
        const user:Users = await this.userService.FindOne({ Id: userId }, true, { CommunityLeaders: true, TeamActiveLeaders: true })
        const subTeam: SubTeams = await this.subTeamService.GetSubTeamById(subTeamId)

        await this.AddMemberBasic(user,subTeam)

        return new JoinLinkDto(subTeam.JoinLink)
    }

    async AddMember(subTeamId: string, userEmail: string, isHead: boolean = false, joinDate: Date = new Date(), leaderId: string): Promise<void> {
        const subTeam: SubTeams = await this.subTeamService.VerifyLeaderId(subTeamId, leaderId)
        const user:Users = await this.userService.FindOne({ Email: userEmail }, true, { CommunityLeaders: true, TeamActiveLeaders: true })

        const joinLik:boolean = await this.AddMemberBasic(user,subTeam,isHead,joinDate);
        if(!joinLik)
        {
            throw new ConflictException("User already exist and need to be accepted")
        }
    }

    /**
     * 
     * @param user 
     * @param subTeam 
     * @returns {boolean} boolean - for successful operation returns true from already exist returns false
     */
    async AddMemberBasic( user:Users,subTeam: SubTeams,isHead: boolean = false, joinDate: Date = null) : Promise<boolean>
    {
        //get current active sub teams
        const isExist:SubTeamMembers[] = await this.membersRepo.FindAll({ UserId: user.Id,SubTeam:{CommunityId:subTeam.CommunityId} },{SubTeam:true})
        const joinLik:JoinLinkDto | SubTeamMembers | null = this.AddAndHeadRule(isExist,subTeam,user,subTeam.CommunityId);

        const newMember = new SubTeamMembers();
        newMember.UserId = user.Id;
        newMember.SubTeamId = subTeam.Id
        newMember.LeaveDate = null;
        newMember.JoinDate = null
        newMember.IsHead = isHead
        newMember.JoinDate = joinDate

        if(isHead)
        {
            const headsCount = await this.membersRepo.Repo.countBy({SubTeamId:subTeam.Id,IsHead:true,LeaveDate:IsNull()});
            if(headsCount >= 1)
            {
                throw new BadRequestException("Sub team can only has one head")
            }
        }
        
        if(joinLik instanceof JoinLinkDto)
        {
            return false
        }
        else if(joinLik instanceof SubTeamMembers)
        {
            await this.membersRepo.Update(joinLik.Id,newMember)
        }
        else
        {
            await this.membersRepo.Insert(newMember)
        }
        return true
    }

    async UpdateHead(subTeamId: string, memberId: string, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(subTeamId, leaderId)
        const member = await this.membersRepo.FindOne({ SubTeamId: subTeamId, Id:memberId, LeaveDate:IsNull() })
        if (!member) {
            throw new NotFoundException("User not found")
        }
        
        if (!member.IsHead) {
            const headsCount = await this.membersRepo.Repo.countBy({SubTeamId:subTeamId,IsHead:true,LeaveDate:IsNull()});
            if(headsCount >= 1)
            {
                throw new BadRequestException("Sub team can only has one head")
            }

            const user = await this.userService.FindOne({ Id: member.UserId }, true, { CommunityLeaders: true, TeamActiveLeaders: true })
            if (user.IsSuperAdmin) {
                throw new BadRequestException("Super admin can't join")
            }
            if (user.CommunityLeaders.length > 0) {
                throw new BadRequestException("Community leaders can't join")
            }
            if (user.TeamActiveLeaders.filter(x => x.LeaderId === member.UserId && x.CommunityId === subTeam.CommunityId).length > 0) {
                throw new BadRequestException(`Team leaders of this community can't join`)
            }
        }
        member.IsHead = !member.IsHead
        await this.membersRepo.Update(member.Id, member)
    }

    async Accept(subTeamId: string, memberId: string, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(subTeamId, leaderId)
        const member = await this.membersRepo.FindOne({ SubTeamId: subTeamId, Id:memberId, LeaveDate:IsNull() })
        if (!member) {
            throw new NotFoundException("User not found")
        }
        //why I searched with leave data is null at first already ?
        // if(member.LeaveDate)
        // {
        //     throw new BadRequestException("User already left")
        // }else 
        if(member.JoinDate)
        {
            throw new ConflictException("User already accepted")
        }
        member.JoinDate = new Date()
        await this.membersRepo.Update(member.Id, member)
    }

    async DeleteMember(subTeamId: string, memberId: string, leaderId: string): Promise<void> {
        const subTeam = await this.subTeamService.VerifyLeaderId(subTeamId, leaderId)
        const member = await this.membersRepo.FindOne({ SubTeamId: subTeamId, Id:memberId });
        if (!member) {
            throw new NotFoundException(`This user is not in ${subTeam.Name} sub team`)
        }

        if(member.LeaveDate)
        {
            throw new BadRequestException("This user already left")
        }
        else if (member.JoinDate) {
            member.LeaveDate = new Date()
            await this.membersRepo.Update(member.Id, member)
        }
        else {
            await this.membersRepo.Delete(member.Id)
        }
    }

    async Leave(subTeamId: string, userId: string): Promise<void> {
        const subTeam = await this.subTeamService.GetSubTeamById(subTeamId);
        const member = await this.membersRepo.FindOne({ SubTeamId: subTeamId, UserId:userId });
        if (!member) {
            throw new NotFoundException(`This user is not in ${subTeam.Name} sub team`)
        }

        if(member.LeaveDate)
        {
            throw new BadRequestException("This user already left")
        }
        else if (member.IsAccepted) {
            member.LeaveDate = new Date()
            await this.membersRepo.Update(member.Id, member)
        }
        else
        {
            throw new BadRequestException("You cant leave before begin accepted")
        }
    }

    async GetBySubTeam(subTeamId: string, leaderId: string, pagination: MemberSearchDto): Promise<PaginationResponce<MemberReturnDto>> {
        const subTeam = await this.subTeamService.VerifyLeaderId(subTeamId, leaderId);

        const sort:FindOptionsOrder<SubTeamMembers> = 
            pagination?.SortField === "Name" ? {User:{FirstName:pagination.SortType}} : {JoinDate:pagination.SortType}

        const [data,count] = 
            await this.membersRepo.Repo.findAndCount({
                where:{
                    SubTeamId:subTeamId,
                    ...(pagination?.IsAccepted !== null ? {JoinDate:pagination?.IsAccepted ? Not(IsNull()) : IsNull()} : {}),
                    User:
                        {
                            ...(pagination?.UserName !== null ? {FirstName:ILike(`%${pagination.UserName}%`)} : {}),
                            ...(pagination?.UserEmail !== null ? {Email:ILike(`%${pagination.UserEmail}%`)} : {}),
                        },
                        ...(pagination?.IsHead !== null ? {IsHead:pagination.IsHead} : {}),
                        ...(pagination?.IsLeft !== null ? {LeaveDate:pagination?.IsLeft ? Not(IsNull()) : IsNull()} : {}),
                } as FindOptionsWhere<SubTeamMembers>,
                relations:{User:true},
                skip:(pagination.Page - 1) * pagination.Take,
                take:pagination.Take,
                order:sort
            })
        
        const dataDto: MemberReturnDto[] = await this.mapper.mapArrayAsync(data, SubTeamMembers, MemberReturnDto);
        return new PaginationResponce<MemberReturnDto>(dataDto, count);
    }

    /**
     * 
     * @param isExistMember 
     * @param subTeam 
     * @param user 
     * @returns {JoinLinkDto | SubTeamMembers | null} null to insert {SubTeamMembers} for update
     */
    AddAndHeadRule(
        isExistMember:SubTeamMembers[],
        subTeam:SubTeams,
        user:Users,
        communityId:string
    ) : JoinLinkDto | SubTeamMembers | null
    {
        if (user.IsSuperAdmin) {
            throw new BadRequestException("Super admin can't join")
        }
        if (user.CommunityLeaders.length > 0) {
            throw new BadRequestException("Community leaders can't join")
        }
        if (user.TeamActiveLeaders.filter(x => x.LeaderId === user.Id && x.CommunityId === communityId).length > 0) {
            throw new BadRequestException(`Team leaders of this community can't join`)
        }

        const isExistInOtherSubTeam:boolean = isExistMember.filter(x=> !x.LeaveDate && x.SubTeamId !== subTeam.Id).length > 0;
        if(isExistInOtherSubTeam)
        {
            throw new ConflictException(`User already joined sub team`)
        }
        const currentSubTeam:SubTeamMembers[] = isExistMember.filter(x=> x.SubTeamId === subTeam.Id);

        if(currentSubTeam.length > 0)
        {
            const userMember = currentSubTeam[0]
            //User left the sub team and requested to join again
            if(userMember.LeaveDate)
            {
                //update leaveDate and join date to nulls
                return userMember
            }
            //User requested to join other sub team when he is already in sub team
            else if (userMember.JoinDate)
            {
                throw new ConflictException("User already exist")
            }
            //User Joined for first time then pressed join again JoinDate = null LeaveDate = null
            else
            {
                return new JoinLinkDto(subTeam.JoinLink)  
            }
        }
        //get current active sub team
        // for(const userMember of isExistMember)
        // {

        //     //User Joined for first time then pressed join again JoinDate = null LeaveDate = null
        //     else if(!userMember.JoinDate)
        //     {
        //         throw new ConflictException(`This user already requested to join ${userMember.SubTeam.Name} sub team`)
        //     }
        //     else if(userMember.JoinDate && !userMember.LeaveDate)
        //     {
        //         throw new ConflictException(`This user already joined ${userMember.SubTeam.Name} sub team`)
        //     }
        // }
        return null;
    }
}