import { ApiProperty } from "@nestjs/swagger";
import { MaxLength, MinLength } from "class-validator";

export class CreateResourceDto {
    @ApiProperty({
        maxLength: 200,
        minLength: 5,
        required: true
    })
    @MaxLength(200)
    @MinLength(5)
    Name: string
}