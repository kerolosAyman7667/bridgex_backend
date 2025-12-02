import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { SubTeamImages } from "../SubTeamImages.entity";
import { GetKey } from "src/Common/GetKeyFrom";
import { SubTeams } from "../SubTeams.entity";

export class SubTeamImagesSchema extends Schema<SubTeamImages> {
    constructor() {
        super({
            target: SubTeamImages,
            name: SubTeamImages.name,
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
                SubTeamId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                }
            },
            relations: {
                SubTeam: {
                    type: "many-to-one",
                    target: SubTeams.name,
                    joinColumn: { name: GetKey<SubTeamImages>("SubTeamId"),referencedColumnName:GetKey<SubTeams>("Id")}, 
                    inverseSide:GetKey<SubTeams>("Images"),
                    onDelete: "RESTRICT",
                },
            },
        })
    }
}

export default new SubTeamImagesSchema();
