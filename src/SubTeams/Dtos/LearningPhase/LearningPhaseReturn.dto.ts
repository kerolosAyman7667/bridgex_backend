import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { LearningPhaseSectionDto } from "./LearningPhaseSection.dto";

export class LearningPhaseReturnDto
{
    @AutoMap()
    @ApiProperty()
    TiTle:string

    @AutoMap()
    @ApiProperty()
    Desc:string

    @ApiProperty()
    CanModify:boolean = false

    @AutoMap(()=> LearningPhaseSectionDto)
    @ApiProperty()
    Sections: LearningPhaseSectionDto[] = []
}