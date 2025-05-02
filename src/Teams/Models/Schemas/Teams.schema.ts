import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { Users } from "src/Users/Models/Users.entity";
import { GetKey } from "src/Common/GetKeyFrom";
import { Teams } from "../Teams.entity";
import { Communities } from "src/Communities/Models/Communities.entity";
import { TeamAchievements } from "../TeamAchievements.entity";
import { TeamsMedia } from "../TeamsMedia.entity";
import { TeamImages } from "../TeamImages.entity";
import { TeamChannels } from "../TeamChannels.entity";
import { TeamLeaders } from "../TeamLeaders.entity";
import { SubTeams } from "src/SubTeams/Models/SubTeams.entity";
import { SubTeamMembers } from "src/SubTeams/Models/SubTeamMembers.entity";

export class TeamsSchema extends Schema<Teams> {
    constructor() {
        super({
            target: Teams,
            name: "teams",
            columns: {
                Name: {
                    type: "varchar",
                    length: 15,
                    nullable: false,
                },
                Desc: {
                    type: "varchar",
                    length: 325,
                    nullable: true,
                },
                DescShort: {
                    type: "varchar",
                    length: 80,
                    nullable: true,
                },
                Logo:{
                    type: "varchar",
                    length: 255,
                    nullable: true,
                },
                Vision: {
                    type: "varchar",
                    length: 325,
                    nullable: true,
                },
                CommunityId: {
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                LeaderId: {
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
            },
            indices:[
                {unique:true,columns:[GetKey<Teams>("CommunityId"),GetKey<Teams>("Name")]},
                {unique:true,columns:[GetKey<Teams>("CommunityId"),GetKey<Teams>("LeaderId")]}
            ],
            
            relations: {
                Leader: {
                    type: "many-to-one",
                    target: Users.name,
                    joinColumn: { name: GetKey<Teams>("LeaderId"),referencedColumnName:GetKey<Users>("Id") }, 
                    inverseSide:GetKey<Users>("TeamActiveLeaders"),
                    onDelete: "RESTRICT",
                },
                Community: {
                    type: "many-to-one",
                    target: Communities.name,
                    joinColumn: { name: GetKey<Teams>("CommunityId"),referencedColumnName:GetKey<Communities>("Id") }, 
                    onDelete: "RESTRICT",
                },
                MediaLinks: {
                    type: "one-to-many",
                    target: TeamsMedia.name,
                    inverseSide:GetKey<TeamsMedia>("Team"),
                    onDelete: "CASCADE",
                },
                Images:{
                    type: "one-to-many",
                    target: TeamImages.name,
                    inverseSide:GetKey<TeamImages>("Team"),
                    onDelete: "RESTRICT",
                },
                Achievements:{
                    type: "one-to-many",
                    target: TeamAchievements.name,
                    inverseSide:GetKey<TeamAchievements>("Team"),
                    onDelete: "RESTRICT",
                },
                Channels:{
                    type: "one-to-many",
                    target: TeamChannels.name,
                    inverseSide:GetKey<TeamChannels>("Team"),
                    onDelete: "CASCADE",
                },
                Leaders:{
                    type: "one-to-many",
                    target: TeamLeaders.name,
                    inverseSide:GetKey<TeamLeaders>("Team"),
                    onDelete: "CASCADE",
                },
                SubTeams:{
                    type: "one-to-many",
                    target: SubTeams.name,
                    inverseSide:GetKey<SubTeams>("Team"),
                    onDelete: "CASCADE",
                },
                Members:{
                    type: "one-to-many",
                    target: SubTeamMembers.name,
                    inverseSide:GetKey<SubTeamMembers>("Team"),
                    onDelete: "CASCADE", 
                }
            },
        })
    }
}

export default new TeamsSchema();