import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { LearningPhaseVideoDto } from "./LearningPhaseVideo.dto";
import { LearningPhaseResourceDto } from "./LearningPhaseResourceDto.dto";

export class LearningPhaseSectionDto
{
    @AutoMap()
    @ApiProperty()
    Id:string

    @AutoMap()
    @ApiProperty()
    Name:string

    @AutoMap()
    @ApiProperty()
    Number:number

    @ApiProperty({ type: () => LearningPhaseVideoDto })
    @AutoMap(()=> LearningPhaseVideoDto)
    Videos:LearningPhaseVideoDto[] = []
    
    @ApiProperty({ type: () => LearningPhaseResourceDto })
    @AutoMap(()=> LearningPhaseResourceDto)
    Resources:LearningPhaseResourceDto[] = []
}