import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { GetKey } from "src/Common/GetKeyFrom";
import { SubTeamChannels } from "../SubTeamChannels.entity";
import { SubTeamChannelChats } from "../SubTeamChannelChats.entity";
import { Users } from "src/Users/Models/Users.entity";

export class SubTeamChannelChatsSchema extends Schema<SubTeamChannelChats> {
    constructor() {
        super({
            target: SubTeamChannelChats,
            name: SubTeamChannelChats.name,
            columns: {
                Text: {
                    type: "text",
                    nullable: false,
                },
                ChannelId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                UserId:{
                    type: "varchar",
                    length: 32,
                    nullable: false,
                },
                Deleted:{
                    type:"boolean",
                    default:false
                },
                ThreadId:{
                    type: "varchar",
                    length: 32,
                    nullable: true, 
                },
                ThreadStart:{
                    type:"boolean",
                    default:false
                },
                ReplyToId:{
                    type: "varchar",
                    length: 32,
                    nullable: true,
                    unique:false
                }
            },
            relations: {
                Channel: {
                    type: "many-to-one",
                    target: SubTeamChannels.name,
                    joinColumn: { name: GetKey<SubTeamChannelChats>("ChannelId"),referencedColumnName:GetKey<SubTeamChannels>("Id")}, 
                    onDelete: "CASCADE",
                },
                User: {
                    type: "many-to-one",
                    target: Users.name,
                    joinColumn: { name: GetKey<SubTeamChannelChats>("UserId"),referencedColumnName:GetKey<Users>("Id") }, 
                    onDelete: "RESTRICT",
                },
                ReplyTo: {
                    type: "many-to-one",
                    target: SubTeamChannelChats.name,
                    joinColumn: { name: GetKey<SubTeamChannelChats>("ReplyToId"),referencedColumnName:GetKey<SubTeamChannelChats>("Id") }, 
                    inverseSide: GetKey<SubTeamChannelChats>("Replies"),
                    onDelete: "CASCADE",
                },
                Replies:{
                    type: "one-to-many",
                    target: SubTeamChannelChats.name,
                    joinColumn: { name: GetKey<SubTeamChannelChats>("ReplyToId"),referencedColumnName:GetKey<SubTeamChannelChats>("Id") }, 
                    inverseSide: GetKey<SubTeamChannelChats>("ReplyTo"),
                    onDelete: "CASCADE",
                }
            },
        })
    }
}

export default new SubTeamChannelChatsSchema();
