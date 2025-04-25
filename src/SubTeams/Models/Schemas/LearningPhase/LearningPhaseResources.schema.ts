import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { LearningPhaseSections } from "../../LearningPhase/LearningPhaseSections.entity";
import { SubTeams } from "../../SubTeams.entity";
import { LearningPhaseResources } from "../../LearningPhase/LearningPhaseResources.entity";

export class LearningPhaseResourcesSchema extends Schema<LearningPhaseResources> {
    constructor() {
        super({
            target: LearningPhaseResources,
            name: LearningPhaseResources.name,
            columns: {
                Name: {
                    type: "varchar",
                    length: 50,
                    nullable: false,
                },
                SectionId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                File:{
                    type:"varchar",
                    length: 500,
                    nullable: false,
                },
            },
            relations: {
                Section: {
                    type: "many-to-one",
                    target: LearningPhaseSections.name,
                    joinColumn: { name: GetKey<LearningPhaseResources>("SectionId"),referencedColumnName:GetKey<LearningPhaseSections>("Id")}, 
                    inverseSide:GetKey<LearningPhaseSections>("Resources"),
                    onDelete: "RESTRICT",
                },
            },
        })
    }
}

export default new LearningPhaseResourcesSchema();
