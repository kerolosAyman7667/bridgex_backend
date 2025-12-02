import { ApiProperty } from "@nestjs/swagger";
import { ChannelDto } from "src/Common/Channels/Dtos/Channel.dto";
import { CommunityCardDto } from "src/Communities/Dtos/CommunityCard.dto";
import { SubTeamCardDto } from "src/SubTeams/Dtos/SubTeamCard.dto";
import { TeamCardDto } from "src/Teams/Dtos/TeamCard.dto";

export class UserDataDto
{
    @ApiProperty()
    Communities:CommunityCardDto[] = []

    @ApiProperty()
    Teams:TeamCardDto[] = []

    @ApiProperty()
    SubTeams:SubTeamCardDto[] = []

    @ApiProperty()
    Channels:ChannelDto[] = []
}