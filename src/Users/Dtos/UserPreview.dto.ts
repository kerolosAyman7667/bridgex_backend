import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";

export class UserPreviewDto {
    @ApiProperty()
    @AutoMap()
    FirstName: string

    @ApiProperty()
    @AutoMap()
    ProfilePhoto: string;

    constructor(FirstName: string, ProfilePhoto: string) {
        this.FirstName = FirstName
        this.ProfilePhoto = ProfilePhoto
    }
}

export class UserPreviewWithEmailDto extends UserPreviewDto {
    @ApiProperty()
    @AutoMap()
    Email: string

    constructor(FirstName: string, ProfilePhoto: string,Email:string) {
        super(FirstName,ProfilePhoto)

        this.Email = Email
    }
}

export class UserPreviewWithIdDto extends UserPreviewDto {
    @ApiProperty()
    @AutoMap()
    Id: string

    constructor(FirstName: string, ProfilePhoto: string,Id:string) {
        super(FirstName,ProfilePhoto)

        this.Id = Id
    }
}