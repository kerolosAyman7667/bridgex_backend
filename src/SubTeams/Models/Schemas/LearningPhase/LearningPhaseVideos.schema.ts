import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { LearningPhaseSections } from "../../LearningPhase/LearningPhaseSections.entity";
import { SubTeams } from "../../SubTeams.entity";
import { LearningPhaseVideos } from "../../LearningPhase/LearningPhaseVideos.entity";
import { UserProgress } from "../../LearningPhase/UserProgress.entity";

export class LearningPhaseVideosSchema extends Schema<LearningPhaseVideos> {
    constructor() {
        super({
            target: LearningPhaseVideos,
            name: LearningPhaseVideos.name,
            columns: {
                Name: {
                    type: "varchar",
                    length: 3000,
                    nullable: false,
                },
                SectionId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                File:{
                    type:"varchar",
                    length: 3000,
                    nullable: false,
                },
                Desc:{
                    type:"varchar",
                    length:3000,
                    nullable:true
                },
                Duration:{
                    type:"decimal",
                    precision: 12, // total digits
                    scale: 2,     // digits after decimal
                    nullable:true,
                }
            },
            relations: {
                Section: {
                    type: "many-to-one",
                    target: LearningPhaseSections.name,
                    joinColumn: { name: GetKey<LearningPhaseVideos>("SectionId"),referencedColumnName:GetKey<LearningPhaseSections>("Id")}, 
                    inverseSide:GetKey<LearningPhaseSections>("Videos"),
                    onDelete: "RESTRICT",
                },
                Progress:{
                    type: "one-to-many",
                    target: UserProgress.name,
                    inverseSide:GetKey<UserProgress>("Video"),
                    onDelete: "CASCADE",
                }
            },
        })
    }
}

export default new LearningPhaseVideosSchema();
