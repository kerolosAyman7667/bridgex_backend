import { AutoMap } from "@automapper/classes";
import { EntityBase } from "src/Common/EntityBase";
import { Teams } from "./Teams.entity";

export class TeamChannels extends EntityBase 
{
    @AutoMap()
    Name!:string

    @AutoMap()
    IsPublic:boolean = false

    @AutoMap()
    TeamId!:string

    @AutoMap(()=> Teams)
    Team?:Teams
}