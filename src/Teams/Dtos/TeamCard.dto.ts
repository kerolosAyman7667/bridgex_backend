import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
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

    @ApiProperty()
    @AutoMap(()=> UserPreviewWithEmailDto)
    Leader:UserPreviewWithEmailDto
}