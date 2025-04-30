import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsNumber, Min } from "class-validator";

export class AddUserProgressDto
{
    @IsNumber()
    @Min(0)
    @ApiProperty()
    Duration:number = 0.0;
}