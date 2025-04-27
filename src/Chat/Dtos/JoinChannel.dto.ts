import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class JoinChannelDto
{
    @IsString()
    @IsNotEmpty()
    ChannelId:string

    @IsBoolean()
    IsSubTeamChannel:boolean = true
}