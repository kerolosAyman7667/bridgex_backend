import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, MaxLength, IsNotEmpty, Matches, IsUrl, IsOptional } from "class-validator";

export class SubTeamCreateDto 
{
    @IsString()
    @MaxLength(200,{message:"Name maximum length is 200"})
    @IsNotEmpty({message:"Name must be not empty"})
    @ApiProperty({
        name:"Name",
        maxLength:200,
        type:"string",
        nullable:false,
        required:true,
    })
    Name:string;

    @MaxLength(2000,{message:"Join Link maximum length is 2000"})
    @IsUrl()
    @ApiProperty({
        name:"JoinLink",
        maxLength:2000,
        type:"string",
        required:true,
    })
    JoinLink:string;
}