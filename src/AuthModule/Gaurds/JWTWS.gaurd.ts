import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { JwtConfigService } from '../Services/JwtConfig.service';
import { Socket } from 'socket.io';

@Injectable()
export class JWTWSGuard implements CanActivate {
    private readonly config: JwtConfigService = new JwtConfigService();

    canActivate(context?: ExecutionContext,clientSocket?:Socket): boolean {
        const client = clientSocket ? clientSocket : context.switchToWs().getClient();
        const token = client.handshake?.headers?.token;

        if (!token) throw new WsException('Missing auth token');

        try {
            const decoded:any = jwt.verify(token,this.config.GetKeys().publicKey,this.config.GetConfig());
            client.user = decoded.payload; // Attach user info to socket
            return true;
        } catch (err) {
            throw new WsException('Invalid or expired token');
        }
    }
}
