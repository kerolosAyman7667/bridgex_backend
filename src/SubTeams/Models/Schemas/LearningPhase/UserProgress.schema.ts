import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { LearningPhaseVideos } from "../../LearningPhase/LearningPhaseVideos.entity";
import { UserProgress } from "../../LearningPhase/UserProgress.entity";
import { Users } from "src/Users/Models/Users.entity";

export class UserProgressSchema extends Schema<UserProgress> {
    constructor() {
        super({
            target: UserProgress,
            name: UserProgress.name,
            columns: {
                UserId: {
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                VideoId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                IsCompleted:{
                    type:"boolean",
                    nullable:false,
                    default:false
                },
                WatchDuration:{
                    type:"decimal",
                    precision: 12, // total digits
                    scale: 2,                   
                    nullable:true,
                }
            },
            relations: {
                User:{
                    type: "many-to-one",
                    target: Users.name,
                    joinColumn: { name: GetKey<UserProgress>("UserId"),referencedColumnName:GetKey<Users>("Id")}, 
                    inverseSide:GetKey<Users>("UserProgress"),
                    onDelete: "CASCADE",
                },
                Video:{
                    type: "many-to-one",
                    target: LearningPhaseVideos.name,
                    joinColumn: { name: GetKey<UserProgress>("VideoId"),referencedColumnName:GetKey<LearningPhaseVideos>("Id")}, 
                    inverseSide:GetKey<LearningPhaseVideos>("Progress"),
                    onDelete: "CASCADE",
                }
            },
        })
    }
}

export default new UserProgressSchema();
