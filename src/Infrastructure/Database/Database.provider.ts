import { Injectable, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from 'dotenv';
config();

@Injectable({scope:Scope.TRANSIENT})
export class DatabaseProvider implements TypeOrmOptionsFactory{

    constructor(private readonly configService:ConfigService){}

    createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        return this.GetConfig()
    }

    GetConfig(connectionString:string = null): DataSourceOptions | TypeOrmModuleOptions{
        return { 
            url:connectionString ?? this.configService.getOrThrow<string>("DBCONNECTIONSTRING"),
            type:"mysql",
            entities: ['dist/**/*.{schema.ts,schema.js,entity.ts,entity.js}'],
            synchronize: false, 
            migrationsTableName: 'migration',
            migrations: [__dirname + '*/**/Migrations/*.js'],
            migrationsRun:process.env.NODE_ENV === "production",
            charset: 'utf8mb4',
        }
    }
}

export default new DataSource(new DatabaseProvider(new ConfigService()).GetConfig(process.env.DBCONNECTIONSTRING) as DataSourceOptions)