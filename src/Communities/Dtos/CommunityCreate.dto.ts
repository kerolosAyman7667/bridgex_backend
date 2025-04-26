import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, IsNotEmpty, IsEmail, Matches } from "class-validator";

export class CommunityCreateDto 
{
    @IsString()
    @MaxLength(15,{message:"Name maximum length is 15"})
    @IsNotEmpty({message:"Name must be not empty"})
    @ApiProperty({
        name:"Name",
        maxLength:15,
        type:"string",
        nullable:false,
        required:true
    })
    Name:string;

    @IsString()
    @IsEmail()
    @MaxLength(62)
    @IsNotEmpty()
    @ApiProperty({
        name: "Email",
        maxLength: 62,
        type: "string",
        nullable: false,
        required: true,
        uniqueItems:true
    })
    LeaderEmail:string;
}