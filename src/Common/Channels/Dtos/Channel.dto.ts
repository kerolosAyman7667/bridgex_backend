import { AutoMap } from "@automapper/classes"
import { ApiProperty } from "@nestjs/swagger"

export class ChannelDto
{
    @AutoMap()
    @ApiProperty()
    Id: string

    @AutoMap()
    @ApiProperty()
    Name: string

    @AutoMap()
    @ApiProperty()
    CreatedAt: Date

    @AutoMap()
    @ApiProperty()
    IsPublic:boolean = false
}