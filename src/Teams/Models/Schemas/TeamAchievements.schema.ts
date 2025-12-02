import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { Teams } from "../Teams.entity";
import { TeamAchievements } from "../TeamAchievements.entity";

export class TeamAchievementsSchema extends Schema<TeamAchievements> {
    constructor() {
        super({
            target: TeamAchievements,
            name: TeamAchievements.name,
            columns: {
                Title: {
                    type: "varchar",
                    length: 3000,
                    nullable: false,
                },
                ImageLink:{
                    type: "varchar",
                    length: 3000,
                    nullable: false,
                },
                Desc:{
                    type: "varchar",
                    length: 3000,
                    nullable: true,
                },
                TeamId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                }
            },
            relations: {
                Team: {
                    type: "many-to-one",
                    target: Teams.name,
                    joinColumn: { name: GetKey<TeamAchievements>("TeamId"),referencedColumnName:GetKey<Teams>("Id")}, 
                    inverseSide:GetKey<Teams>("Achievements"),
                    onDelete: "RESTRICT",
                },
            },
        })
    }
}

export default new TeamAchievementsSchema();
