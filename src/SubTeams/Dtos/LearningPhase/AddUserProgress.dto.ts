import { IsDecimal, IsNumber, Min } from "class-validator";

export class AddUserProgressDto
{
    @IsNumber()
    @Min(0)
    Duration:number = 0.0;
}