import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AIUrlService } from "./AIUrl.service";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports:[ConfigModule,HttpModule],
    providers:[AIUrlService],
    exports:[AIUrlService]
})
export class AIModule{}