import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { TeamsMedia } from "../TeamsMedia.entity";
import { GetKey } from "src/Common/GetKeyFrom";
import { Teams } from "../Teams.entity";

export class TeamsMediaSchema extends Schema<TeamsMedia> {
    constructor() {
        super({
            target: TeamsMedia,
            name: TeamsMedia.name,
            columns: {
                Name: {
                    type: "varchar",
                    length: 3000,
                    nullable: true,
                },
                Link:{
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
                    joinColumn: { name: GetKey<TeamsMedia>("TeamId"),referencedColumnName:GetKey<Teams>("Id")}, 
                    inverseSide:GetKey<Teams>("MediaLinks"),
                    onDelete: "CASCADE",
                },
            },
        })
    }
}

export default new TeamsMediaSchema();
