import { Injectable, Scope } from "@nestjs/common";
import { JwtConfigService } from "./JwtConfig.service";
import { JwtService } from "@nestjs/jwt";
import { Users } from "src/Users/Models/Users.entity";
import { TokenPayLoad } from "../Dtos/TokenPayload";
import { ConfigService } from "@nestjs/config";

@Injectable({scope:Scope.REQUEST})
export class AuthService{
    constructor(
        private readonly configService:ConfigService,
        private readonly jwtConfig:JwtConfigService,
        private readonly jwtService:JwtService,
    ) {}

    async SignIn(user:Users,ipAddress:string) : Promise<{JWT:string,TokenPayload:TokenPayLoad}>
    {
        const timeDuration:number = this.configService.getOrThrow<number>("JWTEXPIREDURATION")
        const timeType:string = this.configService.getOrThrow<string>("JWTEXPIREDURATIONTYPE")

        const payload:TokenPayLoad = new TokenPayLoad(user.Id,user.FirstName,user.Email,user.IsSuperAdmin,timeDuration,timeType)
        const config = this.jwtConfig.GetConfig()
        const keys = this.jwtConfig.GetKeys()

        const jwt:string = await this.jwtService.signAsync({payload},{
            audience: config.audience,
            algorithm: config.algorithms[0],
            privateKey: keys.privateKey,
            issuer: config.issuer as string,
            expiresIn: `${timeDuration}${timeType}`,
            jwtid:payload.TokendId,
        })

        return {JWT:jwt,TokenPayload:payload};
    }

    async SignInWithSecret(user:Users|TokenPayLoad) : Promise<{JWT:string,TokenPayload:TokenPayLoad}>
    {
        const timeDuration:number = this.configService.getOrThrow<number>("JWTEXPIREDURATION")
        const timeType:string = this.configService.getOrThrow<string>("JWTEXPIREDURATIONTYPE")
        const secret:string = this.configService.getOrThrow<string>("JWTSECRET")


        const payload:TokenPayLoad = user instanceof Users 
        ? 
        new TokenPayLoad(user.Id,user.FirstName,user.Email,user.IsSuperAdmin,timeDuration,timeType) 
        : 
        new TokenPayLoad(user.UserId,null,null,null,timeDuration,timeType)
        
        const config = this.jwtConfig.GetConfig()

        const jwt:string = await this.jwtService.signAsync({payload},{
            audience: config.audience,
            algorithm: "HS256",
            issuer: config.issuer as string,
            secret:secret,
            expiresIn: `${timeDuration}${timeType}`,
            jwtid:payload.TokendId,
        })

        return {JWT:jwt,TokenPayload:payload};
    }
}