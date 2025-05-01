import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { SubTeams } from "../SubTeams.entity";
import { SubTeamChannels } from "../SubTeamChannels.entity";
import { SubTeamMembers } from "../SubTeamMembers.entity";
import { Users } from "src/Users/Models/Users.entity";
import { Communities } from "src/Communities/Models/Communities.entity";
import { Teams } from "src/Teams/Models/Teams.entity";

export class SubTeamMembersSchema extends Schema<SubTeamMembers> {
    constructor() {
        super({
            target: SubTeamMembers,
            name: SubTeamMembers.name,
            columns: {
                IsHead: {
                    type: "boolean",
                    nullable: false,
                    default:false
                },
                UserId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                SubTeamId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                TeamId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                CommunityId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                JoinDate:{
                    type:"datetime",
                    nullable:true
                },
                LeaveDate:{
                    type:"datetime",
                    nullable:true
                },
            },
            indices:[
                {unique:true,columns:[GetKey<SubTeamMembers>("SubTeamId"),GetKey<SubTeamMembers>("UserId")]}
            ],
            relations: {
                SubTeam: {
                    type: "many-to-one",
                    target: SubTeams.name,
                    joinColumn: { name: GetKey<SubTeamMembers>("SubTeamId"),referencedColumnName:GetKey<SubTeams>("Id")}, 
                    inverseSide:GetKey<SubTeams>("Members"),
                    onDelete: "CASCADE",
                },
                User:{
                    type: "many-to-one",
                    target: Users.name,
                    joinColumn: { name: GetKey<SubTeamMembers>("UserId"),referencedColumnName:GetKey<Users>("Id")}, 
                    inverseSide:GetKey<Users>("SubTeams"),
                    onDelete: "CASCADE",  
                },               
                Community: {
                    type: "many-to-one",
                    target: Communities.name,
                    joinColumn: { name: GetKey<SubTeamMembers>("CommunityId"),referencedColumnName:GetKey<Communities>("Id")}, 
                    inverseSide:GetKey<Communities>("Members"),
                    onDelete: "CASCADE",
                },
                Team:{
                    type: "many-to-one",
                    target: Teams.name,
                    joinColumn: { name: GetKey<SubTeamMembers>("TeamId"),referencedColumnName:GetKey<Teams>("Id")}, 
                    inverseSide:GetKey<Teams>("Members"),
                    onDelete: "CASCADE",  
                }
            },
        })
    }
}

export default new SubTeamMembersSchema();
