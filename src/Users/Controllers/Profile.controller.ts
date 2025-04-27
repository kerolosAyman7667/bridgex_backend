import { BadRequestException, Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Inject, Ip, NotAcceptableException, NotFoundException, Param, Patch, Post, Put, Query, Res, StreamableFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiConsumes, ApiCreatedResponse, ApiGoneResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { Users } from "../Models/Users.entity";
import { UsersService } from "../Services/Users.service";
import { ResponseType } from "src/Common/ResponseType";
import { InjectMapper } from "@automapper/nestjs";
import { Mapper } from "@automapper/core";
import { UserReturnDto } from "../Dtos/UserReturn.dto";
import { CurrentUserDecorator } from "src/AuthModule/CurrentUser.decorator";
import { TokenPayLoad } from "src/AuthModule/Dtos/TokenPayload";
import { JWTGaurd } from "src/AuthModule/Gaurds/JWT.gaurd";
import { ClassValidatorExceptionDto } from "src/Common/ClassValidatorException.dto";
import { UserUpdateDto } from "../Dtos/UserUpdate.dto";
import { UpdatePasswordDto } from "../Dtos/UpdatePassword.dto";
import { FilesInterceptor } from "@nestjs/platform-express/multer";
import { IFileService } from "src/Common/FileUpload/IFile.service";
import { ProfilePhotoFileOptions } from "src/Common/FileUpload/FileTypes/ProfilePhoto.file";

@ApiTags('Users Profile')
@Controller("users/profile")
@UseGuards(JWTGaurd)
export class UsersProfileController {

    constructor(
        private readonly service: UsersService,
        @InjectMapper() private readonly mapper: Mapper,
        @Inject(IFileService)
        private readonly fileServce: IFileService
    ) { }

    @Get()
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserReturnDto })
    @ApiNotFoundResponse()
    async GetMyProfile(
        @CurrentUserDecorator() tokenPayLoad: TokenPayLoad
    ): Promise<ResponseType<UserReturnDto>> {
        const user: Users = await this.service.FindById(tokenPayLoad.UserId, true);
        const userReturn: UserReturnDto = await this.mapper.mapAsync(user, Users, UserReturnDto);

        return new ResponseType<UserReturnDto>(HttpStatus.OK, "logged in successfully", userReturn)
    }

    @Patch()
    @ApiBearerAuth()
    @ApiBody({ type: UserUpdateDto })
    @ApiOkResponse({ type: UserReturnDto })
    @ApiNotFoundResponse()
    @ApiConflictResponse()
    @ApiBadRequestResponse({ type: [ClassValidatorExceptionDto] })
    @UseGuards(JWTGaurd)
    async UpdateMyProfile(
        @Body() dto: UserUpdateDto,
        @CurrentUserDecorator() tokenPayLoad: TokenPayLoad
    ): Promise<ResponseType<UserReturnDto>> {
        const userUpdate: Users = await this.mapper.mapAsync(dto, UserUpdateDto, Users);

        const user: Users = await this.service.Update(tokenPayLoad.UserId, userUpdate);
        const userReturn: UserReturnDto = await this.mapper.mapAsync(user, Users, UserReturnDto);

        return new ResponseType<UserReturnDto>(HttpStatus.OK, "Updated successfully", userReturn)
    }

    @Patch("password")
    @ApiBearerAuth()
    @ApiBody({ type: UpdatePasswordDto })
    @ApiOkResponse()
    @ApiNotFoundResponse()
    @ApiBadRequestResponse({ type: [ClassValidatorExceptionDto] })
    @UseGuards(JWTGaurd)
    async UpdateMyProfilePassword(
        @Body() dto: UpdatePasswordDto,
        @CurrentUserDecorator() tokenPayLoad: TokenPayLoad
    ): Promise<ResponseType<void>> {
        await this.service.UpdatePassword(tokenPayLoad.UserId, dto);

        return new ResponseType<void>(HttpStatus.OK, "Password changed successfully")
    }

    @Post('photo')
    @UseGuards(JWTGaurd)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor("file", 1))//TODO FIX bug of the two the field files upload keep the request the second time hanging
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                Image: { type: 'string' },
            },
        }, description: "The photo relative URL without api prefix"
    })
    @ApiBadRequestResponse()
    @ApiConflictResponse()
    async handleUploadPhoto(
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUserDecorator() tokenPayLoad: TokenPayLoad
    ): Promise<ResponseType<{ Image: string }>> {
        if (!files || files?.length === 0) {
            throw new BadRequestException("Upload valid file")
        }

        const user: Users = await this.service.FindById(tokenPayLoad.UserId)
        const newPhotoPath = await this.fileServce.Update(
            files[0], ProfilePhotoFileOptions,
            user?.ProfilePhoto ? `${ProfilePhotoFileOptions.Dest}${user?.ProfilePhoto.split("/").pop()}` : null
            , true
        )
        user.ProfilePhoto = `/users/profile/photo/${newPhotoPath.FileName}`
        await this.service.Update(user.Id, user)

        return new ResponseType<{ Image: string }>(HttpStatus.CREATED, "Profile photo added successfully", { Image: user.ProfilePhoto })
    }

    @Delete('photo')
    @UseGuards(JWTGaurd)
    @ApiOkResponse()
    @ApiBadRequestResponse()
    @ApiBearerAuth()
    @ApiNotFoundResponse()
    async handleDelete(
        @CurrentUserDecorator() tokenPayLoad: TokenPayLoad
    ): Promise<ResponseType<void>> {

        const user: Users = await this.service.FindById(tokenPayLoad.UserId)
        if (!user.ProfilePhoto)
            throw new NotFoundException("You don't have profile photo")

        await this.fileServce.Remove(
            `${ProfilePhotoFileOptions.Dest}${user.ProfilePhoto.split("/").pop()}`,
            ProfilePhotoFileOptions,
            true
        )
        user.ProfilePhoto = null
        await this.service.Update(user.Id, user)

        return new ResponseType<void>(HttpStatus.OK, "Profile photo deleted successfully")
    }

    @Get('photo/:imagename')
    @UseGuards(JWTGaurd)
    @Header('Content-Type', 'application/octet-stream')
    @ApiOkResponse({
        description: 'Returns a file as an octet-stream',
        content: {
            'application/octet-stream': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiBearerAuth()
    @ApiNotFoundResponse()
    async handleGet(
        @Param("imagename") imagename: string
    ): Promise<StreamableFile> {
        return await this.fileServce.Get(`${ProfilePhotoFileOptions.Dest}${imagename}`, ProfilePhotoFileOptions)
    }

    @Get('photo')
    @UseGuards(JWTGaurd)
    @Header('Content-Type', 'application/octet-stream')
    @ApiOkResponse({
        description: 'Returns a file as an octet-stream',
        content: {
            'application/octet-stream': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiBearerAuth()
    @ApiNotFoundResponse()
    async handleGetImageByUser(
        @CurrentUserDecorator() user: TokenPayLoad
    ): Promise<StreamableFile> {
        const userDb = await this.service.FindById(user.UserId,true);
        if(!userDb.ProfilePhoto)
        {
            throw new NotFoundException("There is no photo")
        }

        return await this.fileServce.Get(`${ProfilePhotoFileOptions.Dest}${userDb.ProfilePhoto.split("/").pop()}`, ProfilePhotoFileOptions)
    }
}