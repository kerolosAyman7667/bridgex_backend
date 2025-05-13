import { AutoMap } from "@automapper/classes";
import { SubTeamsConstants } from "../SubTeamsConstants";
import { ImagesDto } from "../../Common/DTOs/Images.dto";
import { MediaCreateDto } from "../../Common/DTOs/MediaCreatedto";
import { ApiProperty } from "@nestjs/swagger";
import { ICanModify } from "src/Common/Generic/Contracts/ICanModify";
import { UserPreviewDto } from "src/Users/Dtos/UserPreview.dto";
import { MemberReturnDto } from "./SubTeamMembersDtos/MemberReturn.dto";
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";
import { CommunityBasicDto } from "src/Communities/Dtos/CommunityBasic.dto";
import { TeamBasicDto } from "src/Teams/Dtos/TeamBasic.dto";

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

    @AutoMap(() => [ChannelDto])
    @ApiProperty({type:[ChannelDto]})
    Channels: ChannelDto[] = []

    @AutoMap(() => [MemberReturnDto])
    @ApiProperty({type:[MemberReturnDto]})
    Leaders: MemberReturnDto[] = []

    @AutoMap()
    @ApiProperty()
    CreatedAt: Date

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