import { IsString } from "class-validator"

export class TeamSearchId 
{
    @IsString()
    public communityId: string

    @IsString()
    public teamId: string

    constructor(CommunityId: string, teamId: string) {
        this.communityId = CommunityId
        this.teamId = teamId
    }
}

export class TeamSearchIdWithChannelId extends TeamSearchId{
    @IsString()
    public channelId: string
}