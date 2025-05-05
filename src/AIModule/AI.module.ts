import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { IAIUrlServiceProvider } from "./IAIUrl.service";

@Module({
    imports:[ConfigModule,HttpModule],
    providers:[IAIUrlServiceProvider],
    exports:[IAIUrlServiceProvider]
})
export class AIModule{}