import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { CommunityBasicDto } from "src/Communities/Dtos/CommunityBasic.dto";
import { UserPreviewWithEmailDto } from "src/Users/Dtos/UserPreview.dto";

export class TeamCardDto
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

    @ApiProperty({type:UserPreviewWithEmailDto})
    @AutoMap(()=> UserPreviewWithEmailDto)
    Leader:UserPreviewWithEmailDto

    @ApiProperty({type:CommunityBasicDto})
    @AutoMap(()=> CommunityBasicDto)
    Community: CommunityBasicDto
}