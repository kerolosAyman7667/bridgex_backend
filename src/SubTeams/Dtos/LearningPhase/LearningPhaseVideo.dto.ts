import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";

export class LearningPhaseVideoDto
{
    @AutoMap()
    @ApiProperty()
    Id:string

    @AutoMap()
    @ApiProperty()
    Name:string

    @AutoMap()
    @ApiProperty()
    Desc:string

    @AutoMap()
    @ApiProperty()
    File:string

    @ApiProperty()
    @AutoMap()
    Duration:number = 0
    
    @ApiProperty()
    @AutoMap()
    IsCompleted:boolean = false

    @ApiProperty()
    @AutoMap()
    WatchedDuration:number = 0
    
    @ApiProperty()
    @AutoMap()
    CreatedAt:Date
}