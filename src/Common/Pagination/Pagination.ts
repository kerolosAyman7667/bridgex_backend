import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, Max, Min } from "class-validator";

export enum SortType{
    DESC="desc",ASC="asc"
}

export abstract class Pagination
{
    @IsNumber()
    @Min(1)
    @Type(() => Number) 
    @ApiProperty({required:false,default:1})
    Page:number = 1

    @IsNumber()
    @Max(100)
    @Type(() => Number) 
    @ApiProperty({required:false,default:15})
    Take:number = 15

    abstract SortField:string

    @IsEnum(SortType)
    @ApiProperty({required:false,default:SortType.DESC})
    SortType:SortType = SortType.DESC
}