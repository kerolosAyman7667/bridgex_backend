import { CommunityCardDto } from "../Dtos/CommunityCard.dto";
import { CommunityCreateDto } from "../Dtos/CommunityCreate.dto";
import { CommunityDto, CommunityWithCanModifyDto } from "../Dtos/Community.dto";
import { CommunitySearchDto } from "../Dtos/CommunitySearch.dto";
import { CommunityUpdateDto } from "../Dtos/CommunityUpdate.dto";
import { PaginationResponce } from "src/Common/Pagination/PaginationResponce.dto";
import { CommunitiesService } from "./Communities.service";
import { ImagesDto } from "src/Common/DTOs/Images.dto";
import { ImageCreateDto } from "src/Common/DTOs/ImageCreate.dto";
import { LogoDto } from "src/Common/DTOs/Logo.dto";
import { IVerifyLeader } from "src/Common/Generic/Contracts/IVerifyLeader";
import { Communities } from "../Models/Communities.entity";

export interface ICommunitiesService extends IVerifyLeader<Communities>{
    /**
     * Creates a new community
     * @param dataToInsert - The data for creating a new community
     * @returns Promise containing the created community card data
     * @throws ConflictException if community name exists or leader already leads another community
     * @throws BadRequestException if super admin attempts to be a leader
     */
    Insert(dataToInsert: CommunityCreateDto): Promise<CommunityCardDto>;

    /**
     * Retrieves paginated community cards based on search criteria
     * @param dto - Search parameters for communities
     * @returns Promise containing paginated community cards
     */
    GetCards(dto: CommunitySearchDto): Promise<PaginationResponce<CommunityCardDto>>;

    /**
     * Retrieves paginated community cards based on search criteria
     * @param dto - Search parameters for communities
     * @param userId
     * @returns Promise containing paginated community cards
     */
    GetUserCommunities(userId:string,dto: CommunitySearchDto): Promise<PaginationResponce<CommunityCardDto>>

    /**
     * Retrieves detailed information about a specific community
     * @param id - The ID of the community to retrieve
     * @returns {Promise<CommunityDto>} containing the community details
     * @throws {NotFoundException} if community is not found
     */
    GetCommunity(id: string): Promise<CommunityDto>;

    /**
     * Updates community information
     * @param id - The ID of the community to update
     * @param dto - The update data
     * @param leaderId - The ID of the leader performing the update
     * @throws {NotFoundException} if community is not found or if user is not the community leader
     * @throws {InternalServerErrorException} if update operation fails
     */
    UpdateCommunities(id: string, dto: CommunityUpdateDto, leaderId: string): Promise<void>;

    /**
     * Updates community Core information Name or leader Email
     * @param {string} id - The ID of the community to update
     * @param {CommunityCreateDto} dto - The update data
     * @throws {NotFoundException} if community is not found or if user is not the community leader
     */
    UpdateCommunityNameAndLeaderEmail(id: string, dto: CommunityCreateDto): Promise<void>;

    /**
     * Adds or updates the community logo
     * @param id - The ID of the community
     * @param files - The logo file to upload
     * @param leaderId - The ID of the leader performing the update
     * @returns {Promise<LogoDto>} containing the updated/Added Logo
     * @throws NotFoundException if community is not found or if user is not the community leader
     */
    AddLogo(id: string, files: Express.Multer.File, leaderId: string): Promise<LogoDto>;

    /**
     * Adds images to a community
     * @param id - The ID of the community
     * @param files - The image files to upload
     * @param dto - Additional image metadata
     * @param leaderId - The ID of the leader performing the update
     * @returns Promise containing the added community images
     * @throws BadRequestException if maximum image limit is exceeded
     * @throws NotFoundException if community is not found or if user is not the community leader
     */
    AddImage(id: string, files: Express.Multer.File[], dto: ImageCreateDto, leaderId: string): Promise<ImagesDto[]>;

    /**
     * Deletes a community image
     * @param communityId - The ID of the community
     * @param imageId - The ID of the image to delete
     * @param leaderId - The ID of the leader performing the deletion
     * @throws NotFoundException if image is not found or if user is not the community leader
     */
    DeleteImage(communityId: string, imageId: string, leaderId: string): Promise<void>;
} 

export const ICommunitiesService = Symbol("ICommunitiesService")


export const ICommunitiesServiceProvider = {
    provide:ICommunitiesService,
    useClass:CommunitiesService
}