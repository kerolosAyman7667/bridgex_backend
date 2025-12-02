import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, IsNotEmpty, IsEmail, Matches } from "class-validator";

export class CommunityCreateDto 
{
    @IsString()
    @MaxLength(200,{message:"Name maximum length is 200"})
    @IsNotEmpty({message:"Name must be not empty"})
    @ApiProperty({
        name:"Name",
        maxLength:200,
        type:"string",
        nullable:false,
        required:true
    })
    Name:string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        name: "Email",
        type: "string",
        nullable: false,
        required: true,
        uniqueItems:true
    })
    LeaderEmail:string;
}