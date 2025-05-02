import { IsMemberExistDto } from "src/Common/DTOs/IsMemberExist.dto";

export interface IIsMemberExists
{
    /**
     * @param {string} id
     * @param userId 
     * @returns { Promise<IsMemberExistDto>} is the user exist in the sub team or not
     */
    IsMemberExist(id: string, userId: string) : Promise<IsMemberExistDto>
}