import { ApiProperty } from "@nestjs/swagger";
import { MaxLength, MinLength, IsOptional, IsNumber } from "class-validator";

export class CreateSectionDto {
    @ApiProperty({
        maxLength: 15,
        minLength: 5,
        required: true
    })
    @MaxLength(15)
    @MinLength(5)
    Name: string

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsNumber()
    @MinLength(0)
    Number?: number
}