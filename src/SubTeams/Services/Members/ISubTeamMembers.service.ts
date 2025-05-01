import { SubTeamsMembersService } from "./SubTeamsMembers.service";
import { PaginationResponce } from "src/Common/Pagination/PaginationResponce.dto";
import { MemberReturnDto } from "../../Dtos/SubTeamMembersDtos/MemberReturn.dto";
import { MemberSearchDto } from "../../Dtos/SubTeamMembersDtos/MemberSearch.dto";
import { JoinLinkDto } from "../../Dtos/SubTeamMembersDtos/JoinLink.dto";
import { IsMemberExistDto } from "src/SubTeams/Dtos/SubTeamMembersDtos/IsMemberExist.dto";

export interface ISubTeamsMembersService {
    /**
     * Add Member
     * @param {string} subTeamId - The ID of the sub team
     * @param {string} userEmail - The user email want to join
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<void>} the created member
     * @throws {NotFoundException} if sub team  is not found or if leaderId is not the community/team leader
     * @throws {ConflictException} if the user already in the sub team 
     * @throws {BadRequestException} if IsHead and true and the user is already Community/Team/SubTeam leader
    */
    AddMember(subTeamId: string, userEmail: string,isHead:boolean,joinDate:Date,leaderId:string): Promise<void>;

    /**
     * Add Member
     * @param {string} subTeamId - The ID of the sub team
     * @param {string} userId - The user want to join
     * @returns {Promise<void>} the created member
     * @throws {NotFoundException} if sub team  is not found or if leaderId is not the community/team leader
     * @throws {ConflictException} if the user already in the sub team 
     * @throws {BadRequestException} if IsHead and true and the user is already Community/Team/SubTeam leader
    */
    Join(subTeamId: string, userId: string): Promise<JoinLinkDto>;

    /**
     * Reverse the IsHead status of the member 
     * @param {string} subTeamId - The ID of the sub team
     * @param {string} memberId - The member Id
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<void>} 
     * @throws {NotFoundException} if member not found or if leaderId is not the community/team leader
     * @throws {BadRequestException} if the new IsHead is true and the user is already Community/Team/SubTeam leader
    */
    UpdateHead(subTeamId: string, memberId: string,leaderId:string):Promise<void>;

    /**
     * Accept user  
     * @param {string} subTeamId - The ID of the sub team
     * @param {string} memberId - The member Id
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<void>} 
     * @throws {ConflictException} already accepted 
     * @throws {NotFoundException} if member not found or left or if leaderId is not the community/team leader
     * @throws {BadRequestException} if the new IsHead is true and the user is already Community/Team/SubTeam leader
    */
    Accept(subTeamId: string, memberId: string,leaderId:string):Promise<void>;


    /**
     * Delete Team Channel
     * @param {string} subTeamId - The ID of the sub team
     * @param {string} memberId - The member Id
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<void>} 
     * @throws {NotFoundException} if user is not found or if leaderId is not the community/team leader
    */
    DeleteMember(subTeamId: string, memberId: string, leaderId: string): Promise<void>;

        /**
     * Delete Team Channel
     * @param {string} subTeamId - The ID of the sub team
     * @param {string} userId - The user Id
     * @returns {Promise<void>} 
     * @throws {NotFoundException} if user is not found or if leaderId is not the community/team leader
    */
    Leave(subTeamId: string, userId: string): Promise<void>;
    
    /**
     * Return all Achievements by team id
     * @param {string} subTeamId - The ID of the team
     * @param {string} leaderId - The ID of the leader trying to the users
     * @param {Pagination} pagination - Users in the sub team paginated
     * @returns {Promise<void>} all sub team members
     * @throws {NotFoundException} if sub team is not found 
     */
    GetBySubTeam(subTeamId: string, leaderId: string,pagination:MemberSearchDto): Promise<PaginationResponce<MemberReturnDto>>;

    /**
     * @param {string} subTeamId - The ID of the team
     * @param userId 
     * @returns { Promise<IsMemberExistDto>} is the user exist in the sub team or not
     */
    IsMemberExist(subTeamId: string, userId: string) : Promise<IsMemberExistDto>

    /**
     * @param {string} teamId - The ID of the team
     * @param userId 
     * @returns { Promise<IsMemberExistDto>} is the user exist in the sub team or not
     */
    IsMemberExistByTeam(teamId: string, userId: string) : Promise<IsMemberExistDto>

    /**
     * @param {string} channelId - The ID of the channel
     * @param userId 
     * @param isSubTeam 
     * @returns { Promise<IsMemberExistDto>} is the user exist in the sub team or not
     */
    IsMemberExistByChannelTeam(channelId: string, userId: string) : Promise<IsMemberExistDto>

        /**
     * @param {string} channelId - The ID of the channel
     * @param userId 
     * @returns { Promise<IsMemberExistDto>} is the user exist in the sub team or not
     */
    IsMemberExistByChannelSubTeam(channelId: string, userId: string) : Promise<IsMemberExistDto>
}

export const ISubTeamsMembersService = Symbol("ISubTeamsMembersService")


export const ISubTeamsMembersServiceProvider = {
    provide:ISubTeamsMembersService,
    useClass:SubTeamsMembersService
}