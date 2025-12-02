import { AutoMap } from "@automapper/classes"
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export class TeamAchievementCreateDto
{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    public Title:string
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(3000)
    public Desc:string
    
    /**
   * DON'T USE
   * this Property only exist to pass class validator verification on it 
   */
    @ApiHideProperty()
    @IsOptional()
    public file?: any;
}

export class TeamAchievementDto
{
    @AutoMap()
    @ApiProperty()
    Id: string

    @AutoMap()
    @ApiProperty()
    Title: string

    @AutoMap()
    @ApiProperty()
    Desc: string

    @AutoMap()
    @ApiProperty()
    ImageLink?:string    
}