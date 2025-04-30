// redis-io.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext, Inject } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { RedisProvidersEnum } from 'src/Infrastructure/Events/EventConfig/RedisProviders';

export class RedisIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    @Inject(RedisProvidersEnum.PUB) private readonly pubClient: Redis,
    @Inject(RedisProvidersEnum.SUB) private readonly subClient: Redis,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(createAdapter(this.pubClient, this.subClient));
    return server;
  }
}