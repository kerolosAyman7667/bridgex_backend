import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ChannelCreateDto
{
    @AutoMap()
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    Name: string
}