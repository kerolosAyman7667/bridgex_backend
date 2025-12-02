import { AutoMap } from "@automapper/classes"
import { ApiProperty } from "@nestjs/swagger"

export class CommunityBasicDto
{
    @AutoMap()
    @ApiProperty()
    Id: string

    @AutoMap()
    @ApiProperty()
    Name: string
}