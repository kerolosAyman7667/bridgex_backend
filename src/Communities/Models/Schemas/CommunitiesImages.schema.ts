import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { Communities } from "../Communities.entity";
import { CommunitiesImages } from "../CommunitiesImages.entity";
import { GetKey } from "src/Common/GetKeyFrom";

export class CommunitiesImagesSchema extends Schema<CommunitiesImages> {
    constructor() {
        super({
            target: CommunitiesImages,
            name: CommunitiesImages.name,
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
                    joinColumn: { name: GetKey<CommunitiesImages>("CommunityId"),referencedColumnName:GetKey<Communities>("Id")}, 
                    inverseSide:GetKey<Communities>("Images"),
                    onDelete: "RESTRICT",
                },
            },
        })
    }
}

export default new CommunitiesImagesSchema();
