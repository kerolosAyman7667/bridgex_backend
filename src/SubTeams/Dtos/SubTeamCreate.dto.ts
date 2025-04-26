import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, MaxLength, IsNotEmpty, Matches, IsUrl, IsOptional } from "class-validator";

export class SubTeamCreateDto 
{
    @IsString()
    @MaxLength(15,{message:"Name maximum length is 15"})
    @IsNotEmpty({message:"Name must be not empty"})
    @ApiProperty({
        name:"Name",
        maxLength:15,
        type:"string",
        nullable:false,
        required:true,
    })
    Name:string;

    @MaxLength(500,{message:"Join Link maximum length is 500"})
    @IsUrl()
    @ApiProperty({
        name:"JoinLink",
        maxLength:500,
        type:"string",
        required:true,
    })
    JoinLink:string;
}