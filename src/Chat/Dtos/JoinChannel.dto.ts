import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class JoinChannelDto
{
    @IsString()
    @IsNotEmpty()
    ChannelId:string

    @IsString()
    @IsOptional()
    @Transform(({value})=> value ? value : null)
    ThreadId:string = null

    @IsBoolean()
    IsSubTeam:boolean = true
}