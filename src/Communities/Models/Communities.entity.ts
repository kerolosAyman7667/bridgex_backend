import { EntityBase } from "src/Common/EntityBase";
import { AutoMap } from "@automapper/classes";
import { Users } from "src/Users/Models/Users.entity";
import { CommunitiesImages } from "./CommunitiesImages.entity";
import { CommunitiesMedia } from "./CommunitiesMedia.entity";
import { CommunitiesConstants } from "../CommunitiesConstants";
import { Teams } from "src/Teams/Models/Teams.entity";
import { SubTeams } from "src/SubTeams/Models/SubTeams.entity";

export class Communities extends EntityBase {

    @AutoMap()
    Name!: string

    @AutoMap()
    Desc: string

    @AutoMap()
    DescShort: string

    @AutoMap()
    Vision: string

    @AutoMap()
    Logo: string = CommunitiesConstants.DefaultLogo

    @AutoMap()
    LeaderId!: string

    @AutoMap(() => Users)
    Leader?: Users

    @AutoMap(() => [CommunitiesImages])
    Images?: CommunitiesImages[]

    @AutoMap(() => [CommunitiesMedia])
    MediaLinks?: CommunitiesMedia[]

    @AutoMap(() => [Teams])
    Teams?: Teams[]

    @AutoMap(() => [SubTeams])
    SubTeams?: SubTeams[]

    @AutoMap()
    get MembersCount() : number
    {
        let count = 0;
        if(this.SubTeams)
        {
            count = this.SubTeams?.reduce((prev:number,current:SubTeams)=> current.Members.filter(x=> x.JoinDate && !x.LeaveDate).length + prev,0);
        }
        //community Admin
        count += 1
        //teams admins
        if(this.Teams)
        {
            count += this.Teams.length;
        }
        return count;
    }
}