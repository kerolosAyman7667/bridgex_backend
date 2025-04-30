import { AutoMap } from "@automapper/classes";
import { TeamsConstants } from "../TeamsConstants";
import { ImagesDto } from "../../Common/DTOs/Images.dto";
import { MediaCreateDto } from "../../Common/DTOs/MediaCreatedto";
import { ApiProperty } from "@nestjs/swagger";
import { TeamAchievementDto } from "./TeamAchievement";
import { TeamLeaderDto } from "./TeamLeader";
import { ICanModify } from "src/Common/Generic/Contracts/ICanModify";
import { UserPreviewWithEmailDto } from "src/Users/Dtos/UserPreview.dto";
import { SubTeamCardDto } from "src/SubTeams/Dtos/SubTeamCard.dto";
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";

export class TeamDto {

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

    @AutoMap()
    @ApiProperty()
    Logo: string = TeamsConstants.DefaultLogo

    @ApiProperty()
    @AutoMap()
    MembersCount:number = 0
    
    @AutoMap(() => [ImagesDto])
    @ApiProperty({type:[ImagesDto]})
    Images: ImagesDto[] = []

    @AutoMap(() => [MediaCreateDto])
    @ApiProperty({type:[MediaCreateDto]})
    MediaLinks: MediaCreateDto[] = []

    @AutoMap(() => [ChannelDto])
    @ApiProperty({type:[ChannelDto]})
    Channels: ChannelDto[] = []

    @AutoMap(() => [TeamAchievementDto])
    @ApiProperty({type:[TeamAchievementDto]})
    Achievements: TeamAchievementDto[] = []

    @AutoMap(() => [TeamLeaderDto])
    @ApiProperty({type:[TeamLeaderDto]})
    Leaders: TeamLeaderDto[] = []

    @AutoMap()
    @ApiProperty()
    CreatedAt: Date

    @ApiProperty()
    @AutoMap(()=> UserPreviewWithEmailDto)
    Leader:UserPreviewWithEmailDto

    @ApiProperty()
    @AutoMap(()=> SubTeamCardDto)
    SubTeams:SubTeamCardDto
}

export class TeamWithCanModifyDto extends TeamDto implements ICanModify
{
    @ApiProperty({description:`
           if true you can do any modification to team and sub teams 
           can add a sub team
           can't add a team
           can't do any modification to community 
        `})
    public CanModify: boolean = false;

    @ApiProperty({description:"This mean he is a member in a sub team"})
    public IsMember: boolean = false;
}
