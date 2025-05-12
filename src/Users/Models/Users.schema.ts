import { Schema } from "src/Infrastructure/Database/Contracts/Schema";
import { Users } from "./Users.entity";
import { Usertypes } from "./Usertype";
import { Communities } from "src/Communities/Models/Communities.entity";
import { GetKey } from "src/Common/GetKeyFrom";
import { SubTeamMembers } from "src/SubTeams/Models/SubTeamMembers.entity";
import { Teams } from "src/Teams/Models/Teams.entity";
import { UserProgress } from "src/SubTeams/Models/LearningPhase/UserProgress.entity";
import { SubTeamChannelChats } from "src/SubTeams/Models/SubTeamChannelChats.entity";
import { TeamChannelChats } from "src/Teams/Models/TeamChannelChats.entity";


// The maximum first name length was 46. I go with 50. (Of course, only 500 of those were over 25, and they were all cases where data imports resulted in extra junk winding up in that field.)

// Last name was similar to first name.

// Email addresses maxed out at 62 characters. Most of the longer ones were actually lists of email addresses separated by semicolons.

// Street address maxes out at 95 characters. The long ones were all valid.

// Max city length was 35.

//https://stackoverflow.com/a/20986/18119367

export class UsersSchema extends Schema<Users> {
    constructor() {
        super({
            target: Users,
            name: "users",
            columns: {
                Usertype: {
                    type: "enum",
                    enum: Usertypes,
                    default: Usertypes.STUDENT,
                    nullable: false,
                    name: "usertype"
                },
                FirstName: {
                    type: "varchar",
                    length: 50,
                    nullable: false,
                    name: "firstname"
                },
                LastName: {
                    type: "varchar",
                    length: 50,
                    nullable: false,
                    name: "lastname"
                },
                Email: {
                    type: "varchar",
                    length: 62,
                    nullable: false,
                    name: "email",
                    unique:true
                },
                IsSuperAdmin:{
                    type:"boolean",
                    nullable:false,
                    default:false
                },
                VerifyDate:{
                    type:"datetime",
                    nullable:true,
                    default:null
                },
                PhoneNumber: {
                    type: "varchar",
                    length: 15,
                    nullable: false,
                    name: "phonenumber",
                },
                StudentId: {
                    type: "varchar",
                    length: 50,
                    nullable: true,
                    name: "studentid",
                    unique:true
                },
                Password: {
                    type: "varchar",
                    length: 255,
                    nullable: false,
                    name: "password"
                },
                ProfilePhoto:{
                    type: "varchar",
                    length: 255,
                    nullable: true,
                    name: "Profilephoto"
                }
            },
            relations: {
                CommunityLeaders: {
                    type: "one-to-many",
                    target: Communities.name,
                    inverseSide: GetKey<Communities>("Leader"),
                    onDelete: "RESTRICT",
                },
                TeamActiveLeaders:{
                    type: "one-to-many",
                    target: Teams.name,
                    inverseSide: GetKey<Teams>("Leader"),
                    onDelete: "RESTRICT", 
                },
                SubTeams:{
                    type: "one-to-many",
                    target: SubTeamMembers.name,
                    inverseSide: GetKey<SubTeamMembers>("User"),
                    onDelete: "CASCADE", 
                },
                UserProgress:{
                    type: "one-to-many",
                    target: UserProgress.name,
                    inverseSide:GetKey<UserProgress>("User"),
                    onDelete: "CASCADE",
                },
                UserSubTeamChat:{
                    type: "one-to-many",
                    target: SubTeamChannelChats.name,
                    inverseSide:GetKey<SubTeamChannelChats>("User"),
                    onDelete: "CASCADE",
                },
                UserTeamChat:{
                    type: "one-to-many",
                    target: TeamChannelChats.name,
                    inverseSide:GetKey<TeamChannelChats>("User"),
                    onDelete: "CASCADE",
                },
            },
        })
    }
}

export default new UsersSchema();
