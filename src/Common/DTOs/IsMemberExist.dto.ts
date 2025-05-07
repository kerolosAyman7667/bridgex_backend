import { ApiProperty } from "@nestjs/swagger"

export class IsMemberExistDto
{
    @ApiProperty()
    IsLeader:boolean = false

    @ApiProperty()
    IsMember:boolean = false
}