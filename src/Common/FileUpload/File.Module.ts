import { Global, Module } from "@nestjs/common";
import { IFileServiceProvider } from "./IFile.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Global()
@Module({
  imports:[ConfigModule,HttpModule],
  providers: [IFileServiceProvider],
  exports: [IFileServiceProvider]
})
export class FileModule {}