import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { TeamImages } from "../TeamImages.entity";
import { GetKey } from "src/Common/GetKeyFrom";
import { Teams } from "../Teams.entity";

export class TeamsImagesSchema extends Schema<TeamImages> {
    constructor() {
        super({
            target: TeamImages,
            name: TeamImages.name,
            columns: {
                Name: {
                    type: "varchar",
                    length: 3000,
                    nullable: true,
                },
                File:{
                    type: "varchar",
                    length: 3000,
                    nullable: false,
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
                    joinColumn: { name: GetKey<TeamImages>("TeamId"),referencedColumnName:GetKey<Teams>("Id")}, 
                    inverseSide:GetKey<Teams>("Images"),
                    onDelete: "RESTRICT",
                },
            },
        })
    }
}

export default new TeamsImagesSchema();
