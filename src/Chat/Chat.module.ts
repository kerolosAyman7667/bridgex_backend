import { Module } from '@nestjs/common';
import { ChatGateway } from './Chat.gateway';

@Module({
    imports: [],
    providers: [ChatGateway],
})
export class ChatModule { }
