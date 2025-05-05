import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './Common/GlobalExceptionFilter';
import { ValidationError } from 'class-validator';
import { ResponseType } from './Common/ResponseType';
import { ClassValidatorExceptionDto } from './Common/ClassValidatorException.dto';
import { PostInterceptor } from './Common/PostInterceptor';
import { TrimPipe } from './Common/TrimPipe';
import { RedisProvidersEnum } from './Infrastructure/Events/EventConfig/RedisProviders';
import { RedisIoAdapter } from './Chat/RedisIoAdapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService)
  app.setGlobalPrefix("api")

  app.enableCors({
    origin:"*"
  })
  app.useGlobalInterceptors(new PostInterceptor())
  app.useGlobalPipes(new TrimPipe());

  app.use('/api/assets/learning/*', (req, res, next) => {
    res.status(404).json(new ResponseType(HttpStatus.NOT_FOUND,"path not found"))
  });

  
  app.use('/api/assets/profile/images/*', (req, res, next) => {
    res.status(404).json(new ResponseType(HttpStatus.NOT_FOUND,"path not found"))
  });

  app.useGlobalPipes(new ValidationPipe({
    transform:true,
    forbidNonWhitelisted:true,
    whitelist:true,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      return new ResponseType<any>(
        HttpStatus.BAD_REQUEST,
        "Please Enter Valid Data",
        validationErrors.map(
          (error):ClassValidatorExceptionDto<any> => (
            new ClassValidatorExceptionDto(Object.values(error.constraints).join(', '),error.property)
          )),
        "BadRequestException"
      );
    }
  }))

  const redisIoAdapter = new RedisIoAdapter(
    app,
    app.get(RedisProvidersEnum.PUB),
    app.get(RedisProvidersEnum.SUB),
  );
  app.useWebSocketAdapter(redisIoAdapter);
  
  app.useGlobalFilters(new GlobalExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('BridgeX')
    .setDescription('BridgeX1110 API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(configService.getOrThrow<number>("PORT"));
}
bootstrap();
