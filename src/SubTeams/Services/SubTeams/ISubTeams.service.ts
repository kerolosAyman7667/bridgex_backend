import { SubTeamCardDto } from "../../Dtos/SubTeamCard.dto";
import { SubTeamCreateDto } from "../../Dtos/SubTeamCreate.dto";
import { SubTeamDto } from "../../Dtos/SubTeam.dto";
import { ImageCreateDto } from "../../../Common/DTOs/ImageCreate.dto";
import { SubTeamUpdateDto } from "../../Dtos/SubTeamUpdate.dto";
import { ImagesDto } from "../../../Common/DTOs/Images.dto";
import { SubTeamService } from "./SubTeam.service";
import { LogoDto } from "src/Common/DTOs/Logo.dto";
import { IVerifyLeader } from "src/Common/Generic/Contracts/IVerifyLeader";
import { SubTeams } from "../../Models/SubTeams.entity";
import { SubTeamSearchId } from "../../Dtos/SubTeamSearchId";
import { CreateLearningPhaseDto } from "src/SubTeams/Dtos/LearningPhase/CreateLearningPhase.dto";
import { LearningPhaseReturnDto } from "src/SubTeams/Dtos/LearningPhase/LearningPhaseReturn.dto";

export interface ISubTeamsService extends IVerifyLeader<SubTeams> {
    /**
     * Creates a new sub team
     * @param {TeamCreateDto} dataToInsert - The data for creating a new sub team
     * @param {string} teamId - The team id that the sub team belongs to
     * @param {string} leaderId - The ID of the leader performing the insert
     * @returns {Promise<TeamCardDto>} containing the created team card data
     * @throws {ConflictException} if team name exists or leader already leads another community
     * @throws {BadRequestException} if super admin attempts to be a leader
     */
    Insert(dataToInsert: SubTeamCreateDto,teamId:string,leaderId:string): Promise<SubTeamCardDto>;

    /**
     * Retrieves detailed information about a specific sub team
     * @param {SubTeamSearchId} dto - sub team search dto
     * @returns {Promise<SubTeamDto>} SubTeamDto containing the sub team details
     * @throws {NotFoundException} if sub team is not found or if user is not the community/team leader
     */
    GetSubTeam(dto: SubTeamSearchId): Promise<SubTeamDto>;

    
    /**
     * Retrieves detailed information about a specific sub team
     * @param {string} id - sub team id
     * @returns {Promise<SubTeams>} SubTeams containing the community details
     * @throws {NotFoundException} if sub team is not found or if user is not the community/team leader
     */
    GetSubTeamById(id: string): Promise<SubTeams>;

    /**
     * Retrieves all sub team in the team
     * @param {string} communityId - The ID of the community
     * @param {string} teamId - teamId
     * @returns {Promise<SubTeamCardDto[]>} SubTeamCardDto as array
     */
    GetSubTeams(communityId: string,teamId:string): Promise<SubTeamCardDto[]>;

    /**
     * Updates sub team information
     * @param {SubTeamSearchId} searchDto - sub team search dto
     * @param {SubTeamUpdateDto} dto - The update data
     * @param {string} leaderId - The ID of the leader performing the update
     * @returns {Promise<void>}
     * @throws {NotFoundException} if sub team is not found or if user is not the community/team/sub team leader
     * @throws {InternalServerErrorException} if update operation fails
     */
    Update(searchDto: SubTeamSearchId, dto: SubTeamUpdateDto, leaderId: string): Promise<void>;

    /**
     * Updates sub team Name Or Leader
     * @param {SubTeamSearchId} searchDto - sub team search dto
     * @param {SubTeamCreateDto} dto - The update data
     * @param {string} leaderId - The ID of the leader performing the update
     * @returns {Promise<void>}
     * @throws {NotFoundException} if sub team is not found or if user is not the community/team/sub leader
     */
    UpdateCore(searchDto: SubTeamSearchId, dto: SubTeamCreateDto, leaderId: string): Promise<void>;

    /**
     * Adds or updates the sub team logo
     * @param {SubTeamSearchId} searchDto - The ID of the sub team
     * @param {Express.Multer.File} files - The logo file to upload
     * @param {string} leaderId - The ID of the leader performing the update
     * @returns {Promise<LogoDto>} containing the updated Logo
     * @throws {NotFoundException} if sub team is not found or if user is not the community/team/sub leader
     */
    AddLogo(searchDto: SubTeamSearchId, files: Express.Multer.File, leaderId: string): Promise<LogoDto>;

    /**
     * Adds images to a sub team
     * @param {SubTeamSearchId} searchDto - The ID of the sub team
     * @param {Express.Multer.File[]} files - The image files to upload
     * @param dto - Additional image metadata
     * @param {string} leaderId - The ID of the leader performing the update
     * @returns {Promise<ImagesDto[]>} containing the added community images
     * @throws {BadRequestException} if maximum image limit is exceeded
     * @throws {NotFoundException} if sub team is not found or if user is not the community/team/sub leader
     */
    AddImages(searchDto: SubTeamSearchId, files: Express.Multer.File[], dto: ImageCreateDto, leaderId: string): Promise<ImagesDto[]>;

    /**
     * Deletes a team image
     * @param {string} subTeamId - The ID of the sub team
     * @param {string} imageId - The ID of the image to delete
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<void>} 
     * @throws {NotFoundException} if sub team is not found or if user is not the community/team/sub leader
     */
    DeleteImage(subTeamId: string, imageId: string, leaderId: string): Promise<void>;

    /**
     * @param {string} userId - The ID of the user
     * @param {string} subTeamId - The ID of the sub team
     * @throws {NotFoundException} if sub team is not found or if user is not the community/team/sub leader
     */
    GetLearningPhase(userId:string,subTeamId: string) : Promise<LearningPhaseReturnDto>

    /**
     * Update the name and the description of the learning phase
     * @param {CreateLearningPhaseDto} dto 
     * @param {string} subTeamId - The ID of the sub team
     * @param {string} leaderId - The ID of the leader performing the update
     * @throws {NotFoundException} if sub team is not found or if user is not the community/team/sub leader
     */
    UpdateLearningPhase(dto:CreateLearningPhaseDto,subTeamId: string,leaderId: string) : Promise<void>
} 

export const ISubTeamsService = Symbol("ISubTeamsService")


export const ISubTeamsServiceProvider = {
    provide:ISubTeamsService,
    useClass:SubTeamService
}