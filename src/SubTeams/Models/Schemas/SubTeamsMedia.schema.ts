import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { SubTeamsMedia } from "../SubTeamsMedia.entity";
import { GetKey } from "src/Common/GetKeyFrom";
import { SubTeams } from "../SubTeams.entity";

export class SubTeamsMediaSchema extends Schema<SubTeamsMedia> {
    constructor() {
        super({
            target: SubTeamsMedia,
            name: SubTeamsMedia.name,
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
                    joinColumn: { name: GetKey<SubTeamsMedia>("SubTeamId"),referencedColumnName:GetKey<SubTeams>("Id")}, 
                    inverseSide:GetKey<SubTeams>("MediaLinks"),
                    onDelete: "CASCADE",
                },
            },
        })
    }
}

export default new SubTeamsMediaSchema();
