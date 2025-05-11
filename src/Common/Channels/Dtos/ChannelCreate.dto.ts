import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ChannelCreateDto
{
    @AutoMap()
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    Name: string
}

export class ChannelCreateDtoWithPublic
{
    @AutoMap()
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    Name: string

    @AutoMap()
    @ApiProperty({
        default:false,
        type:"boolean",
        name:"IsPublic"
    })
    @IsBoolean()
    IsPublic: boolean = false
}