import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { CommunityBasicDto } from "src/Communities/Dtos/CommunityBasic.dto";
import { TeamBasicDto } from "src/Teams/Dtos/TeamBasic.dto";

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

    @ApiProperty()
    @AutoMap()
    LearningPhaseTitle: string

    @ApiProperty()
    @AutoMap()
    LearningPhaseDesc?: string

    @ApiProperty({type:[TeamBasicDto]})
    @AutoMap(()=> TeamBasicDto)
    Team:TeamBasicDto

    @ApiProperty({type:[CommunityBasicDto]})
    @AutoMap(()=> CommunityBasicDto)
    Community:CommunityBasicDto
}