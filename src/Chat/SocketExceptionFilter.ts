import { Catch, ArgumentsHost, WsExceptionFilter, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { ClassValidatorExceptionDto } from 'src/Common/ClassValidatorException.dto';
import { ResponseType } from 'src/Common/ResponseType';

@Catch(WsException)
export class SocketExceptionFilter implements WsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    //const data = host.switchToWs().getData();
    const error: any = exception.getError();

    const response = new ResponseType(
      error?.statusCode ?? 400,
      error?.message ?? "Error has happened try again later",
      null,
      exception?.name
    )

    client.emit('Error', response);
  }
}

@Catch(HttpException)
export class HttpExceptionToWsException extends BaseWsExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {

    console.log(exception instanceof ClassValidatorExceptionDto);
    const properException = new WsException(exception.getResponse());
    new SocketExceptionFilter().catch(properException, host);
  }
}
