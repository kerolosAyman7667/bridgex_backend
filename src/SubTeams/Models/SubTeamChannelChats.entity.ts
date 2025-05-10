import { AutoMap } from "@automapper/classes";
import { EntityBase } from "src/Common/EntityBase";
import { SubTeamChannels } from "./SubTeamChannels.entity";
import { Users } from "src/Users/Models/Users.entity";

export class SubTeamChannelChats extends EntityBase 
{
    Text!:string

    @AutoMap()
    get Message():string
    {
        return this.Deleted ? "Deleted message" : this.Text;
    }

    @AutoMap()
    ThreadId?:string = null

    @AutoMap()
    ThreadStart:boolean = false

    @AutoMap()
    ReplyToId?:string = null

    @AutoMap(()=> SubTeamChannelChats)
    ReplyTo?:SubTeamChannelChats
    
    @AutoMap(()=> [SubTeamChannelChats])
    Replies?:SubTeamChannelChats[]

    @AutoMap()
    UserId!: string

    @AutoMap(() => Users)
    User?: Users

    @AutoMap()
    ChannelId!:string

    Deleted:boolean = false

    @AutoMap(()=> SubTeamChannels)
    Channel?:SubTeamChannels
}