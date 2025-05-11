import { Global, Module } from "@nestjs/common";
import { IFileServiceProvider } from "./IFile.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { VideoTranscodingService } from "./VideoTranscoding.service";

@Global()
@Module({
  imports:[ConfigModule,HttpModule],
  providers: [IFileServiceProvider,VideoTranscodingService],
  exports: [IFileServiceProvider,VideoTranscodingService]
})
export class FileModule {}