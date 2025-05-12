import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { SubTeams } from "../SubTeams.entity";
import { SubTeamChannels } from "../SubTeamChannels.entity";

export class SubTeamChannelsSchema extends Schema<SubTeamChannels> {
    constructor() {
        super({
            target: SubTeamChannels,
            name: SubTeamChannels.name,
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
                }
            },
            relations: {
                SubTeam: {
                    type: "many-to-one",
                    target: SubTeams.name,
                    joinColumn: { name: GetKey<SubTeamChannels>("SubTeamId"),referencedColumnName:GetKey<SubTeams>("Id")}, 
                    inverseSide:GetKey<SubTeams>("Channels"),
                    onDelete: "CASCADE",
                },
            },
        })
    }
}

export default new SubTeamChannelsSchema();
