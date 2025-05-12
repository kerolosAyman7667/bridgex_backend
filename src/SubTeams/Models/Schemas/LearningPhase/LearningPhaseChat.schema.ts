import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { SubTeams } from "../../SubTeams.entity";
import { LearningPhaseChat } from "../../LearningPhase/LearningPhaseChat.entity";
import { Users } from "src/Users/Models/Users.entity";

export class LearningPhaseChatSchema extends Schema<LearningPhaseChat> {
    constructor() {
        super({
            target: LearningPhaseChat,
            name: LearningPhaseChat.name,
            columns: {
                message: {
                    type: "varchar",
                    length: 3000,
                    nullable: false,
                },
                SubTeamId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                response:{
                    type:"json",
                    nullable: false,
                },
                UserId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
            },
            relations: {
                SubTeam: {
                    type: "many-to-one",
                    target: SubTeams.name,
                    joinColumn: { name: GetKey<LearningPhaseChat>("SubTeamId"),referencedColumnName:GetKey<SubTeams>("Id")}, 
                    onDelete: "CASCADE",
                },
                User: {
                    type: "many-to-one",
                    target: Users.name,
                    joinColumn: { name: GetKey<LearningPhaseChat>("UserId"),referencedColumnName:GetKey<Users>("Id")}, 
                    onDelete: "CASCADE",
                },
            },
        })
    }
}

export default new LearningPhaseChatSchema();
