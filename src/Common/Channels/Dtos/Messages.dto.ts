import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";
import { UserPreviewWithIdDto } from "src/Users/Dtos/UserPreview.dto";

export class MessagesDto
{
    @AutoMap()
    @ApiProperty()
    Id:string
    
    @AutoMap(()=>UserPreviewWithIdDto)
    @ApiProperty()
    User:UserPreviewWithIdDto;

    @AutoMap(()=>MessagesDto)
    @ApiProperty()
    ReplyTo?:MessagesDto

    @ApiProperty()
    @AutoMap()
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