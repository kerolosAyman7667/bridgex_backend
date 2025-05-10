import { AutoMap } from "@automapper/classes";
import { EntityBase } from "src/Common/EntityBase";
import { TeamChannels } from "./TeamChannels.entity";
import { Users } from "src/Users/Models/Users.entity";

export class TeamChannelChats extends EntityBase 
{
    @AutoMap()
    Text!:string
    
    @AutoMap()
    get Message():string
    {
        return this.Deleted ? "Deleted message" : this.Text;
    }

    @AutoMap()
    UserId!: string

    Deleted:boolean = false

    @AutoMap()
    ThreadId?:string = null

    @AutoMap()
    ThreadStart:boolean = false

    @AutoMap()
    ReplyToId?:string = null

    @AutoMap(()=> TeamChannelChats)
    ReplyTo?:TeamChannelChats

    @AutoMap(()=> [TeamChannelChats])
    Replies?:TeamChannelChats[]

    @AutoMap(() => Users)
    User?: Users

    @AutoMap()
    ChannelId!:string

    @AutoMap(()=> TeamChannels)
    Channel?:TeamChannels
}