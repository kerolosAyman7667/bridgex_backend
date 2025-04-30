import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventsConfigService } from "./EventConfig/Events.config";
import { RedisProviders } from "./EventConfig/RedisProviders";

@Module({
    imports:[ConfigModule,
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject:[ConfigService],
            useClass:EventsConfigService
        })
    ],
    providers:[...RedisProviders],
    exports:[...RedisProviders]
})
export class EventsModule{}