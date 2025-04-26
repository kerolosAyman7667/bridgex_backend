import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";

export class SubTeamCardDto
{
    @AutoMap()
    @ApiProperty()
    Id:string
    
    @AutoMap()
    @ApiProperty()
    Logo:string

    @AutoMap()
    @ApiProperty()
    Name:string

    @AutoMap()
    @ApiProperty()
    DescShort:string

    @ApiProperty()
    @AutoMap()
    MembersCount:number = 0
}