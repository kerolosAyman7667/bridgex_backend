import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { SubTeams } from "../SubTeams.entity";
import { Communities } from "src/Communities/Models/Communities.entity";
import { SubTeamImages } from "../SubTeamImages.entity";
import { SubTeamChannels } from "../SubTeamChannels.entity";
import { SubTeamsMedia } from "../SubTeamsMedia.entity";
import { Teams } from "src/Teams/Models/Teams.entity";
import { SubTeamMembers } from "../SubTeamMembers.entity";
import { LearningPhaseSections } from "../LearningPhase/LearningPhaseSections.entity";

export class SubTeamsSchema extends Schema<SubTeams> {
    constructor() {
        super({
            target: SubTeams,
            name: SubTeams.name,
            columns: {
                Name: {
                    type: "varchar",
                    length: 200,
                    nullable: false,
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
                Logo: {
                    type: "varchar",
                    length: 200,
                    nullable: true,
                },
                Vision: {
                    type: "varchar",
                    length: 3000,
                    nullable: true,
                },
                CommunityId: {
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                TeamId: {
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                JoinLink: {
                    type: "varchar",
                    length: 1000,
                    nullable: true,
                },
                LearningPhaseTitle: {
                    type: "varchar",
                    length: 200,
                    nullable: false,
                },
                LearningPhaseDesc: {
                    type: "varchar",
                    length: 3000,
                    nullable: true,
                },
                KnowledgeBaseId:{
                    type:"varchar",
                    length: 50,
                    nullable: true,
                },
            },
            indices:[
                {unique:true,columns:[GetKey<SubTeams>("TeamId"),GetKey<SubTeams>("Name")]},
            ],
            relations: {
                Community: {
                    type: "many-to-one",
                    target: Communities.name,
                    joinColumn: { name: GetKey<SubTeams>("CommunityId"), referencedColumnName: GetKey<Communities>("Id") },
                    onDelete: "RESTRICT",
                },
                MediaLinks: {
                    type: "one-to-many",
                    target: SubTeamsMedia.name,
                    inverseSide: GetKey<SubTeamsMedia>("SubTeam"),
                    onDelete: "CASCADE",
                },
                Images: {
                    type: "one-to-many",
                    target: SubTeamImages.name,
                    inverseSide: GetKey<SubTeamImages>("SubTeam"),
                    onDelete: "RESTRICT",
                },
                Channels: {
                    type: "one-to-many",
                    target: SubTeamChannels.name,
                    inverseSide: GetKey<SubTeamChannels>("SubTeam"),
                    onDelete: "CASCADE",
                },
                Team: {
                    type: "many-to-one",
                    target: Teams.name,
                    joinColumn: { name: GetKey<SubTeams>("TeamId"), referencedColumnName: GetKey<Teams>("Id") },
                    onDelete: "CASCADE",
                },
                Members: {
                    type: "one-to-many",
                    target: SubTeamMembers.name,
                    inverseSide: GetKey<SubTeamMembers>("SubTeam"),
                    onDelete: "CASCADE",
                },
                LearningPhaseSections: {
                    type: "one-to-many",
                    target: LearningPhaseSections.name,
                    inverseSide: GetKey<LearningPhaseSections>("SubTeam"),
                    onDelete: "RESTRICT",
                },
            },
        })
    }
}

export default new SubTeamsSchema();