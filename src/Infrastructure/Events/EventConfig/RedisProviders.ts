import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export enum RedisProvidersEnum {
  PUB = 'REDIS_PUB_CLIENT',
  SUB = 'REDIS_SUB_CLIENT'
}

export enum RedisProvidersSubs {
  CHAT = 'chat',
  DELETED="chat_deleted",
  NEWTHREAD="chat_thread"
}

export const RedisProviders: Provider[] = [
  {
    provide: RedisProvidersEnum.PUB,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const redisUrl = configService.getOrThrow<string>("REDISURL");
      return new Redis(redisUrl);
    },
  },
  {
    provide: RedisProvidersEnum.SUB,
    useFactory: (configService: ConfigService) => {
      const redisUrl = configService.getOrThrow<string>("REDISURL");
      return new Redis(redisUrl);
    },
    inject: [ConfigService],
  }
];



