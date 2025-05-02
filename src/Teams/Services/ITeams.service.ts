import { TeamCardDto } from "../Dtos/TeamCard.dto";
import { TeamCreateDto } from "../Dtos/TeamCreate.dto";
import { TeamDto } from "../Dtos/Team.dto";
import { ImageCreateDto } from "../../Common/DTOs/ImageCreate.dto";
import { TeamUpdateDto } from "../Dtos/TeamUpdate.dto";
import { ImagesDto } from "../../Common/DTOs/Images.dto";
import { TeamService } from "./Team.service";
import { LogoDto } from "src/Common/DTOs/Logo.dto";
import { IVerifyLeader } from "src/Common/Generic/Contracts/IVerifyLeader";
import { Teams } from "../Models/Teams.entity";
import { IIsMemberExists } from "src/Common/Generic/Contracts/IIsMemberExists";

export interface ITeamsService extends IVerifyLeader<Teams>, IIsMemberExists {
    /**
     * Creates a new team
     * @param {TeamCreateDto} dataToInsert - The data for creating a new team
     * @param {string} communityId - The community id that the team belongs to
     * @param {string} leaderId - The ID of the leader performing the insert must be community leader
     * @returns {Promise<TeamCardDto>} containing the created team card data
     * @throws {ConflictException} if team name exists or leader already leads another community
     * @throws {BadRequestException} if super admin attempts to be a leader
     */
    Insert(dataToInsert: TeamCreateDto,communityId:string,leaderId:string): Promise<TeamCardDto>;

    /**
     * Retrieves detailed information about a specific team
     * @param {string} id - The ID of the team to retrieve
     * @param {string} communityId - The community id 
     * @param {boolean} includeChannels - boolean to retrive the team channels or not
     * @returns {Promise<TeamDto>} TeamDto containing the community details
     * @throws {NotFoundException} if team is not found or if user is not the community/team leader
     */
    GetTeam(id: string,communityId: string,includeChannels?:boolean): Promise<TeamDto>;

    /**
     * Retrieves all teams in the community
     * @param {string} communityId - The ID of the community
     * @returns {Promise<TeamCardDto[]>} TeamCardDto as array in the community
     * @throws {NotFoundException} if team is not found or if user is not the community/team leader
     */
    GetTeams(communityId: string): Promise<TeamCardDto[]>;

    /**
     * Updates community information
     * @param {string} id - The ID of the community to update
     * @param {TeamUpdateDto} dto - The update data
     * @param {string} leaderId - The ID of the leader performing the update
     * @returns {Promise<void>}
     * @throws {NotFoundException} if team is not found or if user is not the community/team leader
     * @throws {InternalServerErrorException} if update operation fails
     */
    UpdateTeam(id: string, dto: TeamUpdateDto, leaderId: string): Promise<void>;

    /**
     * Updates community Name Or Leader
     * @param {string} id - The ID of the community to update
     * @param {TeamCreateDto} dto - The update data
     * @param {string} leaderId - The ID of the leader performing the update
     * @returns {Promise<void>}
     * @throws {NotFoundException} if team is not found or if user is not the community leader
     */
    Update(id: string, dto: TeamCreateDto, leaderId: string): Promise<void>;

    /**
     * Adds or updates the team logo
     * @param {string} id - The ID of the team
     * @param {Express.Multer.File} files - The logo file to upload
     * @param {string} leaderId - The ID of the leader performing the update
     * @returns {Promise<LogoDto>} containing the updated Logo
     * @throws {NotFoundException} if team is not found or if user is not the community/team leader
     */
    AddLogo(id: string, files: Express.Multer.File, leaderId: string): Promise<LogoDto>;

    /**
     * Adds images to a team
     * @param {string} id - The ID of the team
     * @param {Express.Multer.File[]} files - The image files to upload
     * @param dto - Additional image metadata
     * @param {string} leaderId - The ID of the leader performing the update
     * @returns {Promise<ImagesDto[]>} containing the added community images
     * @throws {BadRequestException} if maximum image limit is exceeded
     * @throws {NotFoundException} if community is not found or if user is not the community leader
     */
    AddImages(id: string, files: Express.Multer.File[], dto: ImageCreateDto, leaderId: string): Promise<ImagesDto[]>;

    /**
     * Deletes a team image
     * @param {string} teamId - The ID of the team
     * @param {string} imageId - The ID of the image to delete
     * @param {string} leaderId - The ID of the leader performing the deletion
     * @returns {Promise<void>} 
     * @throws {NotFoundException} if image is not found or if user is not the community leader
     */
    DeleteImage(teamId: string, imageId: string, leaderId: string): Promise<void>;
} 

export const ITeamsService = Symbol("ITeamsService")


export const ITeamsServiceProvider = {
    provide:ITeamsService,
    useClass:TeamService
}