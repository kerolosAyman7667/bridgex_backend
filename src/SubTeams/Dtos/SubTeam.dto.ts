import { AutoMap } from "@automapper/classes";
import { SubTeamsConstants } from "../SubTeamsConstants";
import { ImagesDto } from "../../Common/DTOs/Images.dto";
import { MediaCreateDto } from "../../Common/DTOs/MediaCreatedto";
import { ApiProperty } from "@nestjs/swagger";
import { SubTeamChannelDto } from "./SubTeamChannel";
import { ICanModify } from "src/Common/Generic/Contracts/ICanModify";
import { UserPreviewDto } from "src/Users/Dtos/UserPreview.dto";
import { MemberReturnDto } from "./SubTeamMembersDtos/MemberReturn.dto";

export class SubTeamDto {

    @AutoMap()
    @ApiProperty()
    Id: string

    @AutoMap()
    @ApiProperty()
    Name: string

    @AutoMap()
    @ApiProperty()
    Desc: string

    @AutoMap()
    @ApiProperty()
    DescShort: string

    @AutoMap()
    @ApiProperty()
    Vision: string

    @ApiProperty()
    IsMember:boolean = false
    
    @AutoMap()
    @ApiProperty()
    Logo: string = SubTeamsConstants.DefaultLogo

    @AutoMap(() => [ImagesDto])
    @ApiProperty({type:[ImagesDto]})
    Images: ImagesDto[] = []

    @AutoMap(() => [MediaCreateDto])
    @ApiProperty({type:[MediaCreateDto]})
    MediaLinks: MediaCreateDto[] = []

    @AutoMap(() => [SubTeamChannelDto])
    @ApiProperty({type:[SubTeamChannelDto]})
    Channels: SubTeamChannelDto[] = []

    @AutoMap(() => [SubTeamChannelDto])
    @ApiProperty({type:[SubTeamChannelDto]})
    Leaders: MemberReturnDto[] = []

    @AutoMap()
    @ApiProperty()
    CreatedAt: Date

    @ApiProperty()
    @AutoMap()
    MembersCount:number = 0
}


export class SubTeamWithCanModifyDto extends SubTeamDto implements ICanModify
{
    @ApiProperty({description:`
        if true you can do any modification to sub teams 
        can't add community 
        can't add a sub team
        can't add a team
    `})
    public CanModify: boolean;

    @ApiProperty()
    JoinLink:string
}