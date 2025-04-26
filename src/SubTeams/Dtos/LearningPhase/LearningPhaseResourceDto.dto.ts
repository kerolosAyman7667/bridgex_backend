import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";

export class LearningPhaseResourceDto
{
    @AutoMap()
    @ApiProperty()
    Id:string

    @AutoMap()
    @ApiProperty()
    Name:string
    
    @AutoMap()
    @ApiProperty()
    File:string
    
    @ApiProperty()
    @AutoMap()
    CreatedAt:Date
}