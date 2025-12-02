import { ApiProperty } from "@nestjs/swagger";
import { MaxLength, MinLength, IsOptional, IsNumber, Min } from "class-validator";

export class CreateSectionDto {
    @ApiProperty({
        maxLength: 200,
        minLength: 5,
        required: true
    })
    @MaxLength(200)
    @MinLength(5)
    Name: string

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    Number?: number
}