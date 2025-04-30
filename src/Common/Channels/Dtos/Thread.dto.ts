import { AutoMap } from "@automapper/classes"
import { ApiProperty } from "@nestjs/swagger"

export class ThreadDto {
    @AutoMap()
    @ApiProperty()
    ThreadName: string

    @AutoMap()
    @ApiProperty()
    Id: string

    constructor(ThreadName: string, Id: string) {
        this.ThreadName = ThreadName
        this.Id = Id
    }
}