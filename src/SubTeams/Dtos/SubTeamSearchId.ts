import { IsString } from "class-validator"

export class SubTeamSearchId {
    @IsString()
    public communityId: string

    @IsString()
    public teamId: string

    @IsString()
    public subTeamId: string

    constructor(CommunityId: string, teamId: string, SubTeamId: string) {
        this.communityId = CommunityId
        this.teamId = teamId
        this.subTeamId = SubTeamId
    }
}

export class SubTeamSearchIdWithImageId extends SubTeamSearchId{
    @IsString()
    public imageid: string
}

export class SubTeamSearchIdWithUserId extends SubTeamSearchId {
    @IsString()
    public memberId: string
}

export class SubTeamSearchIdWithSection extends SubTeamSearchId{
    @IsString()
    public sectionId: string
    
    constructor(
        communityId: string,
        teamId: string,
        subTeamId: string,
        sectionId: string
    ) {
        super(communityId,teamId,subTeamId)
        this.sectionId = sectionId
    }
}

export class SubTeamSearchIdWithSectionVideo extends SubTeamSearchIdWithSection {
    @IsString()
    public videoId: string
}

export class SubTeamSearchIdWithSectionResource extends SubTeamSearchIdWithSection{
    @IsString()
    public resourceId: string
}

export class SubTeamSearchIdWithChannelId extends SubTeamSearchId{
    @IsString()
    public channelId: string
}