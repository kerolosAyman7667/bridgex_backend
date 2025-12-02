import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { LearningPhaseSections } from "../../LearningPhase/LearningPhaseSections.entity";
import { SubTeams } from "../../SubTeams.entity";
import { LearningPhaseVideos } from "../../LearningPhase/LearningPhaseVideos.entity";
import { LearningPhaseResources } from "../../LearningPhase/LearningPhaseResources.entity";

export class LearningPhaseSectionsSchema extends Schema<LearningPhaseSections> {
    constructor() {
        super({
            target: LearningPhaseSections,
            name: LearningPhaseSections.name,
            columns: {
                Name: {
                    type: "varchar",
                    length: 3000,
                    nullable: false,
                },
                SubTeamId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                Number:{
                    type:"int",
                    default:1,
                    nullable: false,
                },
            },
            relations: {
                SubTeam: {
                    type: "many-to-one",
                    target: SubTeams.name,
                    joinColumn: { name: GetKey<LearningPhaseSections>("SubTeamId"),referencedColumnName:GetKey<SubTeams>("Id")}, 
                    inverseSide:GetKey<SubTeams>("LearningPhaseSections"),
                    onDelete: "RESTRICT",
                },
                Videos:{
                    type: "one-to-many",
                    target: LearningPhaseVideos.name,
                    inverseSide:GetKey<LearningPhaseVideos>("Section"),
                    onDelete: "RESTRICT",
                },
                Resources:{
                    type: "one-to-many",
                    target: LearningPhaseResources.name,
                    inverseSide:GetKey<LearningPhaseResources>("Section"),
                    onDelete: "RESTRICT",
                },
            },
        })
    }
}

export default new LearningPhaseSectionsSchema();
