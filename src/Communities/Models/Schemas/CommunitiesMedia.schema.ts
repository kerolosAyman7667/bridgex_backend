import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { Communities } from "../Communities.entity";
import { CommunitiesMedia } from "../CommunitiesMedia.entity";
import { GetKey } from "src/Common/GetKeyFrom";

export class CommunitiesMediaSchema extends Schema<CommunitiesMedia> {
    constructor() {
        super({
            target: CommunitiesMedia,
            name: CommunitiesMedia.name,
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
                CommunityId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                }
            },
            relations: {
                Community: {
                    type: "many-to-one",
                    target: Communities.name,
                    joinColumn: { name: GetKey<CommunitiesMedia>("CommunityId"),referencedColumnName:GetKey<Communities>("Id")}, 
                    inverseSide:GetKey<Communities>("MediaLinks"),
                    onDelete: "CASCADE",
                },
            },
        })
    }
}

export default new CommunitiesMediaSchema();
