import { forwardRef, Inject, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpExceptionToWsException, SocketExceptionFilter } from './SocketExceptionFilter';
import { JoinChannelDto } from './Dtos/JoinChannel.dto';
import { JWTWSGuard } from 'src/AuthModule/Gaurds/JWTWS.gaurd';
import Redis from 'ioredis';
import { RedisProvidersEnum, RedisProvidersSubs } from 'src/Infrastructure/Events/EventConfig/RedisProviders';
import { DeletedChatDto, SentMessageChatDto, ThreadChatDto } from './Dtos/SentMessageChat.dto';


@WebSocketGateway({ cors: true })
@UseFilters(SocketExceptionFilter)
@UseFilters(HttpExceptionToWsException)
//@UseGuards(JWTWSGuard)
@UsePipes(new ValidationPipe())
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly jwtGaurd:JWTWSGuard = new JWTWSGuard()
    constructor(
        // @Inject(ISubTeamsMembersService)
        // private readonly membersService:ISubTeamsMembersService,
        @Inject(RedisProvidersEnum.SUB) 
        private redisSubClient: Redis,
    ) 
    { 
        redisSubClient.subscribe(RedisProvidersSubs.CHAT);
        redisSubClient.subscribe(RedisProvidersSubs.DELETED);
        redisSubClient.subscribe(RedisProvidersSubs.NEWTHREAD);
    }

    async afterInit(server: any) {
        this.redisSubClient.on("message", (channel, message) => {
            if (channel === RedisProvidersSubs.CHAT) 
            {
                const data:SentMessageChatDto = JSON.parse(message);
                this.server.to(`${data.ChannelId}_${data.ThreadId}`).emit(RedisProvidersSubs.CHAT, data.Message);
            }
            else if (channel === RedisProvidersSubs.DELETED) 
            {
                const data:DeletedChatDto = JSON.parse(message);
                this.server.to(`${data.ChannelId}_${data.ThreadId}`).emit(RedisProvidersSubs.DELETED, data.Message);
            }
            else if(channel === RedisProvidersSubs.NEWTHREAD){
                const data:ThreadChatDto = JSON.parse(message);
                this.server.to(`${data.ChannelId}_${null}`).emit(RedisProvidersSubs.NEWTHREAD, data.Thread);
            }
        });
    }


    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        const isValid:boolean = this.jwtGaurd.canActivate(null,client)
        if(!isValid)
        {
            client.disconnect(true)
        }
    }

    handleDisconnect(client: Socket) {
        //So when you're listing the rooms the client joined, you usually don't want to count their own ID as a room — because it's just the default private room created by Socket.IO.
        // const userRooms = Array.from(client.rooms).filter(r => r !== client.id);
        // userRooms.forEach((x)=>{
        //     this.handleRoomBasic(x,client,true)
        // })
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('JoinChannel')
    async handleJoinRoom(@MessageBody() data: JoinChannelDto, @ConnectedSocket() client: Socket) {
        data.ThreadId = data.ThreadId ? data.ThreadId : null
        const id = `${data.ChannelId}_${data.ThreadId}`

        this.handleRoomBasic(id,client,false)
    }

    @SubscribeMessage('LeaveChannel')
    async handleLeaveRoom(@MessageBody() data: JoinChannelDto, @ConnectedSocket() client: Socket) {
        data.ThreadId = data.ThreadId ? data.ThreadId : null
        const id = `${data.ChannelId}_${data.ThreadId}`

        this.handleRoomBasic(id,client,true)
    }

    private async handleRoomBasic(channelId:string, client: Socket,isLeave:boolean) {
        if(isLeave)
        {
            client.leave(channelId);
        }else
        {
            client.join(channelId);
        }

        const clients = await this.server.in(channelId).fetchSockets();
        const clientsSize = [...new Set(clients.map((item:any) => item?.user.UserId ))]
        this.server.to(channelId).emit('totalUsers', {Count:clientsSize.length});
    }
}