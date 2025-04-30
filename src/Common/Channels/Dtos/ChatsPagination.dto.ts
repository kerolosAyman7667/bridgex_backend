import { ApiProperty } from "@nestjs/swagger";
import { Equals, IsIn, IsOptional } from "class-validator";
import { GetKey } from "src/Common/GetKeyFrom";
import { Pagination, SortType } from "src/Common/Pagination/Pagination";
import { SubTeams } from "src/SubTeams/Models/SubTeams.entity";

export class ChatsPaginationDto extends Pagination
{
    @IsIn([GetKey<SubTeams>("CreatedAt")])
    @ApiProperty({required:false,default:GetKey<SubTeams>("CreatedAt")})
    SortField: string = GetKey<SubTeams>("CreatedAt");

    @ApiProperty({required:false,default:SortType.DESC})
    @IsOptional()
    @Equals(SortType.DESC)
    SortType: SortType = SortType.DESC;
}