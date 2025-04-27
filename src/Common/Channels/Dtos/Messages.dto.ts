import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";
import { UserPreviewDto } from "src/Users/Dtos/UserPreview.dto";

export class MessagesDto
{
    @AutoMap()
    @ApiProperty()
    Id:string
    
    @AutoMap(()=>UserPreviewDto)
    @ApiProperty()
    User:UserPreviewDto;

    @ApiProperty()
    Message:string

    @AutoMap()
    @ApiProperty()
    CreatedAt:Date
}

export class CreateMessagesDto
{
    @ApiProperty()
    @IsString()
    @MaxLength(500)
    Message:string
}