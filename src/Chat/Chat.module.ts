import { Module } from '@nestjs/common';
import { ChatGateway } from './Chat.gateway';
import { EventsModule } from 'src/Infrastructure/Events/Events.module';
import { SubTeamsModule } from 'src/SubTeams/SubTeams.module';

@Module({
    imports: [EventsModule,SubTeamsModule],
    providers: [ChatGateway],
})
export class ChatModule { }
