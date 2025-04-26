import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsDateString, IsEmail, IsOptional } from "class-validator"

export class AddMemberDto
{
    @ApiProperty()
    @IsEmail()
    public UserEmail:string

    @ApiProperty()
    @IsBoolean()
    public IsHead:boolean = false

    @ApiProperty()
    @IsDateString()
    @IsOptional()
    public JoinDate:Date = new Date()
}