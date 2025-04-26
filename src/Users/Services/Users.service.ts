import { GenericService } from "src/Common/Generic/GenericService";
import { Users } from "../Models/Users.entity";
import { IGenericRepo } from "src/Common/Generic/Contracts/IGenericRepo";
import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { UserLoginDto } from "../Dtos/UserLogin.dto";
import { AuthService } from "src/AuthModule/Services/Auth.service";
import { TokenReturnDto } from "src/AuthModule/Dtos/TokenReturn.dto";
import { InjectMapper } from "@automapper/nestjs";
import { Mapper } from "@automapper/core";
import { UserReturnDto } from "../Dtos/UserReturn.dto";
import { UpdatePasswordDto } from "../Dtos/UpdatePassword.dto";
import { VerificationService } from "src/AuthModule/Services/Verification.service";
import { INotification } from "src/Common/Generic/Contracts/INotificationService";
import { ResetPassTokenDto } from "../Dtos/ResetPassDtos";
import { use } from "passport";
import { VerificationCacheKeys } from "src/AuthModule/Dtos/VerificationType";
import { VerifyError } from "../Errors/VerifyError";
import { BadValidationException, ClassValidatorExceptionDto } from "src/Common/ClassValidatorException.dto";
import { Not } from "typeorm";

@Injectable({scope:Scope.REQUEST})
export class UsersService extends GenericService<Users>
{

    constructor(
        @Inject("REPO_USERS")
        private readonly userRepo:IGenericRepo<Users>,
        private readonly authService:AuthService,
        private readonly resetPassService:VerificationService,
        @InjectMapper()
        private readonly mapper:Mapper,
        @Inject(INotification)
        private readonly notificationService:INotification
    ) {
        super(userRepo)
    }

    NotFoundException: string = "This user doesn't exist";

    /**
     * Creates a new user with hashed password
     * @param dataToInsert - User data including plain text password
     * @returns Promise<Users> - Created user object
     */
    async Insert(dataToInsert: Users): Promise<Users> {
        const userWithExistingEmail:Users = await this.FindOne({
            Email:dataToInsert.Email
        },false) 

        if(userWithExistingEmail)
        {
            throw new BadValidationException(new ClassValidatorExceptionDto<Users>("Email already exists","Email"),HttpStatus.CONFLICT)
        }

        if(dataToInsert.StudentId)
        {
            const existingStudentId:Users = await this.FindOne({
                StudentId: dataToInsert.StudentId
            }, false);
        
            if (existingStudentId) {
                throw new BadValidationException(new ClassValidatorExceptionDto<Users>("Student Id already exists","StudentId"),HttpStatus.CONFLICT)
            }
        }

        dataToInsert.Password = await bcrypt.hash(dataToInsert.Password,await bcrypt.genSalt());
        return await super.Insert(dataToInsert)
    }

    /**
     * Update user
     * @param id - user id
     * @param updatedData - the user data to be updated
     * @returns Promise<Users> - Updated Users
     * @throws BadValidationException - if the student Id is already exist throw error
     * @throws NotFoundException - If user is not found
     */
    async Update(id: string, updatedData: Partial<Users>): Promise<Users> {
        const user = await this.FindById(id,true);

        if(updatedData.StudentId)
        {
            const existingStudentId:Users = await this.FindOne({
                StudentId: updatedData.StudentId,
                Id:Not(user.Id)
            }, false);

            if (existingStudentId) {
                throw new BadValidationException(new ClassValidatorExceptionDto<Users>("Student Id already exists","StudentId"),HttpStatus.CONFLICT)
            }
        }
    
        return await super.Update(user.Id,updatedData)
    }

    /**
     * Authenticates user and generates access token
     * @param dataToInsert - Login credentials (email and password)
     * @param ipAddress - Client IP address for token generation
     * @returns Promise<TokenReturnDto> - JWT token and user info
     * @throws BadRequestException - If credentials are invalid
     * @throws VerifyError - If email is not verified
     */
    async Login(dataToInsert: UserLoginDto,ipAddress:string): Promise<TokenReturnDto> {
        try
        {
            const user:Users = await this.FindByEmail(dataToInsert.Email);
            const isUserValid:boolean = await bcrypt.compare(dataToInsert.Password,user.Password);
            if(!isUserValid)
            {
                throw new BadRequestException();
            }
            if(!user.VerifyDate)
            {
                await this.SendVerification(user)
                throw new VerifyError()
            }
            const tokenData = await this.authService.SignIn(user,ipAddress)

            return new TokenReturnDto(
                tokenData.JWT,
                tokenData.TokenPayload.CreatedAt,
                tokenData.TokenPayload.ExpireDate,
                await this.mapper.mapAsync(user,Users,UserReturnDto)
            )
        }catch(err)
        {
            if(err instanceof BadRequestException || err instanceof NotFoundException)
                throw new BadRequestException("The Email or Password is Incorrect");
            throw err
        }
    }

    /**
     * Generates and sends verification token via email
     * @param user - User object requiring verification
     * @returns Promise<void>
     */
    async SendVerification(user:Users) : Promise<void>
    {
        const token = await this.resetPassService.SendToken(user.Email,user.Id,VerificationCacheKeys.SIGNUP)
        this.notificationService.SendVerifyLink(user.Email,token)
    }

    /**
     * Verifies user's email and generates login token
     * @param email - User's email address
     * @param token - Verification token from email
     * @param ipAddress - Client IP address for token generation
     * @returns Promise<TokenReturnDto> - JWT token and user info
     */
    async Verify(email:string,token:string,ipAddress:string) : Promise<TokenReturnDto>
    {
        const userId:string = await this.resetPassService.VerifyToken(email,token,VerificationCacheKeys.SIGNUP)
        const user:Users =  await this.repo.Update(userId,{VerifyDate:new Date()})
        const tokenData = await this.authService.SignIn(user,ipAddress)

        return new TokenReturnDto(
            tokenData.JWT,
            tokenData.TokenPayload.CreatedAt,
            tokenData.TokenPayload.ExpireDate,
            await this.mapper.mapAsync(user,Users,UserReturnDto)
        )
    }

    /**
     * Retrieves user by email address
     * @param email - User's email address
     * @returns Promise<Users> - User object if found
     * @throws NotFoundException - If user doesn't exist
     */
    async FindByEmail(email:string): Promise<Users> {
        return await this.FindOne({
            Email:email
        })
    }

    /**
     * Updates user's password after validating current password
     * @param userId - User's unique identifier
     * @param dto - Old and new password data
     * @returns Promise<void>
     * @throws BadRequestException - If old password is incorrect
     */
    async UpdatePassword(userId:string,dto:UpdatePasswordDto): Promise<void> {
        const user:Users = await this.FindById(userId)
        const isUserValid:boolean = await bcrypt.compare(dto.OldPassword,user.Password);
        if(!isUserValid)
        {
            throw new BadRequestException("Password is Incorrect");
        }
        const newPassword:string =  await bcrypt.hash(dto.NewPassword,await bcrypt.genSalt());
        await this.Update(userId,{Password:newPassword});
    }

    /**
     * Initiates password reset process by sending verification code
     * @param email - User's email address
     * @returns Promise<void>
     * Note: Always completes successfully (even for non-existent emails) to prevent email enumeration
     */
    async SendResetPassCode(email:string): Promise<void> {
        const user:Users | null = await this.FindOne({
            Email:email
        },false)

        if(user)
        {
            const code:number = await this.resetPassService.SendCode(user.Email,user.Id,VerificationCacheKeys.RESETPASS);
            this.notificationService.SendResetPass(user.Email,code)
        }else{
            await this.resetPassService.SendCode(email,null,VerificationCacheKeys.RESETPASS);
        }
    }

    /**
     * Validates reset password verification code
     * @param email - User's email address
     * @param code - Verification code received via email
     * @returns Promise<string> - Reset token for password change
     * @throws BadRequestException - If code is invalid
     */
    async ResetPassVerifyCode(email:string,code:number): Promise<string> {
       return await this.resetPassService.VerifyCode(email,code,VerificationCacheKeys.RESETPASS);
    }

    /**
     * Completes password reset using verified token
     * @param data - Reset password data including token and new password
     * @returns Promise<void>
     * @throws BadRequestException - If token is invalid
     */
    async ResetPass(data:ResetPassTokenDto): Promise<void> {
        const userId:string = await this.resetPassService.VerifyToken(data.Email,data.Token,VerificationCacheKeys.RESETPASS);

        const newPassword:string =  await bcrypt.hash(data.NewPassword,await bcrypt.genSalt());
        await this.Update(userId,{Password:newPassword});
    }
}