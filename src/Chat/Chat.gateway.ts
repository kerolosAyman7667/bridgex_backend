import { NotFoundException, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { HttpExceptionToWsException, SocketExceptionFilter } from './SocketExceptionFilter';
import { JoinChannelDto } from './Dtos/JoinChannel.dto';
import { JWTWSGuard } from 'src/AuthModule/Gaurds/JWTWS.gaurd';




@WebSocketGateway({ cors: true })
@UseFilters(SocketExceptionFilter)
@UseFilters(HttpExceptionToWsException)
@UseGuards(JWTWSGuard)
@UsePipes(new ValidationPipe())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('JoinChannel')
    handleJoinRoom(@MessageBody() data: JoinChannelDto, @ConnectedSocket() client: Socket) {
        client.join(data.ChannelId);
        client.to(data.ChannelId).emit('userJoined', `User ${client.id} joined room ${data.ChannelId}`);
    }

    @SubscribeMessage('LeaveChannel')
    handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
        client.leave(data.room);
        client.to(data.room).emit('userLeft', `User ${client.id} left room ${data.room}`);
    }

    @SubscribeMessage('SendMessage')
    handleMessage(
        @MessageBody() data: { room: string; message: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.to(data.room).emit('receiveMessage', {
            sender: client.id,
            message: data.message,
        });
    }
}
