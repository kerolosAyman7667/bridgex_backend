import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JWTSecretGuard implements CanActivate{
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request?.query?.token;
        if(!token)
        {
            return false
        }

        try {
            const decoded:any = jwt.verify(token,process.env.JWTSECRET);
            request.user = decoded.payload; 
            return true;
        } catch (err) {
            return false;
        }

    }

}