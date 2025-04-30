import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export class CreateMessageDto
{
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @MaxLength(500)
    Message:string

    @IsString()
    @IsOptional()
    @ApiProperty({description:"if user is replying to other message this is the id of the message if not replying don't provide it or leave it with null"})
    ReplyToId?:string = null

    @IsString()
    @IsOptional()
    @ApiProperty({description:`if user is chatting in a thread this is the id of the thread if not don't provide it or leave it with null`})
    ThreadId?:string = null
}