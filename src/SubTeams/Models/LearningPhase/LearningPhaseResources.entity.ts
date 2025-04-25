import { AutoMap } from "@automapper/classes";
import { EntityBase } from "src/Common/EntityBase";
import { LearningPhaseSections } from "./LearningPhaseSections.entity";

export class LearningPhaseResources extends EntityBase
{
    @AutoMap()
    Name!:string

    @AutoMap()
    File!:string
    
    @AutoMap()
    SectionId!:string

    AIAssetId:string

    @AutoMap(()=> LearningPhaseSections)
    Section?:LearningPhaseSections
}