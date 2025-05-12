import { AutoMap } from "@automapper/classes"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsString, MaxLength, IsNotEmpty, IsArray } from "class-validator"
import { MediaCreateDto } from "./MediaCreatedto"

export class CoreUpdateDto
{
    @IsString()
    @MaxLength(3000,{message:"Vision maximum length is 3000"})
    @IsNotEmpty({message:"Vision must be not empty"})
    @ApiProperty({
        name:"Vision",
        maxLength:3000,
        type:"string",
        nullable:false,
        required:true
    })
    @AutoMap()
    Vision:string

    @IsString()
    @MaxLength(1000,{message:"DescShort maximum length is 500"})
    @IsNotEmpty({message:"DescShort must be not empty"})
    @ApiProperty({
        name:"DescShort",
        maxLength:1000,
        type:"string",
        nullable:false,
        required:true
    })
    @AutoMap()
    DescShort:string

    @IsString()
    @MaxLength(3000,{message:"Desc maximum length is 325"})
    @IsNotEmpty({message:"Desc must be not empty"})
    @ApiProperty({
        name:"Desc",
        maxLength:3000,
        type:"string",
        nullable:false,
        required:true
    })
    @AutoMap()
    Desc:string

    //TODO fix this validation
    @Type(() => MediaCreateDto)
    @IsArray()
    //@ValidateNested({ each: true })
    @ApiProperty({
        name:"MediaLinks",
        type:[MediaCreateDto],
    })
    MediaLinks:MediaCreateDto[] = []
}