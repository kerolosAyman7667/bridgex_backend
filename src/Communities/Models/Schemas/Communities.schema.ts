import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { Communities } from "../Communities.entity";
import { Users } from "src/Users/Models/Users.entity";
import { GetKey } from "src/Common/GetKeyFrom";
import { CommunitiesMedia } from "../CommunitiesMedia.entity";
import { CommunitiesImages } from "../CommunitiesImages.entity";
import { Teams } from "src/Teams/Models/Teams.entity";
import { SubTeams } from "src/SubTeams/Models/SubTeams.entity";
import { SubTeamMembers } from "src/SubTeams/Models/SubTeamMembers.entity";

export class CommunitiesSchema extends Schema<Communities> {
    constructor() {
        super({
            target: Communities,
            name: "communities",
            columns: {
                Name: {
                    type: "varchar",
                    length: 200,
                    nullable: false,
                    unique:true
                },
                Desc: {
                    type: "varchar",
                    length: 3000,
                    nullable: true,
                },
                DescShort: {
                    type: "varchar",
                    length: 3000,
                    nullable: true,
                },
                Logo:{
                    type: "varchar",
                    length: 3000,
                    nullable: true,
                },
                Vision: {
                    type: "varchar",
                    length: 3000,
                    nullable: true,
                },
                LeaderId: {
                    type: "varchar",
                    length: 32,
                    nullable: false,
                    unique:true
                },
            },
            relations: {
                Leader: {
                    type: "many-to-one",
                    target: Users.name,
                    joinColumn: { name: GetKey<Communities>("LeaderId"),referencedColumnName:GetKey<Users>("Id") }, 
                    inverseSide: GetKey<Users>("CommunityLeaders"),
                    onDelete: "RESTRICT",
                },
                MediaLinks: {
                    type: "one-to-many",
                    target: CommunitiesMedia.name,
                    inverseSide:GetKey<CommunitiesMedia>("Community"),
                    onDelete: "CASCADE",
                },
                Images:{
                    type: "one-to-many",
                    target: CommunitiesImages.name,
                    inverseSide:GetKey<CommunitiesImages>("Community"),
                    onDelete: "RESTRICT",
                },
                Teams:{
                    type: "one-to-many",
                    target: Teams.name,
                    inverseSide:GetKey<Teams>("Community"),
                    onDelete: "RESTRICT", 
                },
                SubTeams:{
                    type: "one-to-many",
                    target: SubTeams.name,
                    inverseSide:GetKey<SubTeams>("Community"),
                    onDelete: "RESTRICT", 
                },
                Members:{
                    type: "one-to-many",
                    target: SubTeamMembers.name,
                    inverseSide:GetKey<SubTeamMembers>("Community"),
                    onDelete: "CASCADE", 
                }
            },
        })
    }
}

export default new CommunitiesSchema();