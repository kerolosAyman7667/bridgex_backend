import { AutoMap } from "@automapper/classes";
import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsStrongPassword, MaxLength } from "class-validator";

export const PassDecorador = ()=> applyDecorators(
    IsString({ message: "Enter a valid password" }),
    IsNotEmpty({ message: "Enter a valid password" }),
    IsStrongPassword({ minLength: 8, minLowercase: 1, minNumbers: 1, minSymbols: 1, minUppercase: 1 }, { message: "Enter a valid password" }),
    MaxLength(20, { message: "Enter a valid password" }),
    ApiProperty({
        type: "string",
        nullable: false,
        required: true,
        minLength: 8,
        maxLength: 20,
    }),
)
